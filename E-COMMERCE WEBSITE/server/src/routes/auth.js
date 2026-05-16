import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import express from 'express';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw createError(409, 'An account with that email already exists.');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
}));

// POST /api/auth/login
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createError(401, 'Invalid email or password.');
  if (!user.isActive) throw createError(401, 'Account has been deactivated.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid email or password.');

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken,
    },
  });
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError(401, 'Refresh token required.');

  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid or expired refresh token.');
  }

  // Check DB
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw createError(401, 'Refresh token revoked or expired.');
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: decoded.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
  });
}));

// POST /api/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ success: true, data: null });
}));

// GET /api/auth/me
router.get('/me', isAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      avatar: true, stripeCustomerId: true, createdAt: true,
      addresses: true,
    },
  });
  res.json({ success: true, data: { user } });
}));

export default router;
