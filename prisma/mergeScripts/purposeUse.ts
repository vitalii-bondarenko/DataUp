import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lots = await prisma.lot.findMany();
  console.log(lots);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
