import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiPageResponse } from '@modules/page/api-page-response.decorator';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';
import { FilterUsersDto } from './dto/filter-user.dto';
import { PageEntity } from '@modules/page/page.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(PageEntity)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get()
  @ApiPageResponse(UserEntity)
  async findAll(
    @Query() filterArgs: FilterUsersDto,
    @Query() connectionArgs: ConnectionArgsDto,
  ) {
    return await this.usersService.findAllPagination(
      filterArgs,
      connectionArgs,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.findUniqueOrThrow(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new UserEntity(await this.usersService.update(id, updateUserDto));
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.remove(id));
  }

  @Patch('restore/:id')
  @ApiOkResponse({ type: UserEntity })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.usersService.restore(id));
  }
}
