import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { DailyMenuModule } from './daily-menu/daily-menu.module';
import { WeeklyMenuModule } from './weekly-menu/weekly-menu.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    MenuModule,
    OrdersModule,
    AdminModule,
    ChatModule,
    DailyMenuModule,
    WeeklyMenuModule,
  ],
})
export class AppModule {}
