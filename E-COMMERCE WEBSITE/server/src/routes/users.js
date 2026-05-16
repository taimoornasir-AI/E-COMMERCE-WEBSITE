import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin } from '../middleware/auth.js';
import { validate, updateProfileSchema, createAddressSchema } from '../middleware/validate.js';
import { uploadAvatar, deleteFromCloudinary } from '../services/cloudinary.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/users — Admin: list all users
router.get('/', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  // Get total spend per user
  const userIds = users.map(u => u.id);
  const spends = await prisma.order.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, paymentStatus: 'PAID' },
    _sum: { total: true },
  });
  const spendMap = Object.fromEntries(spends.map(s => [s.userId, s._sum.total || 0]));

  const enriched = users.map(u => ({ ...u, totalSpend: spendMap[u.id] || 0, orderCount: u._count.orders }));

  res.json({ success: true, data: enriched, meta: { total, page: pageNum, limit: limitNum } });
}));

// GET /api/users/:id — Get user profile
router.get('/:id', isAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN' && req.user.id !== id) throw createError(403, 'Access denied.');

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, avatar: true,
      isActive: true, createdAt: true, stripeCustomerId: true,
      addresses: { orderBy: { isDefault: 'desc' } },
      _count: { select: { orders: true, wishlist: true } },
    },
  });
  if (!user) throw createError(404, 'User not found.');

  res.json({ success: true, data: user });
}));

// PUT /api/users/:id — Update profile
router.put('/:id', isAuth, validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN' && req.user.id !== id) throw createError(403, 'Access denied.');

  const { name, email, currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createError(404, 'User not found.');

  // Password change
  if (newPassword) {
    if (!currentPassword) throw createError(400, 'Current password required.');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw createError(400, 'Current password is incorrect.');
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(newPassword && { passwordHash: await bcrypt.hash(newPassword, saltRounds) }),
    },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });

  res.json({ success: true, data: updated });
}));

// POST /api/users/:id/avatar — Upload avatar
router.post('/:id/avatar', isAuth, upload.single('avatar'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) throw createError(403, 'Access denied.');
  if (!req.file) throw createError(400, 'No file uploaded.');

  const user = await prisma.user.findUnique({ where: { id } });
  if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);

  const result = await uploadAvatar(req.file.buffer);
  const updated = await prisma.user.update({
    where: { id },
    data: { avatar: result.secure_url, avatarPublicId: result.public_id },
    select: { id: true, avatar: true },
  });

  res.json({ success: true, data: updated });
}));

// Admin: update role / deactivate
router.patch('/:id/role', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['CUSTOMER', 'ADMIN'].includes(role)) throw createError(400, 'Invalid role.');
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ success: true, data: updated });
}));

router.patch('/:id/deactivate', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false },
    select: { id: true, name: true, isActive: true },
  });
  res.json({ success: true, data: updated });
}));

// ─── Addresses ──────────────────────────────────────────────────────────────
router.get('/:id/addresses', isAuth, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') throw createError(403, 'Access denied.');
  const addresses = await prisma.address.findMany({
    where: { userId: req.params.id },
    orderBy: { isDefault: 'desc' },
  });
  res.json({ success: true, data: addresses });
}));

router.post('/:id/addresses', isAuth, validate(createAddressSchema), asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw createError(403, 'Access denied.');

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.params.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...req.body, userId: req.params.id },
  });
  res.status(201).json({ success: true, data: address });
}));

router.delete('/:id/addresses/:addressId', isAuth, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) throw createError(403, 'Access denied.');
  await prisma.address.deleteMany({ where: { id: req.params.addressId, userId: req.params.id } });
  res.json({ success: true, data: null });
}));

export default router;
