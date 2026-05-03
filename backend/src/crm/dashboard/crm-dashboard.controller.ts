import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CrmDashboardService } from './crm-dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/dashboard')
export class CrmDashboardController {
  constructor(private readonly dashboardService: CrmDashboardService) {}

  @Get('overview')
  async getOverview(@Request() req, @Query('date') date?: string) {
    return this.dashboardService.getOverview(date);
  }

  @Get('funnel')
  async getFunnel(@Request() req) {
    return this.dashboardService.getFunnel();
  }

  @Get('production')
  async getProduction(@Request() req, @Query('date') date?: string) {
    return this.dashboardService.getProduction(date);
  }
}
