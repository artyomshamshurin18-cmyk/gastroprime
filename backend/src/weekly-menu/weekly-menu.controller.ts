import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WeeklyMenuService } from './weekly-menu.service';

@Controller('weekly-menu')
@UseGuards(AuthGuard('jwt'))
export class WeeklyMenuController {
  constructor(private weeklyMenuService: WeeklyMenuService) {}

  @Get('my')
  async getMyWeeklyMenu(@Request() req, @Query('start') start: string, @Query('end') end: string) {
    return this.weeklyMenuService.getMyWeeklyMenu(req.user.userId, start, end);
  }

  @Post()
  async createOrUpdate(@Request() req, @Body() data: {
    startDate: string;
    endDate: string;
    selections: {
      date: string;
      dishIds?: string[];
      items?: { dishId: string; quantity: number }[];
      utensils: number;
      needBread: boolean;
      notes?: string;
    }[];
  }) {
    return this.weeklyMenuService.createOrUpdate(req.user.userId, data);
  }

  @Patch(':id/confirm')
  async confirm(@Request() req, @Param('id') id: string) {
    return this.weeklyMenuService.confirm(req.user.userId, id);
  }

  @Patch(':id/day/:date/quantity')
  async updateQuantity(@Request() req, @Param('id') weeklyMenuId: string, @Param('date') date: string, @Body() data: { dishId: string; quantity: number }) {
    return this.weeklyMenuService.updateQuantity(req.user.userId, weeklyMenuId, date, data);
  }

  @Delete(':id')
  async deleteWeeklyMenu(@Request() req, @Param('id') id: string) {
    return this.weeklyMenuService.deleteWeeklyMenu(req.user.userId, id);
  }

  @Delete(':id/day/:date')
  async deleteWeeklyMenuDay(@Request() req, @Param('id') id: string, @Param('date') date: string) {
    return this.weeklyMenuService.deleteWeeklyMenuDay(req.user.userId, id, date);
  }
}
