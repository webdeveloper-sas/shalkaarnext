import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Create categories
  console.log('Creating categories...');
  const formals = await prisma.category.upsert({
    where: { name: 'Formals' },
    update: {},
    create: { name: 'Formals' },
  });

  const casuals = await prisma.category.upsert({
    where: { name: 'Casuals' },
    update: {},
    create: { name: 'Casuals' },
  });

  const sarees = await prisma.category.upsert({
    where: { name: 'Sarees' },
    update: {},
    create: { name: 'Sarees' },
  });

  const unstitched = await prisma.category.upsert({
    where: { name: 'Unstitched' },
    update: {},
    create: { name: 'Unstitched' },
  });

  // Create sample products
  console.log('Creating sample products...');

  const products = [
    {
      name: 'Embroidered Formal Kurta',
      description: 'Beautiful handcrafted embroidered kurta perfect for formal occasions. Made with premium cotton fabric with intricate embroidery work.',
      basePrice: 4999,
      stock: 15,
      categoryId: formals.id,
    },
    {
      name: 'Casual Cotton Shirt',
      description: 'Comfortable everyday cotton shirt suitable for casual wear. Breathable fabric with perfect fit.',
      basePrice: 1999,
      stock: 25,
      categoryId: casuals.id,
    },
    {
      name: 'Traditional Silk Saree',
      description: 'Elegant traditional silk saree with gold borders. Perfect for weddings and celebrations.',
      basePrice: 8999,
      stock: 8,
      categoryId: sarees.id,
    },
    {
      name: 'Luxury Lawn Print',
      description: 'High-quality lawn fabric with digital prints. Soft and breathable for summer collection.',
      basePrice: 3499,
      stock: 20,
      categoryId: unstitched.id,
    },
    {
      name: 'Designer Formal Shirt',
      description: 'Premium formal shirt with subtle patterns. Perfect for professional wear and formal events.',
      basePrice: 3299,
      stock: 18,
      categoryId: formals.id,
    },
    {
      name: 'Cotton Casual T-Shirt',
      description: 'Comfortable 100% cotton t-shirt in various colors. Perfect for everyday wear.',
      basePrice: 999,
      stock: 50,
      categoryId: casuals.id,
    },
    {
      name: 'Embroidered Saree',
      description: 'Beautiful embroidered saree with detailed work. Ideal for festivals and special occasions.',
      basePrice: 6999,
      stock: 10,
      categoryId: sarees.id,
    },
    {
      name: 'Printed Lawn Fabric',
      description: 'Beautiful printed lawn fabric with vibrant colors. Great for summer dresses and casual wear.',
      basePrice: 2499,
      stock: 30,
      categoryId: unstitched.id,
    },
    {
      name: 'Premium Linen Kurta',
      description: 'Elegant linen kurta with traditional embroidery. Cool and comfortable for all seasons.',
      basePrice: 5499,
      stock: 12,
      categoryId: formals.id,
    },
    {
      name: 'Checkered Casual Shirt',
      description: 'Classic checkered casual shirt for everyday wear. Comfortable fit and easy to style.',
      basePrice: 1799,
      stock: 28,
      categoryId: casuals.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `product-${product.name}` },
      update: {},
      create: {
        id: `product-${product.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        stock: product.stock,
        categoryId: product.categoryId,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📦 Created ${products.length} products across 4 categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
