import { Prisma } from '@prisma/client';
import {
  DynamicClientExtensionThis,
  InternalArgs,
} from '@prisma/client/runtime/library';

export type PrismaDynamicClient = DynamicClientExtensionThis<
  Prisma.TypeMap<
    InternalArgs & {
      result: {};
      model: {};
      query: {};
      client: {};
    }
  >,
  Prisma.TypeMapCb,
  {
    result: {};
    model: {};
    query: {};
    client: {};
  }
>;
