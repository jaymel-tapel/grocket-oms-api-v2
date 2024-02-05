import { Injectable } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as Handlebars from 'handlebars';

const handlebarsHelpers = {
  eq: (v1, v2) => v1 === v2,
  neq: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and() {
    return Array.prototype.every.call(arguments, Boolean);
  },
  or() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  regexMatch: (value, pattern, options) => {
    const regexObj = new RegExp(pattern);
    return regexObj.test(value);
  },
};

@Injectable()
export class CustomHandlebarsAdapter extends HandlebarsAdapter {
  constructor() {
    super();
    this.registerCustomHelpers();
  }

  private registerCustomHelpers() {
    Handlebars.registerHelper(handlebarsHelpers);
  }
}
