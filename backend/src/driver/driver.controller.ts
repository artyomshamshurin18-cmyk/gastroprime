import { Controller, Get, Post, Patch, UseGuards, Request, Param, Body, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DriverGuard } from '../common/driver.guard';
import { DriverService } from './driver.service';

@Controller('driver')
@UseGuards(AuthGuard('jwt'), DriverGuard)
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Get('routes')
  async getRoutes(@Request() req, @Query('date') date: string) {
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    return this.driverService.getRoutes(req.user.userId, effectiveDate);
  }

  @Patch('routes/:companyId/status')
  async updateDeliveryStatus(
    @Request() req,
    @Param('companyId') companyId: string,
    @Body() body: { date: string; deliveryStatus: string; driverNote?: string },
  ) {
    const effectiveDate = body.date || new Date().toISOString().slice(0, 10);
    return this.driverService.updateDeliveryStatus(
      req.user.userId,
      companyId,
      effectiveDate,
      body.deliveryStatus,
      body.driverNote,
    );
  }

  @Patch('routes/:companyId/notes')
  async updateNote(
    @Request() req,
    @Param('companyId') companyId: string,
    @Body() body: { date?: string; driverNote: string },
  ) {
    const effectiveDate = body.date || new Date().toISOString().slice(0, 10);
    return this.driverService.updateNote(
      req.user.userId,
      companyId,
      effectiveDate,
      body.driverNote,
    );
  }

  @Get('kitchen-summary')
  async getKitchenSummary(
    @Request() req,
    @Query('date') date: string,
    @Query('statuses') statuses: string,
  ) {
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    return this.driverService.getKitchenSummary(req.user.userId, effectiveDate, statuses || 'PENDING,CONFIRMED,PREPARING,COMPLETED');
  }
}
