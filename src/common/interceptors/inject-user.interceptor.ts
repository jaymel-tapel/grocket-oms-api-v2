import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

export const REQUEST_CONTEXT = '_requestContext';

type Nullable<T> = T | null | undefined;

@Injectable()
export class InjectUserInterceptor implements NestInterceptor {
  constructor(private type?: Nullable<'query' | 'body' | 'params'>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    if (this.type && request[this.type]) {
      request[this.type][REQUEST_CONTEXT] = {
        user: request.user,
      };
    }

    return next.handle();
  }
}
