import { Module } from '@nestjs/common';
import { CrmDealsModule } from './deals/crm-deals.module';
import { CrmLeadsModule } from './leads/crm-leads.module';
import { CrmTasksModule } from './tasks/crm-tasks.module';
import { CrmRoutesModule } from './routes/crm-routes.module';
import { CrmPaymentsModule } from './payments/crm-payments.module';
import { CrmDashboardModule } from './dashboard/crm-dashboard.module';
import { CrmProjectsModule } from './projects/crm-projects.module';

@Module({
  imports: [
    CrmDealsModule,
    CrmLeadsModule,
    CrmTasksModule,
    CrmRoutesModule,
    CrmPaymentsModule,
    CrmDashboardModule,
    CrmProjectsModule,
  ],
  exports: [
    CrmDealsModule,
    CrmLeadsModule,
    CrmTasksModule,
    CrmRoutesModule,
    CrmPaymentsModule,
    CrmDashboardModule,
    CrmProjectsModule,
  ],
})
export class CrmModule {}
