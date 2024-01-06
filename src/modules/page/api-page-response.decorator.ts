import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageEntity } from './page.entity';

export const ApiPageResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PageResponseOf${model.name}`, // 👈 add title to the schema
        allOf: [
          { $ref: getSchemaPath(PageEntity) },
          {
            properties: {
              edges: {
                type: 'array',
                title: `EdgeOf${model.name}`, // 👈 add title to the schema
                items: {
                  type: 'object',
                  required: ['cursor', 'node'],
                  properties: {
                    cursor: { type: 'string' },
                    node: { type: 'object', $ref: getSchemaPath(model) },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};