import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async softDelete() {
    return this.$extends(
      createSoftDeleteExtension({
        models: {
          User: true,
          AlternateEmail: true,
        },
        defaultConfig: {
          field: 'deletedAt',
          createValue: (deleted) => {
            if (deleted) return new Date();
            return null;
          },
        },
      }),
    );
  }

  async onModuleInit() {
    return await this.$connect();
  }

  async onModuleDestroy() {
    return await this.$disconnect();
  }
}
