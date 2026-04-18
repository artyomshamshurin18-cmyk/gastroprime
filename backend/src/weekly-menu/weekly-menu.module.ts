import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { WeeklyMenuController } from './weekly-menu.controller';
import { WeeklyMenuService } from './weekly-menu.service';

@Module({
  imports: [PrismaModule],
  controllers: [WeeklyMenuController],
  providers: [WeeklyMenuService]
})
export class WeeklyMenuModule {}
