import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PRODUCTS = [
  {
    name: 'Obsidian Leather Jacket',
    slug: 'obsidian-leather-jacket',
    description: 'A masterpiece of Italian craftsmanship. Full-grain vegetable-tanned leather with a hand-stitched interior lining. Develops a unique patina over time.',
    price: 895.00, compareAtPrice: 1200.00,
    tags: ['leather', 'outerwear', 'italian', 'luxury'],
    variants: [
      { name: 'S / Black', size: 'S', color: 'Black', stock: 8 },
      { name: 'M / Black', size: 'M', color: 'Black', stock: 12 },
      { name: 'L / Black', size: 'L', color: 'Black', stock: 6 },
      { name: 'XL / Black', size: 'XL', color: 'Black', stock: 4 },
    ],
  },
  {
    name: 'Cormorant Silk Blouse',
    slug: 'cormorant-silk-blouse',
    description: 'Woven from 22-momme mulberry silk. The fluid drape creates an effortlessly elevated silhouette suitable for any occasion.',
    price: 285.00, compareAtPrice: null,
    tags: ['silk', 'blouse', 'luxury', 'feminine'],
    variants: [
      { name: 'XS / Ivory', size: 'XS', color: 'Ivory', stock: 15 },
      { name: 'S / Ivory', size: 'S', color: 'Ivory', stock: 20 },
      { name: 'M / Ivory', size: 'M', color: 'Ivory', stock: 18 },
      { name: 'S / Champagne', size: 'S', color: 'Champagne', stock: 10 },
      { name: 'M / Champagne', size: 'M', color: 'Champagne', stock: 12 },
    ],
  },
  {
    name: 'Merino Cashmere Overcoat',
    slug: 'merino-cashmere-overcoat',
    description: 'A 70/30 merino-cashmere blend overcoat with horn buttons and a structured silhouette. Dry clean only.',
    price: 1250.00, compareAtPrice: 1600.00,
    tags: ['cashmere', 'overcoat', 'winter', 'luxury'],
    variants: [
      { name: 'S / Camel', size: 'S', color: 'Camel', stock: 5 },
      { name: 'M / Camel', size: 'M', color: 'Camel', stock: 7 },
      { name: 'L / Camel', size: 'L', color: 'Camel', stock: 6 },
      { name: 'M / Charcoal', size: 'M', color: 'Charcoal', stock: 8 },
      { name: 'L / Charcoal', size: 'L', color: 'Charcoal', stock: 5 },
    ],
  },
  {
    name: 'Velvet Chelsea Boots',
    slug: 'velvet-chelsea-boots',
    description: 'Hand-crafted in Spain from crushed velvet with a leather sole. Elastic side gussets for a perfect fit.',
    price: 480.00, compareAtPrice: 580.00,
    tags: ['boots', 'velvet', 'footwear', 'luxury'],
    variants: [
      { name: '38 / Midnight', size: '38', color: 'Midnight', stock: 4 },
      { name: '39 / Midnight', size: '39', color: 'Midnight', stock: 6 },
      { name: '40 / Midnight', size: '40', color: 'Midnight', stock: 8 },
      { name: '41 / Midnight', size: '41', color: 'Midnight', stock: 5 },
      { name: '42 / Midnight', size: '42', color: 'Midnight', stock: 3 },
    ],
  },
  {
    name: 'Linen Wide-Leg Trousers',
    slug: 'linen-wide-leg-trousers',
    description: 'Pre-washed Belgian linen for an instantly relaxed feel. High-rise waist with a wide, flowing leg.',
    price: 195.00, compareAtPrice: null,
    tags: ['linen', 'trousers', 'summer', 'relaxed'],
    variants: [
      { name: 'XS / Sand', size: 'XS', color: 'Sand', stock: 14 },
      { name: 'S / Sand', size: 'S', color: 'Sand', stock: 18 },
      { name: 'M / Sand', size: 'M', color: 'Sand', stock: 16 },
      { name: 'L / Sand', size: 'L', color: 'Sand', stock: 10 },
      { name: 'S / Slate', size: 'S', color: 'Slate', stock: 12 },
      { name: 'M / Slate', size: 'M', color: 'Slate', stock: 14 },
    ],
  },
  {
    name: 'Gold-Plated Cuff Bracelet',
    slug: 'gold-plated-cuff-bracelet',
    description: '18k gold-plated brass cuff with a hammered texture. A statement piece that transitions from day to evening.',
    price: 145.00, compareAtPrice: null,
    tags: ['jewelry', 'bracelet', 'gold', 'accessories'],
    variants: [
      { name: 'One Size / Gold', size: 'One Size', color: 'Gold', stock: 25 },
      { name: 'One Size / Silver', size: 'One Size', color: 'Silver', stock: 20 },
    ],
  },
  {
    name: 'Structured Canvas Tote',
    slug: 'structured-canvas-tote',
    description: 'Heavy-duty 24oz canvas with leather handles and a cotton drill lining. The only bag you\'ll need.',
    price: 165.00, compareAtPrice: null,
    tags: ['bag', 'tote', 'canvas', 'accessories'],
    variants: [
      { name: 'One Size / Natural', size: 'One Size', color: 'Natural', stock: 30 },
      { name: 'One Size / Black', size: 'One Size', color: 'Black', stock: 25 },
    ],
  },
  {
    name: 'Ribbed Knit Midi Dress',
    slug: 'ribbed-knit-midi-dress',
    description: 'A fine-gauge rib knit dress with a body-skimming silhouette and a subtle slit at the hem.',
    price: 320.00, compareAtPrice: 400.00,
    tags: ['dress', 'knit', 'midi', 'luxury'],
    variants: [
      { name: 'XS / Espresso', size: 'XS', color: 'Espresso', stock: 6 },
      { name: 'S / Espresso', size: 'S', color: 'Espresso', stock: 9 },
      { name: 'M / Espresso', size: 'M', color: 'Espresso', stock: 8 },
      { name: 'S / Ecru', size: 'S', color: 'Ecru', stock: 10 },
      { name: 'M / Ecru', size: 'M', color: 'Ecru', stock: 7 },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@luxeshop.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@luxeshop.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create demo customer
  const customerHash = await bcrypt.hash('Customer1234!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@luxeshop.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'customer@luxeshop.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
    },
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // Create categories
  const apparelCat = await prisma.category.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: { name: 'Apparel', slug: 'apparel', description: 'Curated clothing for the discerning wardrobe.', order: 1 },
  });

  const accessoriesCat = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', description: 'The details that define an outfit.', order: 2 },
  });

  const outerwearCat = await prisma.category.upsert({
    where: { slug: 'outerwear' },
    update: {},
    create: { name: 'Outerwear', slug: 'outerwear', parentId: apparelCat.id, order: 1 },
  });

  const dressesBlousesCat = await prisma.category.upsert({
    where: { slug: 'dresses-blouses' },
    update: {},
    create: { name: 'Dresses & Blouses', slug: 'dresses-blouses', parentId: apparelCat.id, order: 2 },
  });

  const bottomsCat = await prisma.category.upsert({
    where: { slug: 'bottoms' },
    update: {},
    create: { name: 'Bottoms', slug: 'bottoms', parentId: apparelCat.id, order: 3 },
  });

  const jewelryCat = await prisma.category.upsert({
    where: { slug: 'jewelry' },
    update: {},
    create: { name: 'Jewelry', slug: 'jewelry', parentId: accessoriesCat.id, order: 1 },
  });

  const bagsCat = await prisma.category.upsert({
    where: { slug: 'bags' },
    update: {},
    create: { name: 'Bags', slug: 'bags', parentId: accessoriesCat.id, order: 2 },
  });

  const shoesCat = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: { name: 'Shoes', slug: 'shoes', parentId: accessoriesCat.id, order: 3 },
  });

  console.log('✅ Categories created');

  // Category mapping
  const categoryMap = {
    'obsidian-leather-jacket': outerwearCat.id,
    'cormorant-silk-blouse': dressesBlousesCat.id,
    'merino-cashmere-overcoat': outerwearCat.id,
    'velvet-chelsea-boots': shoesCat.id,
    'linen-wide-leg-trousers': bottomsCat.id,
    'gold-plated-cuff-bracelet': jewelryCat.id,
    'structured-canvas-tote': bagsCat.id,
    'ribbed-knit-midi-dress': dressesBlousesCat.id,
  };

  // Placeholder image URLs (using picsum for demo)
  const imageUrls = {
    'obsidian-leather-jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'cormorant-silk-blouse': 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&q=80',
    'merino-cashmere-overcoat': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    'velvet-chelsea-boots': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'linen-wide-leg-trousers': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    'gold-plated-cuff-bracelet': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    'structured-canvas-tote': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'ribbed-knit-midi-dress': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  };

  // Create products
  for (const productData of DEMO_PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice,
          categoryId: categoryMap[productData.slug],
          tags: productData.tags,
          isActive: true,
          images: {
            create: [{
              url: imageUrls[productData.slug],
              publicId: `demo/${productData.slug}`,
              order: 0,
            }],
          },
          variants: { create: productData.variants },
        },
      });
      console.log(`  📦 Product: ${product.name}`);
    }
  }

  // Create a demo coupon
  await prisma.coupon.upsert({
    where: { code: 'LUXE20' },
    update: {},
    create: {
      code: 'LUXE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrder: 200,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      discountType: 'FIXED',
      discountValue: 50,
      minOrder: 150,
      isActive: true,
    },
  });

  console.log('✅ Coupons created: LUXE20, WELCOME50');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin: admin@luxeshop.com / Admin1234!');
  console.log('   Customer: customer@luxeshop.com / Customer1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
