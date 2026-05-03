import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CrmDealsController } from './crm-deals.controller';
import { CrmDealsService } from './crm-deals.service';

@Module({
  controllers: [CrmDealsController],
  providers: [CrmDealsService, PrismaService],
  exports: [CrmDealsService],
})
export class CrmDealsModule {}
