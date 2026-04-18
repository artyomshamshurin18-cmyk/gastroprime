import { Module } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { PrismaModule } from '../common/prisma.module';
import { DailyMenuController } from './daily-menu.controller';
import { DailyMenuService } from './daily-menu.service';

@Module({
  imports: [PrismaModule],
  controllers: [DailyMenuController],
  providers: [DailyMenuService, AdminGuard]
})
export class DailyMenuModule {}
