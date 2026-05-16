import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin, optionalAuth } from '../middleware/auth.js';
import { validate, createProductSchema, updateProductSchema } from '../middleware/validate.js';
import { uploadProductImages, deleteFromCloudinary } from '../services/cloudinary.js';
import { generateSlug } from '../utils/slug.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: build product where clause from query
const buildProductWhere = (query) => {
  const { search, categoryId, minPrice, maxPrice, inStock, tags, isActive } = query;
  const where = {};

  if (isActive !== undefined) where.isActive = isActive === 'true';
  else where.isActive = true; // Default to active only for customers

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    where.tags = { hasSome: tagArray };
  }

  if (inStock === 'true') {
    where.variants = { some: { stock: { gt: 0 } } };
  }

  return where;
};

// GET /api/products
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, sort = 'createdAt', order = 'desc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Admin can see all, customers only see active
  const where = req.user?.role === 'ADMIN'
    ? buildProductWhere({ ...req.query, isActive: req.query.isActive })
    : buildProductWhere(req.query);

  // Sort mapping
  const sortMap = {
    price: { price: order },
    newest: { createdAt: 'desc' },
    name: { name: order },
    createdAt: { createdAt: order },
  };
  const orderBy = sortMap[sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, stock: true, price: true, size: true, color: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  // Add computed fields
  const enriched = products.map(p => ({
    ...p,
    averageRating: p.reviews.length
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : null,
    reviewCount: p._count.reviews,
    totalSold: p._count.orderItems,
    inStock: p.variants.some(v => v.stock > 0),
  }));

  res.json({
    success: true,
    data: enriched,
    meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}));

// GET /api/products/:id (by id or slug)
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      ...(req.user?.role !== 'ADMIN' && { isActive: true }),
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: { include: { parent: { select: { id: true, name: true, slug: true } } } },
      variants: { orderBy: { name: 'asc' } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true, orderItems: true, wishlist: true } },
    },
  });

  if (!product) throw createError(404, 'Product not found.');

  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  res.json({
    success: true,
    data: {
      ...product,
      averageRating,
      reviewCount: product._count.reviews,
      totalSold: product._count.orderItems,
      wishlistCount: product._count.wishlist,
      inStock: product.variants.some(v => v.stock > 0),
    },
  });
}));

// POST /api/products — Admin only
router.post('/',
  isAuth, isAdmin,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    let body;
    try {
      body = JSON.parse(req.body.data || '{}');
    } catch {
      body = req.body;
    }

    // Validate
    const parsed = createProductSchema.safeParse({ body });
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: 'Validation failed', details: parsed.error.errors });
    }

    const { name, description, price, compareAtPrice, sku, barcode, categoryId, tags, isActive, variants } = parsed.data.body;

    // Generate slug
    let slug = generateSlug(name);
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    // Upload images to Cloudinary
    let uploadedImages = [];
    if (req.files?.length) {
      uploadedImages = await uploadProductImages(req.files);
    }

    const product = await prisma.product.create({
      data: {
        name, slug, description, price, compareAtPrice, sku, barcode,
        categoryId, tags, isActive,
        images: {
          create: uploadedImages.map((img, i) => ({
            url: img.secure_url,
            publicId: img.public_id,
            order: i,
          })),
        },
        variants: {
          create: variants,
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    res.status(201).json({ success: true, data: product });
  })
);

// PUT /api/products/:id — Admin only
router.put('/:id', isAuth, isAdmin, upload.array('images', 10), asyncHandler(async (req, res) => {
  const { id } = req.params;

  let body;
  try {
    body = JSON.parse(req.body.data || '{}');
  } catch {
    body = req.body;
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw createError(404, 'Product not found.');

  // Upload new images
  let newImages = [];
  if (req.files?.length) {
    newImages = await uploadProductImages(req.files);
  }

  // Delete removed images
  if (body.deletedImageIds?.length) {
    for (const publicId of body.deletedImageIds) {
      await deleteFromCloudinary(publicId);
    }
    await prisma.productImage.deleteMany({ where: { publicId: { in: body.deletedImageIds } } });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...body,
      ...(newImages.length && {
        images: {
          create: newImages.map((img, i) => ({
            url: img.secure_url,
            publicId: img.public_id,
            order: (body.existingImagesCount || 0) + i,
          })),
        },
      }),
    },
    include: { images: { orderBy: { order: 'asc' } }, variants: true, category: true },
  });

  res.json({ success: true, data: updated });
}));

// DELETE /api/products/:id — Admin only
router.delete('/:id', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) throw createError(404, 'Product not found.');

  // Delete images from Cloudinary
  for (const img of product.images) {
    await deleteFromCloudinary(img.publicId);
  }

  await prisma.product.delete({ where: { id } });

  res.json({ success: true, data: null });
}));

// POST /api/products/bulk — Admin bulk actions
router.post('/bulk', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { action, ids, value } = req.body;
  if (!ids?.length) throw createError(400, 'No product IDs provided.');

  switch (action) {
    case 'delete':
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
      break;
    case 'setCategory':
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { categoryId: value } });
      break;
    case 'toggleActive':
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: value === true } });
      break;
    default:
      throw createError(400, `Unknown bulk action: ${action}`);
  }

  res.json({ success: true, data: { affected: ids.length } });
}));

export default router;
