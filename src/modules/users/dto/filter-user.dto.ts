import { FilterDto } from '@src/common/dtos/search-filter.dto';
export enum FilterUserEnum {
  ID = 'id',
  EMAIL = 'email',
}

export class FilterUsersDto extends FilterDto<FilterUserEnum> {}
