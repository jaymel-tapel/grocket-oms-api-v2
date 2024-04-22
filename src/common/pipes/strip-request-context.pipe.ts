import { Injectable, PipeTransform } from '@nestjs/common';
import { isEmpty, omit } from 'lodash';
import { REQUEST_CONTEXT } from '../interceptors/inject-user.interceptor';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    if (!isEmpty(value._requestContext)) {
      delete value._requestContext;
    }
    return value;
  }
}
