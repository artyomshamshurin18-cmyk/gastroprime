import { Module } from '@nestjs/common';
import { CrmTasksController } from './crm-tasks.controller';
import { CrmTasksService } from './crm-tasks.service';

@Module({
  controllers: [CrmTasksController],
  providers: [CrmTasksService],
  exports: [CrmTasksService],
})
export class CrmTasksModule {}
