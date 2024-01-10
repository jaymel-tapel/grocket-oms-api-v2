import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

@UseGuards(JwtGuard)
@ApiTags('tasks')
@Controller('tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Post()
  @UseGuards(CaslGuard)
  @CheckAbilities({ action: Action.Create, subject: TaskEntity })
  async create(
    @AuthUser() user: UserEntity,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.create(user, createTaskDto);
  }

  @Get()
  async findAll() {}

  @Get(':id')
  async findOne(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ability = await this.abilityFactory.defineAbility(authUser);
    const task = await this.tasksService.findUniqueOrThrow({
      where: { id },
      include: { taskAccountants: true, taskSellers: true },
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {}

  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: number) {}
}
