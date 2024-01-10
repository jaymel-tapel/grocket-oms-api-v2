import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const roundsOfHashing = 10;

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  let admin, accountant;
  // create two dummy users
  const passwordAdmin = await bcrypt.hash('grocketseller', roundsOfHashing);
  const passwordAccountant = await bcrypt.hash('asdfzxcv', roundsOfHashing);

  const foundAdmin = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' },
  });

  const foundAccountant = await prisma.user.findFirst({
    where: { email: 'accountant@gmail.com' },
  });

  if (!foundAdmin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        name: 'Admin',
        role: 'ADMIN',
        password: passwordAdmin,
      },
    });
  }

  if (!foundAccountant) {
    accountant = await prisma.user.create({
      data: {
        email: 'accountant@gmail.com',
        name: 'Accountant',
        role: 'ACCOUNTANT',
        password: passwordAccountant,
      },
    });
  }

  console.log({ admin, accountant });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
