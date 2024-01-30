import { Prisma } from '@prisma/client';

export const orderIncludeHelper = () => {
  let include: Prisma.OrderInclude = {
    client: {
      include: { clientInfo: true, seller: true },
    },
    company: true,
    orderReviews: true,
  };

  return include;
};