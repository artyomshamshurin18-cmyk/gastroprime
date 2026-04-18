import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyCompany(@Request() req) {
    return this.companiesService.findByUserId(req.user.userId);
  }
}
