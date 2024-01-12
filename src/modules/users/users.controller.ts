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
import { AbilityFactory, Action } from '@modules/casl/ability.factory';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { ForbiddenError } from '@casl/ability';
import { JwtGuard } from '@modules/auth/guard';
import { CaslGuard } from '@modules/casl/ability.guard';
import { CheckAbilities } from '@modules/casl/ability.decorator';
import { ApiOffsetPageResponse } from '@modules/offset-page/api-offset-page-response.decorator';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';

@UseGuards(JwtGuard)
@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(PageEntity)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get()
  @ApiOffsetPageResponse(UserEntity)
  @UseGuards(CaslGuard)
  @CheckAbilities({ action: Action.Read, subject: UserEntity })
  async findAll(
    @Query() filterArgs: FilterUsersDto,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    return await this.usersService.findAllByOffset(
      filterArgs,
      offsetPageArgsDto,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ability = await this.abilityFactory.defineAbility(authUser);

    ForbiddenError.from(ability).throwUnlessCan(Action.Create, UserEntity);

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
