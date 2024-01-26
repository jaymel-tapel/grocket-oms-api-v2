import { Prisma } from '@prisma/client';

export const clientIncludeHelper = () => {
  let include: Prisma.ClientInclude = {
    clientInfo: true,
    seller: true,
  };

  return include;
};
