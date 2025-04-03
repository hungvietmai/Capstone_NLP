import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.suggestion.createMany({
    data: [
      { text: 'Viêm phổi cấp' },
      { text: 'Sốt xuất huyết' },
      { text: 'Tiểu đường' },
      { text: 'Cao huyết áp' },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('✅ Seed complete');
  })
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });