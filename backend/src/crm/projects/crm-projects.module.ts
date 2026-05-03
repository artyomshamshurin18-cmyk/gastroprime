import { Module } from '@nestjs/common';
import { CrmProjectsController } from './crm-projects.controller';
import { CrmProjectsService } from './crm-projects.service';

@Module({
  controllers: [CrmProjectsController],
  providers: [CrmProjectsService],
  exports: [CrmProjectsService],
})
export class CrmProjectsModule {}
