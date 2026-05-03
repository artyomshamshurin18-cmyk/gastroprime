import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CrmDashboardService {
  constructor(private prisma: PrismaService) {}

  private async ensureAccess(user: any) {
    if (!["SUPERADMIN", "ADMIN", "CRM_OPERATOR"].includes(user.role)) {
      throw new ForbiddenException('Только ADMIN может просматривать дашборд');
    }
  }

  async getOverview(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      activeCompanies,
      todayOrders,
      monthRevenue,
      monthOrders,
      totalDeliveries,
      debtSummary,
      productionDays,
    ] = await Promise.all([
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.findMany({
        where: { deliveryDate: { gte: startOfDay, lte: endOfDay } },
        select: { id: true, totalAmount: true, status: true },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
      this.prisma.crmRoute.count({
        where: { date: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prisma.company.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { creditBalance: true },
      }),
      this.prisma.daySelection.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        select: { weeklyMenu: { select: { userId: true } } },
        distinct: ['weeklyMenuId'],
      }),
    ]);

    const todayTotalAmount = todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const monthRev = (monthRevenue as any)._sum?.totalAmount || 0;
    const avgCheck = monthOrders > 0 ? Math.round(monthRev / monthOrders) : 0;
    const productionArr = productionDays as any[] || [];
    const uniqueProduction = new Set(productionArr.map((s: any) => s.weeklyMenu?.userId).filter(Boolean)).size;
    const debtTotal = (debtSummary as any)._sum?.creditBalance || 0;

    const funnelStages = await this.prisma.crmDeal.groupBy({
      by: ['stage'],
      _count: true,
    });

    return {
      activeCompanies,
      todayOrders: todayOrders.length,
      todayRevenue: todayTotalAmount,
      monthRevenue: monthRev,
      monthOrders,
      avgCheck,
      totalDeliveries,
      totalDebt: debtTotal,
      productionLoad: {
        uniqueClients: uniqueProduction,
        totalSelections: productionArr.length,
      },
      funnel: funnelStages.reduce((acc: any, s: any) => ({ ...acc, [s.stage]: s._count }), {}),
    };
  }

  async getFunnel() {
    const stages = ['LEAD', 'CONTACT_ESTABLISHED', 'TASTING_SCHEDULED', 'TASTING_DONE', 'NEGOTIATION', 'CONTRACT'];
    const counts = await this.prisma.crmDeal.groupBy({
      by: ['stage'],
      _count: true,
    });

    const stageMap = counts.reduce((acc: any, s: any) => ({ ...acc, [s.stage]: s._count }), {} as Record<string, number>);
    const funnelTotal = Object.values(stageMap).reduce((a: any, b: any) => a + b, 0) as number;

    return {
      stages: stages.map((stage) => ({
        stage,
        count: stageMap[stage] || 0,
        percent: funnelTotal > 0 ? Math.round(((stageMap[stage] || 0) / funnelTotal) * 100) : 0,
      })),
      total: funnelTotal,
    };
  }

  async getProduction(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const selections = await this.prisma.daySelection.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: {
        items: {
          include: {
            dish: {
              select: { id: true, name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const dishMap = new Map<string, { name: string; category: string; totalQty: number }>();
    for (const sel of selections) {
      for (const item of (sel as any).items || []) {
        const key = item.dishId;
        if (!dishMap.has(key)) {
          dishMap.set(key, { name: item.dish.name, category: item.dish.category?.name || '', totalQty: 0 });
        }
        dishMap.get(key)!.totalQty += item.quantity || 0;
      }
    }

    const dishes = Array.from(dishMap.values()).sort((a, b) => b.totalQty - a.totalQty);
    const totalPortions = dishes.reduce((sum, d) => sum + d.totalQty, 0);

    return {
      date: targetDate.toISOString().slice(0, 10),
      totalPortions,
      totalClients: selections.length,
      dishes,
    };
  }
}
