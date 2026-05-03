import { generateAccountNumber } from "../../common/utils/account-number";
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CrmLeadsService {
  constructor(private prisma: PrismaService) {}

  private async ensureCanManage(user: any): Promise<boolean> {
    if (["SUPERADMIN", "ADMIN", "MANAGER", "CRM_OPERATOR"].includes(user.role)) return true;
    throw new ForbiddenException('Только ADMIN или MANAGER могут управлять лидами');
  }

  async create(user: any, data: {
    companyName: string;
    deliveryAddress?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    employeesCount?: number;
    avgOrder?: number;
    minPrice?: number;
    maxPrice?: number;
    workDays?: number;
    status?: string;
    source?: string;
    notes?: string;
    managerId?: string;
  }) {
    await this.ensureCanManage(user);

    if (!data.companyName || data.companyName.trim() === '') {
      throw new BadRequestException('Название компании обязательно');
    }

    // Phone is stored in Company.phone

    // Create company
    const company = await this.prisma.company.create({
      data: {
        name: data.companyName,
        address: data.deliveryAddress || '',
        contactPerson: data.contactPerson || null,
        workEmail: data.email || null,
        peopleCount: data.employeesCount || null,
        phone: data.phone || null,
        notes: data.notes || null,
        status: 'CRM_LEAD',
        accountNumber: generateAccountNumber(),
      },
    });

    const managerId = data.managerId || user.userId;

    // Create deal linked to company
    const deal = await this.prisma.crmDeal.create({
      data: {
        company: { connect: { id: company.id } },
        manager: { connect: { id: managerId } },
        source: data.source || 'COLD',
        notes: data.notes || null,
        estimatedAmount: data.avgOrder || 0,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        workDays: data.workDays,
        stage: 'LEAD',
        probability: 10,
      },
    });

    // Auto-log creation
    await this.prisma.crmDealLog.create({
      data: {
        dealId: deal.id,
        userId: user.userId,
        action: 'OTHER',
        comment: 'Лид создан через форму создания',
      },
    });

    return deal;
  }

  async findAll(user: any, filters: {
    search?: string;
    source?: string;
    page: number;
    limit: number;
  }) {
    await this.ensureCanManage(user);

    const where: any = {};
    if (filters.search) {
      where.OR = [
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
        { company: { contactPerson: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters.source && filters.source !== 'ALL') {
      where.source = filters.source;
    }

    // MANAGER sees only own leads
    if (user.role === 'MANAGER') {
      where.managerId = user.userId;
    }

    const [deals, total] = await Promise.all([
      this.prisma.crmDeal.findMany({
        where,
        include: {
          company: {
            select: {
              id: true, name: true, contactPerson: true, address: true,
              workEmail: true, peopleCount: true, status: true, notes: true,
            },
          },
          manager: { select: { id: true, email: true, firstName: true, lastName: true } },
          _count: { select: { logs: true } },
        },
        orderBy: [{ updatedAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.crmDeal.count({ where }),
    ]);

    return { deals, total, page: filters.page, limit: filters.limit };
  }
}
