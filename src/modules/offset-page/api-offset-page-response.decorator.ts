import { OrderEntity } from '@modules/orders/entities/order.entity';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const ApiOffsetPageResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  const schema: SchemaObject & Partial<ReferenceObject> = {
    title: `PaginatedResponseOf${model.name}`,
    allOf: [
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
      {
        properties: {
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              lastPage: { type: 'number' },
              currentPage: { type: 'number' },
              perPage: { type: 'number' },
              prev: { type: 'number' },
              next: { type: 'number' },
            },
          },
        },
      },
    ],
  };

  // Conditionally include OrderRevenueSummaryEntity in the schema
  if (model === OrderEntity) {
    schema.allOf.push({
      properties: {
        order_revenue_summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            unpaid_invoices: { type: 'number' },
            paid_commission: { type: 'number' },
            current_commission: { type: 'number' },
          },
        },
      },
    });
  }

  return applyDecorators(ApiExtraModels(model), ApiOkResponse({ schema }));
};
