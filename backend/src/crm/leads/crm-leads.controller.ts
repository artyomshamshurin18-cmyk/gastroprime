import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CrmLeadsService } from './crm-leads.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/leads')
export class CrmLeadsController {
  constructor(private readonly leadsService: CrmLeadsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('source') source?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.findAll(req.user, {
      search,
      source,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Post()
  async create(@Request() req, @Body() data: {
    companyName: string;
    deliveryAddress?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    employeesCount?: number;
    avgOrder?: number;
    status?: string;
    source?: string;
    notes?: string;
    managerId?: string;
  }) {
    return this.leadsService.create(req.user, data);
  }
}
