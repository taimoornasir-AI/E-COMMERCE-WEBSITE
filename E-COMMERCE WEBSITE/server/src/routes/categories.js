import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin } from '../middleware/auth.js';
import { validate, createCategorySchema } from '../middleware/validate.js';
import { uploadCategoryImage, deleteFromCloudinary } from '../services/cloudinary.js';
import { generateSlug } from '../utils/slug.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/categories
router.get('/', asyncHandler(async (req, res) => {
  const { flat } = req.query;

  if (flat === 'true') {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return res.json({ success: true, data: categories });
  }

  // Hierarchical: only top-level with children
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
        orderBy: { order: 'asc' },
      },
      _count: { select: { products: true } },
    },
    orderBy: { order: 'asc' },
  });

  res.json({ success: true, data: categories });
}));

// GET /api/categories/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const cat = await prisma.category.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    include: {
      children: { where: { isActive: true }, orderBy: { order: 'asc' } },
      parent: true,
      _count: { select: { products: true } },
    },
  });
  if (!cat) throw createError(404, 'Category not found.');
  res.json({ success: true, data: cat });
}));

// POST /api/categories
router.post('/', isAuth, isAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  let body = req.body;
  const { name, description, parentId, order } = body;

  let slug = generateSlug(name);
  const slugExists = await prisma.category.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  let image, imagePublicId;
  if (req.file) {
    const result = await uploadCategoryImage(req.file.buffer);
    image = result.secure_url;
    imagePublicId = result.public_id;
  }

  const category = await prisma.category.create({
    data: {
      name, slug, description,
      parentId: parentId || null,
      order: parseInt(order) || 0,
      image, imagePublicId,
    },
  });

  res.status(201).json({ success: true, data: category });
}));

// PUT /api/categories/:id
router.put('/:id', isAuth, isAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing) throw createError(404, 'Category not found.');

  let image = existing.image;
  let imagePublicId = existing.imagePublicId;
  if (req.file) {
    if (existing.imagePublicId) await deleteFromCloudinary(existing.imagePublicId);
    const result = await uploadCategoryImage(req.file.buffer);
    image = result.secure_url;
    imagePublicId = result.public_id;
  }

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: { ...req.body, image, imagePublicId },
  });

  res.json({ success: true, data: updated });
}));

// DELETE /api/categories/:id
router.delete('/:id', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!cat) throw createError(404, 'Category not found.');

  if (cat.imagePublicId) await deleteFromCloudinary(cat.imagePublicId);
  await prisma.category.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: null });
}));

// PUT /api/categories/reorder — Update display order
router.put('/reorder', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { items } = req.body; // [{id, order}]
  await Promise.all(items.map(item =>
    prisma.category.update({ where: { id: item.id }, data: { order: item.order } })
  ));
  res.json({ success: true, data: null });
}));

export default router;
