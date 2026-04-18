import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyMenuService } from './daily-menu.service';
import { AdminGuard } from '../common/admin.guard';

@Controller('daily-menu')
@UseGuards(AuthGuard('jwt'))
export class DailyMenuController {
  constructor(private dailyMenuService: DailyMenuService) {}

  @Get('by-date')
  async getByDate(@Request() req, @Query('date') date: string) {
    return this.dailyMenuService.getByDate(req.user.userId, date);
  }

  @Get('by-range')
  async getByRange(@Request() req, @Query('start') start: string, @Query('end') end: string) {
    return this.dailyMenuService.getByRange(req.user.userId, start, end);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createOrUpdate(@Body() data: { date: string; items: { dishId: string; maxQuantity: number; sortOrder: number }[] }) {
    return this.dailyMenuService.createOrUpdate(data);
  }

  @Delete(':date')
  @UseGuards(AdminGuard)
  async delete(@Param('date') date: string) {
    return this.dailyMenuService.delete(date);
  }
}
