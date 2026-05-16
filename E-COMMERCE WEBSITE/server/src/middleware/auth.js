import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';
import prisma from '../lib/prisma.js';

export const isAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(createError(401, 'No token provided.'));
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) return next(createError(401, 'User not found.'));
    if (!user.isActive) return next(createError(401, 'Account is deactivated.'));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const isAdmin = (req, _res, next) => {
  if (!req.user) return next(createError(401, 'Not authenticated.'));
  if (req.user.role !== 'ADMIN') return next(createError(403, 'Admin access required.'));
  next();
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (user && user.isActive) req.user = user;
    next();
  } catch {
    // Token invalid but optional — continue without user
    next();
  }
};
