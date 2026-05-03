import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CrmDashboardController } from './crm-dashboard.controller';
import { CrmDashboardService } from './crm-dashboard.service';

@Module({
  controllers: [CrmDashboardController],
  providers: [CrmDashboardService, PrismaService],
  exports: [CrmDashboardService],
})
export class CrmDashboardModule {}
