const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@omnistore.com' },
    update: {},
    create: {
      email: 'admin@omnistore.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  });
  
  console.log('Created Admin User:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
