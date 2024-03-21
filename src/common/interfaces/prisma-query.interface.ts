export interface IPrismaOptionsQuery {
  withTrashed?: boolean;
}

export interface IPrismaOptionsManyQuery extends IPrismaOptionsQuery {
  latest?: boolean;
}
