import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CrmProjectsService } from './crm-projects.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/projects')
export class CrmProjectsController {
  constructor(private readonly projectsService: CrmProjectsService) {}

  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.projectsService.findAll(req.user, status);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(req.user, id);
  }

  @Post()
  async create(@Request() req, @Body() data: {
    name: string;
    description?: string;
    companyId?: string;
    dealId?: string;
    color?: string;
    endDate?: string;
  }) {
    return this.projectsService.create(req.user, data);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: {
    name?: string;
    description?: string;
    status?: string;
    color?: string;
    endDate?: string;
  }) {
    return this.projectsService.update(req.user, id, data);
  }

  @Patch(':id/archive')
  async archive(@Request() req, @Param('id') id: string) {
    return this.projectsService.archive(req.user, id);
  }

  @Patch(':id/complete')
  async complete(@Request() req, @Param('id') id: string) {
    return this.projectsService.complete(req.user, id);
  }
@Patch(":id/restore")
  async restore(@Request() req, @Param("id") id: string) {    return this.projectsService.restore(req.user, id);  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.projectsService.delete(req.user, id);
  }

  // Members
  @Get(':id/members')
  async getMembers(@Request() req, @Param('id') id: string) {
    return this.projectsService.getMembers(req.user, id);
  }

  @Post(':id/members')
  async addMember(@Request() req, @Param('id') id: string, @Body() data: { userId: string; role: string }) {
    return this.projectsService.addMember(req.user, id, data);
  }

  @Delete(':id/members/:memberId')
  async removeMember(@Request() req, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.projectsService.removeMember(req.user, id, memberId);
  }
}
