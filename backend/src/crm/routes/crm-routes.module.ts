import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CrmRoutesController } from './crm-routes.controller';
import { CrmRoutesService } from './crm-routes.service';

@Module({
  controllers: [CrmRoutesController],
  providers: [CrmRoutesService, PrismaService],
  exports: [CrmRoutesService],
})
export class CrmRoutesModule {}
