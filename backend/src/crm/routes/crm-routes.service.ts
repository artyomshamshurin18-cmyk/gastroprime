import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CrmRoutesService {
  constructor(private prisma: PrismaService) {}

  private async ensureAccess(user: any) {
    if (!["SUPERADMIN", "ADMIN", "OPERATOR", "CRM_OPERATOR"].includes(user.role)) {
      throw new ForbiddenException('Доступ запрещён');
    }
  }

  async findAll(user: any, filters: { date?: string; status?: string }) {
    await this.ensureAccess(user);

    const where: any = {};
    if (filters.date) {
      const d = new Date(filters.date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }
    if (filters.status && filters.status !== 'ALL') where.status = filters.status;

    return this.prisma.crmRoute.findMany({
      where,
      include: {
        _count: { select: { stops: true } },
        stops: {
          include: {
            company: { select: { id: true, name: true, address: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.crmRoute.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            company: { select: { id: true, name: true, address: true, contactPerson: true, deliveryTime: true } },
            order: {
              include: {
                items: { include: { dish: { select: { id: true, name: true } } } },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!route) throw new NotFoundException('Маршрут не найден');
    return route;
  }

  async create(user: any, data: {
    date: string;
    driverName: string;
    driverPhone?: string;
    vehicleInfo?: string;
    notes?: string;
  }) {
    await this.ensureAccess(user);
    return this.prisma.crmRoute.create({
      data: {
        date: new Date(data.date),
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        vehicleInfo: data.vehicleInfo,
        notes: data.notes,
      },
    });
  }

  async generateTodayStops(routeId: string) {
    const route = await this.prisma.crmRoute.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('Маршрут не найден');

    // Find all CONFIRMED/PAID orders for this date grouped by company
    const startOfDay = new Date(route.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(route.date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        deliveryDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['CONFIRMED', 'PAID'] },
      },
      include: {
        company: { select: { id: true, name: true, address: true } },
      },
      orderBy: { companyId: 'asc' },
    });

    // Group by company
    const companyOrders = new Map<string, { company: any; orders: any[]; sortOrder: number }>();
    let sortOrder = 0;
    for (const order of orders) {
      if (!companyOrders.has(order.companyId)) {
        companyOrders.set(order.companyId, {
          company: order.company,
          orders: [],
          sortOrder: sortOrder++,
        });
      }
      companyOrders.get(order.companyId)!.orders.push(order);
    }

    // Delete existing stops and recreate
    await this.prisma.crmRouteStop.deleteMany({ where: { routeId } });

    const stops = [];
    for (const [, entry] of companyOrders) {
      // Create one stop per company with primary order
      const primaryOrder = entry.orders[0];
      stops.push({
        routeId,
        companyId: entry.company.id,
        orderId: primaryOrder.id,
        sortOrder: entry.sortOrder,
        status: 'PENDING',
      });
    }

    if (stops.length > 0) {
      await this.prisma.crmRouteStop.createMany({ data: stops });
    }

    // Update route counts
    await this.prisma.crmRoute.update({
      where: { id: routeId },
      data: { totalStops: stops.length, totalOrders: orders.length },
    });

    return { stopsCount: stops.length, ordersCount: orders.length };
  }

  async update(id: string, data: any) {
    const route = await this.prisma.crmRoute.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Маршрут не найден');
    return this.prisma.crmRoute.update({ where: { id }, data });
  }

  async updateStop(stopId: string, data: { status?: string; notes?: string }) {
    const stop = await this.prisma.crmRouteStop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundException('Точка маршрута не найдена');
    return this.prisma.crmRouteStop.update({ where: { id: stopId }, data });
  }

  async markDelivered(stopId: string) {
    const stop = await this.prisma.crmRouteStop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundException('Точка маршрута не найдена');
    return this.prisma.crmRouteStop.update({
      where: { id: stopId },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });
  }

  async complete(id: string) {
    const route = await this.prisma.crmRoute.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Маршрут не найден');
    return this.prisma.crmRoute.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
}
