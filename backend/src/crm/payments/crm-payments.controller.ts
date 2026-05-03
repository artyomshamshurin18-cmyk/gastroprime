import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CrmPaymentsService } from './crm-payments.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/payments')
export class CrmPaymentsController {
  constructor(private readonly paymentsService: CrmPaymentsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.findAll(req.user, {
      companyId,
      startDate,
      endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('company/:companyId')
  async getCompanyFinance(@Param('companyId') companyId: string) {
    return this.paymentsService.getCompanyFinance(companyId);
  }

  @Post()
  async create(@Request() req, @Body() data: {
    companyId: string;
    amount: number;
    type?: string;
    method?: string;
    description?: string;
    date?: string;
  }) {
    return this.paymentsService.create(req.user, data);
  }
}
