import { Prisma } from '@prisma/client';

export const clientIncludeHelper = (
  clientInfoArgs?: Prisma.Client$clientInfoArgs,
) => {
  let include: Prisma.ClientInclude = {
    clientInfo: clientInfoArgs ?? true,
    seller: true,
  };

  return include;
};
