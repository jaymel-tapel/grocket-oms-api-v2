import { PickType } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';

export class FilterConversationDto extends PickType(FilterDto, ['keyword']) {}
