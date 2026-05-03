import { Module } from '@nestjs/common';
import { CrmLeadsController } from './crm-leads.controller';
import { CrmLeadsService } from './crm-leads.service';

@Module({
  controllers: [CrmLeadsController],
  providers: [CrmLeadsService],
  exports: [CrmLeadsService],
})
export class CrmLeadsModule {}
