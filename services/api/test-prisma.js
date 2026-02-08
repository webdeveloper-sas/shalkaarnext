const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.product.findMany();
    console.log('✅ Connection successful!');
    console.log('Products found:', products.length);
    console.log('Products:', JSON.stringify(products, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

test();
