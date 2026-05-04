import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(driverId: string, date: string) {
    const targetDate = new Date(date);
    if (!date || Number.isNaN(targetDate.getTime())) {
      throw new ForbiddenException('Укажите корректную дату');
    }

    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { routeName: true },
    });

    if (!driver || !driver.routeName) {
      return { date, driverId, companies: [] };
    }

    const companies = await this.prisma.company.findMany({
      where: {
        routeName: driver.routeName,
        users: {
          some: {
            weeklyMenus: {
              some: {
                status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'] },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        contactPerson: true,
        address: true,
        entryConditions: true,
        routeName: true,
        deliveryTime: true,
      },
    });

    const companyIds = companies.map((c) => c.id);
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
                company: true,
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

    const companyDataMap = new Map<string, {
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
      employees: Array<{ userId: string; userName: string; email: string; phones: string; dishes: Array<{ dishName: string; categoryName: string; quantity: number }> }>;
    }>();

    for (const selection of selections) {
      const user = selection.weeklyMenu.user;
      const company = user.company;
      const cid = company?.id || ('no-company-' + user.id);

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
          phones: user.phone || '',
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

    const enrichedCompanies = companies.map((company) => {
      const cd = companyDataMap.get(company.id) || {
        companyName: company.name,
        contactPerson: company.contactPerson || '',
        address: company.address || '',
        entryConditions: company.entryConditions || '',
        routeName: company.routeName || '',
        deliveryTime: company.deliveryTime || '',
        dishes: new Map(),
        totalPortions: 0,
        utensilsTotal: 0,
        needBreadCount: 0,
        employees: [],
      };

      return {
        companyId: company.id,
        companyName: cd.companyName,
        contactPerson: cd.contactPerson,
        address: cd.address,
        entryConditions: cd.entryConditions,
        routeName: cd.routeName,
        deliveryTime: cd.deliveryTime,
        deliveryStatus: 'PENDING',
        statusChangedAt: null,
        arrivedAt: null,
        unloadedAt: null,
        departedAt: null,
        driverNote: '',
        sortOrder: 0,
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
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { routeName: true },
    });

    if (!driver || !driver.routeName) {
      throw new ForbiddenException('У вас не назначен маршрут');
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, routeName: driver.routeName },
    });

    if (!company) {
      throw new ForbiddenException('Компания не найдена в вашем маршруте');
    }

    const targetDate = new Date(date);
    let driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
    });

    if (!driverRoute) {
      driverRoute = await this.prisma.driverRoute.create({
        data: { driverId, date: targetDate },
      });
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
        updateData.arrivedAt = now;
        break;
      case 'COMPLETED':
        updateData.arrivedAt = now;
        updateData.unloadedAt = now;
        updateData.departedAt = now;
        break;
    }

    return this.prisma.driverRouteCompany.upsert({
      where: {
        driverRouteId_companyId: { driverRouteId: driverRoute.id, companyId },
      },
      create: {
        driverRouteId: driverRoute.id,
        companyId,
        ...updateData,
      },
      update: updateData,
    });
  }

  async updateNote(
    driverId: string,
    companyId: string,
    date: string,
    driverNote: string,
  ) {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { routeName: true },
    });

    if (!driver || !driver.routeName) {
      throw new ForbiddenException('У вас не назначен маршрут');
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, routeName: driver.routeName },
    });

    if (!company) {
      throw new ForbiddenException('Компания не найдена в вашем маршруте');
    }

    const targetDate = new Date(date);
    let driverRoute = await this.prisma.driverRoute.findUnique({
      where: { driverId_date: { driverId, date: targetDate } },
    });

    if (!driverRoute) {
      driverRoute = await this.prisma.driverRoute.create({
        data: { driverId, date: targetDate },
      });
    }

    return this.prisma.driverRouteCompany.upsert({
      where: {
        driverRouteId_companyId: { driverRouteId: driverRoute.id, companyId },
      },
      create: {
        driverRouteId: driverRoute.id,
        companyId,
        driverNote,
      },
      update: { driverNote },
    });
  }

  async getKitchenSummary(driverId: string, date: string, statuses: string) {
    const targetDate = new Date(date);
    if (!date || Number.isNaN(targetDate.getTime())) {
      throw new ForbiddenException('Укажите корректную дату');
    }

    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { routeName: true },
    });

    if (!driver || !driver.routeName) {
      return {
        date,
        statuses: [],
        summary: { selectionsCount: 0, companiesCount: 0, dishesCount: 0, totalPortions: 0, totalUtensils: 0, needBreadCount: 0, notesCount: 0 },
        dishes: [],
        companies: [],
        notes: [],
      };
    }

    const companies = await this.prisma.company.findMany({
      where: { routeName: driver.routeName },
      select: { id: true, name: true, contactPerson: true, address: true, entryConditions: true, routeName: true, deliveryTime: true },
    });

    const companyIds = companies.map((c) => c.id);
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
                company: true,
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
      const companyKey = company?.id || ('no-company-' + user.id);
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
          companyId: company?.id || '',
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
          dishesMap: new Map<string, { dishName: string; categoryName: string; quantity: number }>(),
          users: new Map<string, { userId: string; userName: string; email: string; phone: string; dishes: Array<{ dishName: string; categoryName: string; quantity: number }> }>(),
        });
      }

      const ce = byCompany.get(companyKey);
      ce.selectionsCount += 1;
      ce.totalPortions += selectionPortions;
      ce.utensilsTotal += selection.utensils || 0;
      if (selection.needBread) ce.needBreadCount += 1;

      if (!ce.users.has(user.id)) {
        ce.users.set(user.id, {
          userId: user.id,
          userName,
          email: user.email,
          phone: user.phone || '',
          dishes: [],
        });
      }

      const userEntry = ce.users.get(user.id);
      selection.items.forEach((item) => {
        const dishKey = (item.dish.category?.name || '') + '|' + item.dish.name;
        if (!byDish.has(dishKey)) {
          byDish.set(dishKey, {
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            measureUnit: item.dish.measureUnit || 'шт.',
            totalQuantity: 0,
            productionAmount: 0,
            companies: new Map<string, number>(),
          });
        }
        const dishEntry = byDish.get(dishKey);
        dishEntry.totalQuantity += item.quantity;
        const prevQty = dishEntry.companies.get(companyName) || 0;
        dishEntry.companies.set(companyName, prevQty + item.quantity);

        const dKey = (item.dish.category?.name || '') + '|' + item.dish.name;
        if (!ce.dishesMap.has(dKey)) {
          ce.dishesMap.set(dKey, {
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            quantity: 0,
          });
        }
        ce.dishesMap.get(dKey)!.quantity += item.quantity;

        const existingUserDish = userEntry.dishes.find((d) => d.dishName === item.dish.name);
        if (existingUserDish) {
          existingUserDish.quantity += item.quantity;
        } else {
          userEntry.dishes.push({
            dishName: item.dish.name,
            categoryName: item.dish.category?.name || 'Без категории',
            quantity: item.quantity,
          });
        }
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
      users: Array.from(companyEntry.users.values()),
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

  async getOrCreateDriverChat(driverId: string) {
    const driver = await this.prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Водитель не найден');

    let conversation = await this.prisma.chatConversation.findFirst({
      where: {
        participants: {
          some: { userId: driverId }
        }
      },
      include: {
        participants: {
          include: { sender: { select: { id: true, email: true, firstName: true, role: true } } }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, email: true, firstName: true, role: true } },
            attachments: true
          }
        }
      }
    });

    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: {
          participants: {
            create: { userId: driverId }
          }
        },
        include: {
          participants: {
            include: { sender: { select: { id: true, email: true, firstName: true, role: true } } }
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, email: true, firstName: true, role: true } },
              attachments: true
            }
          }
        }
      });
    }

    return { conversation };
  }

  async sendDriverChatMessage(driverId: string, text: string) {
    if (!text.trim()) throw new BadRequestException('Текст сообщения не может быть пустым');

    let conv = await this.prisma.chatConversation.findFirst({
      where: {
        participants: { some: { userId: driverId } }
      }
    });

    if (!conv) {
      conv = await this.prisma.chatConversation.create({
        data: { participants: { create: { userId: driverId } } }
      });
    }

    await this.prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        senderId: driverId,
        text: text.trim()
      }
    });

    return this.getOrCreateDriverChat(driverId);
  }
}
