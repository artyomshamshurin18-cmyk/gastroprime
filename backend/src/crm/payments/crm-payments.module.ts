import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CrmPaymentsController } from './crm-payments.controller';
import { CrmPaymentsService } from './crm-payments.service';

@Module({
  controllers: [CrmPaymentsController],
  providers: [CrmPaymentsService, PrismaService],
  exports: [CrmPaymentsService],
})
export class CrmPaymentsModule {}
