import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@modules/auth/guard';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CaslGuard } from '@modules/casl/ability.guard';
import { CheckAbilities } from '@modules/casl/ability.decorator';
import { AbilityFactory, Action } from '@modules/casl/ability.factory';
import { TaskEntity } from './entities/task.entity';
import { ForbiddenError } from '@casl/ability';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PageEntity } from '@modules/page/page.entity';
import { CreatedByEnum } from '@prisma/client';
import { taskIncludeHelper } from './helpers/task-include.helper';
import { FetchCompletedTasksDto } from './dto/fetch-completed-tasks.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';

@UseGuards(JwtGuard)
@ApiTags('tasks')
@Controller('tasks')
@ApiBearerAuth()
@ApiExtraModels(PageEntity)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Post()
  @UseGuards(CaslGuard)
  @ApiCreatedResponse({ type: TaskEntity })
  @CheckAbilities({ action: Action.Create, subject: TaskEntity })
  async create(
    @AuthUser() user: UserEntity,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.create(user, createTaskDto);
  }

  @Get()
  @UseGuards(CaslGuard)
  @CheckAbilities({ action: Action.Read, subject: TaskEntity })
  async findAll(
    @AuthUser() authUser: UserEntity,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
    @Query() { completed }: FetchCompletedTasksDto,
  ) {
    return await this.tasksService.findAllWithPagination(
      authUser,
      offsetPageArgsDto,
      completed,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskEntity })
  async findOne(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ability = await this.abilityFactory.defineAbility(authUser);
    const task = await this.tasksService.findUniqueOrThrow({
      where: { id, createdBy: authUser.role as CreatedByEnum },
      include: taskIncludeHelper(authUser, { includeTaskNotes: true }),
    });

    ForbiddenError.from(ability).throwUnlessCan(Action.Read, task);

    return task;
  }

  @Patch(':id')
  async update(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.update(authUser, id, updateTaskDto);
  }

  @Patch('complete/:id')
  @ApiOkResponse({ type: TaskEntity })
  async setCompleteTask(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.tasksService.updateTaskStatus(id, authUser);
  }

  @Patch('active/:id')
  @ApiOkResponse({ type: TaskEntity })
  async setActiveTask(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.tasksService.updateTaskStatus(id, authUser, true);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskEntity })
  async remove(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new TaskEntity(await this.tasksService.remove(id, user));
  }

  @Patch('restore/:id')
  @ApiOkResponse({ type: TaskEntity })
  async restore(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new TaskEntity(await this.tasksService.restore(id, authUser));
  }
}
