import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CrmPaymentsService {
  constructor(private prisma: PrismaService) {}

  private async ensureAccess(user: any) {
    if (!["SUPERADMIN", "ADMIN", "CRM_OPERATOR"].includes(user.role)) {
      throw new ForbiddenException('Только ADMIN может управлять финансами');
    }
  }

  async findAll(user: any, filters: {
    companyId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    await this.ensureAccess(user);

    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.crmPayment.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.crmPayment.count({ where }),
    ]);

    return { items, total, page: filters.page, limit: filters.limit };
  }

  async getCompanyFinance(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, balance: true, creditBalance: true, limit: true },
    });
    if (!company) throw new Error('Компания не найдена');

    // Get recent payments
    const payments = await this.prisma.crmPayment.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    // Calculate total debt (credit + unpaid orders)
    const unpaidOrders = await this.prisma.order.aggregate({
      where: { companyId, status: { in: ['PENDING', 'CONFIRMED', 'DEFERRED'] } },
      _sum: { totalAmount: true },
    });

    return {
      company: { id: company.id, name: company.name },
      balance: company.balance,
      creditBalance: company.creditBalance,
      limit: company.limit,
      debt: (company.creditBalance || 0) + (unpaidOrders._sum.totalAmount || 0),
      recentPayments: payments,
    };
  }

  async create(user: any, data: {
    companyId: string;
    amount: number;
    type?: string;
    method?: string;
    description?: string;
    date?: string;
  }) {
    await this.ensureAccess(user);

    const payment = await this.prisma.$transaction(async (tx) => {
      // Update company balance
      const company = await tx.company.findUnique({ where: { id: data.companyId } });
      if (!company) throw new Error('Компания не найдена');

      let balanceChange = 0;
      if (data.type === 'PAYMENT') {
        balanceChange = data.amount; // incoming payment increases balance
      } else if (data.type === 'WRITE_OFF') {
        balanceChange = -data.amount; // write-off decreases balance
      }

      if (data.type === 'PAYMENT' || data.type === 'WRITE_OFF') {
        await tx.company.update({
          where: { id: data.companyId },
          data: { balance: { increment: balanceChange } },
        });
      }

      return tx.crmPayment.create({
        data: {
          companyId: data.companyId,
          amount: data.amount,
          type: data.type || 'PAYMENT',
          method: data.method || 'BANK_TRANSFER',
          description: data.description,
          date: data.date ? new Date(data.date) : new Date(),
          createdById: user.userId,
        },
      });
    });

    return payment;
  }
}
