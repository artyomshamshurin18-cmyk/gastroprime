import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CrmRoutesService } from './crm-routes.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/routes')
export class CrmRoutesController {
  constructor(private readonly routesService: CrmRoutesService) {}

  @Get()
  async findAll(@Request() req, @Query('date') date?: string, @Query('status') status?: string) {
    return this.routesService.findAll(req.user, { date, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  async create(@Request() req, @Body() data: {
    date: string;
    driverName: string;
    driverPhone?: string;
    vehicleInfo?: string;
    notes?: string;
  }) {
    return this.routesService.create(req.user, data);
  }

  @Post(':id/generate-today')
  async generateTodayRoutes(@Request() req, @Param('id') id: string) {
    return this.routesService.generateTodayStops(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.routesService.update(id, data);
  }

  @Patch('stops/:stopId')
  async updateStop(@Param('stopId') stopId: string, @Body() data: { status?: string; notes?: string }) {
    return this.routesService.updateStop(stopId, data);
  }

  @Post('stops/:stopId/deliver')
  async markDelivered(@Param('stopId') stopId: string) {
    return this.routesService.markDelivered(stopId);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string) {
    return this.routesService.complete(id);
  }
}
