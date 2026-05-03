import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(driverId: string, date: string) {
    const targetDate = new Date(date);
    if (!date || Number.isNaN(targetDate.getTime())) {
      throw new ForbiddenException('Укажите корректную дату');
    }

    const driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
      include: {
        companies: {
          orderBy: { sortOrder: 'asc' },
          include: {
            company: true,
          },
        },
      },
    });

    if (!driverRoute) {
      return { date, driverId, companies: [] };
    }

    // Получаем DaySelection + SelectedDish данные для компаний водителя
    const companyIds = driverRoute.companies.map((c) => c.companyId);
    const selections = await this.prisma.daySelection.findMany({
      where: {
        date: targetDate,
        weeklyMenu: {
          user: {
            companyId: { in: companyIds },
          },
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'] },
        },
      },
      include: {
        weeklyMenu: {
          select: {
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                phone: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    contactPerson: true,
                    address: true,
                    entryConditions: true,
                    routeName: true,
                    deliveryTime: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: { category: true },
            },
          },
        },
      },
    });

    // Группируем по companyId
    const companyDataMap = new Map<
      string,
      {
        companyName: string;
        contactPerson: string;
        address: string;
        entryConditions: string;
        routeName: string;
        deliveryTime: string;
        dishes: Map<string, { dishName: string; categoryName: string; quantity: number }>;
        totalPortions: number;
        utensilsTotal: number;
        needBreadCount: number;
        employees: Array<{ userId: string; userName: string; email: string; dishes: Array<{ dishName: string; categoryName: string; quantity: number }> }>;
      }
    >();

    for (const selection of selections) {
      const user = selection.weeklyMenu.user;
      const company = user.company;
      const cid = company?.id || 'no-company';

      if (!companyDataMap.has(cid)) {
        companyDataMap.set(cid, {
          companyName: company?.name || 'Неизвестно',
          contactPerson: company?.contactPerson || '',
          address: company?.address || '',
          entryConditions: company?.entryConditions || '',
          routeName: company?.routeName || '',
          deliveryTime: company?.deliveryTime || '',
          dishes: new Map(),
          totalPortions: 0,
          utensilsTotal: 0,
          needBreadCount: 0,
          employees: [],
        });
      }

      const cd = companyDataMap.get(cid)!;
      cd.totalPortions += selection.items.reduce((sum, item) => sum + item.quantity, 0);
      cd.utensilsTotal += selection.utensils || 0;
      if (selection.needBread) cd.needBreadCount++;

      for (const item of selection.items) {
        const key = item.dish.name;
        if (cd.dishes.has(key)) {
          cd.dishes.get(key)!.quantity += item.quantity;
        } else {
          cd.dishes.set(key, {
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            quantity: item.quantity,
          });
        }
      }

      const existingEmp = cd.employees.find((e) => e.userId === user.id);
      if (!existingEmp) {
        cd.employees.push({
          userId: user.id,
          userName: user.firstName || user.email,
          email: user.email,
          dishes: selection.items.map((item) => ({
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            quantity: item.quantity,
          })),
        });
      } else {
        for (const item of selection.items) {
          const existingItem = existingEmp.dishes.find((d) => d.dishName === item.dish.name);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            existingEmp.dishes.push({
              dishName: item.dish.name,
              categoryName: item.dish.category?.name || 'Без категории',
              quantity: item.quantity,
            });
          }
        }
      }
    }

    const enrichedCompanies = driverRoute.companies.map((drc) => {
      const cd = companyDataMap.get(drc.companyId) || {
        companyName: drc.company.name,
        contactPerson: drc.company.contactPerson || '',
        address: drc.company.address || '',
        entryConditions: (drc.company as any).entryConditions || '',
        routeName: (drc.company as any).routeName || '',
        deliveryTime: (drc.company as any).deliveryTime || '',
        dishes: new Map(),
        totalPortions: 0,
        utensilsTotal: 0,
        needBreadCount: 0,
        employees: [],
      };

      return {
        companyId: drc.companyId,
        companyName: cd.companyName,
        contactPerson: cd.contactPerson,
        address: cd.address,
        entryConditions: cd.entryConditions,
        routeName: cd.routeName,
        deliveryTime: cd.deliveryTime,
        deliveryStatus: drc.deliveryStatus,
        statusChangedAt: drc.statusChangedAt,
        arrivedAt: drc.arrivedAt,
        unloadedAt: drc.unloadedAt,
        departedAt: drc.departedAt,
        driverNote: drc.driverNote,
        sortOrder: drc.sortOrder,
        dishes: Array.from(cd.dishes.values()),
        totalPortions: cd.totalPortions,
        utensilsTotal: cd.utensilsTotal,
        needBreadCount: cd.needBreadCount,
        employees: cd.employees,
      };
    });

    return {
      date,
      driverId,
      companies: enrichedCompanies,
    };
  }

  async updateDeliveryStatus(
    driverId: string,
    companyId: string,
    date: string,
    deliveryStatus: string,
    driverNote?: string,
  ) {
    const targetDate = new Date(date);
    const driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
      include: { companies: true },
    });

    if (!driverRoute) {
      throw new ForbiddenException('Маршрут не найден');
    }

    const routeCompany = driverRoute.companies.find((c) => c.companyId === companyId);
    if (!routeCompany) {
      throw new ForbiddenException('Компания не найдена в вашем маршруте');
    }

    const now = new Date();
    const updateData: Record<string, any> = {
      deliveryStatus,
      statusChangedAt: now,
    };

    if (driverNote !== undefined) {
      updateData.driverNote = driverNote;
    }

    switch (deliveryStatus) {
      case 'DEPARTED':
        updateData.departedAt = now;
        break;
      case 'ARRIVED':
        updateData.arrivedAt = now;
        break;
      case 'UNLOADING':
        if (!routeCompany.arrivedAt) updateData.arrivedAt = now;
        break;
      case 'UNLOADED':
        if (!routeCompany.arrivedAt) updateData.arrivedAt = now;
        if (!routeCompany.unloadedAt) updateData.unloadedAt = now;
        break;
      case 'COMPLETED':
        if (!routeCompany.arrivedAt) updateData.arrivedAt = now;
        if (!routeCompany.unloadedAt) updateData.unloadedAt = now;
        if (!routeCompany.departedAt) updateData.departedAt = now;
        break;
    }

    return this.prisma.driverRouteCompany.update({
      where: { id: routeCompany.id },
      data: updateData,
    });
  }

  async updateNote(
    driverId: string,
    companyId: string,
    date: string,
    driverNote: string,
  ) {
    const targetDate = new Date(date);
    const driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
      include: { companies: true },
    });

    if (!driverRoute) {
      throw new ForbiddenException('Маршрут не найден');
    }

    const routeCompany = driverRoute.companies.find((c) => c.companyId === companyId);
    if (!routeCompany) {
      throw new ForbiddenException('Компания не найдена в вашем маршруте');
    }

    return this.prisma.driverRouteCompany.update({
      where: { id: routeCompany.id },
      data: { driverNote },
    });
  }

  async getKitchenSummary(driverId: string, date: string, statuses: string) {
    const targetDate = new Date(date);
    if (!date || Number.isNaN(targetDate.getTime())) {
      throw new ForbiddenException('Укажите корректную дату');
    }

    const driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
      include: {
        companies: { select: { companyId: true } },
      },
    });

    if (!driverRoute) {
      return {
        date,
        statuses: [],
        summary: { selectionsCount: 0, companiesCount: 0, dishesCount: 0, totalPortions: 0, totalUtensils: 0, needBreadCount: 0, notesCount: 0 },
        dishes: [],
        companies: [],
        notes: [],
      };
    }

    const companyIds = driverRoute.companies.map((c) => c.companyId);
    const statusList = (statuses || 'PENDING,CONFIRMED,PREPARING,COMPLETED')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const selections = await this.prisma.daySelection.findMany({
      where: {
        date: targetDate,
        weeklyMenu: {
          user: {
            companyId: { in: companyIds },
          },
          status: { in: statusList },
        },
      },
      include: {
        weeklyMenu: {
          select: {
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                phone: true,
                lastName: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    contactPerson: true,
                    address: true,
                    entryConditions: true,
                    routeName: true,
                    deliveryTime: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: { category: true },
            },
          },
        },
      },
    });

    const byDish = new Map<string, any>();
    const byCompany = new Map<string, any>();
    const notes: Array<{ companyName: string; userName: string; note: string }> = [];
    let totalPortions = 0;
    let totalUtensils = 0;
    let needBreadCount = 0;

    selections.forEach((selection) => {
      const user = selection.weeklyMenu.user;
      const company = user.company;
      const companyKey = company?.id || `no-company-${user.id}`;
      const companyName = company?.name || 'Без компании';
      const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
      const selectionPortions = selection.items.reduce((sum, item) => sum + item.quantity, 0);

      totalPortions += selectionPortions;
      totalUtensils += selection.utensils || 0;
      if (selection.needBread) needBreadCount += 1;
      if (selection.notes?.trim()) {
        notes.push({ companyName, userName, note: selection.notes.trim() });
      }

      if (!byCompany.has(companyKey)) {
        byCompany.set(companyKey, {
          companyId: company?.id || null,
          companyName,
          contactPerson: company?.contactPerson || '',
          address: company?.address || '',
          entryConditions: company?.entryConditions || '',
          routeName: company?.routeName || '',
          deliveryTime: company?.deliveryTime || '',
          selectionsCount: 0,
          totalPortions: 0,
          utensilsTotal: 0,
          needBreadCount: 0,
          dishesMap: new Map<string, any>(),
          users: [],
        });
      }

      const companyEntry = byCompany.get(companyKey);
      companyEntry.selectionsCount += 1;
      companyEntry.totalPortions += selectionPortions;
      companyEntry.utensilsTotal += selection.utensils || 0;
      if (selection.needBread) companyEntry.needBreadCount += 1;
      companyEntry.users.push({
        userId: user.id,
        userName,
        email: user.email,
        phone: user.phone || '',
        status: selection.weeklyMenu.status,
        utensils: selection.utensils,
        needBread: selection.needBread,
        notes: selection.notes || '',
        items: selection.items.map((item) => ({
          dishName: item.dish.name,
          categoryName: item.dish.category?.name || 'Без категории',
          quantity: item.quantity,
        })),
      });

      selection.items.forEach((item) => {
        const dishKey = item.dishId;
        if (!byDish.has(dishKey)) {
          byDish.set(dishKey, {
            dishId: item.dishId,
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            weight: item.dish.weight,
            measureUnit: item.dish.measureUnit,
            totalQuantity: 0,
            productionAmount: 0,
            productionUnitLabel: '',
            portionUnitLabel: '',
            companies: new Map<string, number>(),
          });
        }
        const dishEntry = byDish.get(dishKey);
        dishEntry.totalQuantity += item.quantity;
        const prevQty = dishEntry.companies.get(companyName) || 0;
        dishEntry.companies.set(companyName, prevQty + item.quantity);
      });
    });

    const formatCompanies = (companyEntry: any) => ({
      companyId: companyEntry.companyId,
      companyName: companyEntry.companyName,
      contactPerson: companyEntry.contactPerson,
      address: companyEntry.address,
      entryConditions: companyEntry.entryConditions,
      routeName: companyEntry.routeName,
      deliveryTime: companyEntry.deliveryTime,
      selectionsCount: companyEntry.selectionsCount,
      totalPortions: companyEntry.totalPortions,
      utensilsTotal: companyEntry.utensilsTotal,
      needBreadCount: companyEntry.needBreadCount,
      dishes: Array.from(companyEntry.dishesMap.values()),
      users: companyEntry.users,
    });

    return {
      date,
      statuses: statusList,
      summary: {
        selectionsCount: selections.length,
        companiesCount: byCompany.size,
        dishesCount: byDish.size,
        totalPortions,
        totalUtensils,
        needBreadCount,
        notesCount: notes.length,
      },
      dishes: Array.from(byDish.values()).map((d) => ({
        ...d,
        companies: Array.from(d.companies.entries()).map(([companyName, quantity]) => ({ companyName, quantity })),
      })),
      companies: Array.from(byCompany.values()).map(formatCompanies),
      notes,
    };
  }
}
