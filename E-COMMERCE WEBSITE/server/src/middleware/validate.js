import { z } from 'zod';

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Auth Schemas ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// ─── Product Schemas ───────────────────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().cuid(),
    tags: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
    variants: z.array(z.object({
      name: z.string(),
      size: z.string().optional(),
      color: z.string().optional(),
      stock: z.number().int().min(0).default(0),
      sku: z.string().optional(),
      price: z.number().positive().optional(),
      lowStockThreshold: z.number().int().min(0).default(5),
    })).min(1),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    compareAtPrice: z.number().positive().optional().nullable(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().cuid().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Category Schemas ──────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    parentId: z.string().cuid().optional().nullable(),
    order: z.number().int().default(0),
  }),
});

// ─── Order Schemas ─────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().cuid().optional(),
    shippingSnapshot: z.object({
      firstName: z.string(),
      lastName: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    }).optional(),
    guestEmail: z.string().email().optional(),
    couponCode: z.string().optional(),
    paymentIntentId: z.string().optional(),
    items: z.array(z.object({
      variantId: z.string().cuid(),
      quantity: z.number().int().positive(),
    })).min(1),
  }),
});

// ─── Cart Schemas ──────────────────────────────────────────────────────────
export const cartItemSchema = z.object({
  body: z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().positive(),
  }),
});

// ─── Review Schemas ────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(100).optional(),
    body: z.string().max(2000).optional(),
  }),
  params: z.object({ id: z.string().cuid() }),
});

// ─── Coupon Schemas ────────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrder: z.number().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

// ─── User Schemas ──────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(128).optional(),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().default('Home'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default('US'),
    phone: z.string().optional(),
    isDefault: z.boolean().default(false),
  }),
});
