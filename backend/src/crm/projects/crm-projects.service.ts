import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CrmProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any, statusFilter?: string) {
    const where: any = {};
    
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    return this.prisma.crmProject.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: any, id: string) {
    const project = await this.prisma.crmProject.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        company: { select: { id: true, name: true } },

      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(user: any, data: {
    name: string;
    description?: string;
    companyId?: string;
    dealId?: string;
    color?: string;
    endDate?: string;
  }) {
    return this.prisma.crmProject.create({
      data: {
        name: data.name,
        description: data.description,
        companyId: data.companyId,
        dealId: data.dealId,
        color: data.color,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        _count: { select: { members: true } },
      },
    });
  }

  async update(user: any, id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    color?: string;
    endDate?: string;
  }) {
    const project = await this.prisma.crmProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    const updateData: any = { ...data };
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    return this.prisma.crmProject.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

  async archive(user: any, id: string) {
    const project = await this.prisma.crmProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.crmProject.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

  async complete(user: any, id: string) {
    const project = await this.prisma.crmProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.crmProject.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

async restore(user: any, id: string) {
    const project = await this.prisma.crmProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException("Project not found");
    return this.prisma.crmProject.update({
      where: { id },
      data: { status: "ACTIVE" },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }
  async delete(user: any, id: string) {
    const project = await this.prisma.crmProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.crmProject.delete({ where: { id } });
  }

  // Members
  async addMember(user: any, projectId: string, data: { userId: string; role: string }) {
    const project = await this.prisma.crmProject.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.crmProjectMember.create({
      data: { projectId, userId: data.userId, role: data.role ?? 'MEMBER' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async removeMember(user: any, projectId: string, memberId: string) {
    const member = await this.prisma.crmProjectMember.findUnique({ where: { id: memberId } });
    if (!member || member.projectId !== projectId) throw new NotFoundException('Member not found');
    return this.prisma.crmProjectMember.delete({ where: { id: memberId } });
  }

  async getMembers(user: any, projectId: string) {
    return this.prisma.crmProjectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }
}
