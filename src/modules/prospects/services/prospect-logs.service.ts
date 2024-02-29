import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateProspectLogDto } from '../dto/create-prospect-log.dto';

@Injectable()
export class ProspectLogsService {
  constructor(private readonly database: DatabaseService) {}

  async createLog(
    id: number,
    authUser: UserEntity,
    createOrderLogDto: CreateProspectLogDto,
  ) {
    const { action, templateId } = createOrderLogDto;

    const templateObj = await this.database.prospectTemplate.findFirst({
      where: { id: templateId },
      select: { name: true },
    });

    return await this.database.prospectLog.create({
      data: {
        prospect: { connect: { id } },
        by: authUser.email,
        action,
        template: templateObj.name,
      },
    });
  }
}
