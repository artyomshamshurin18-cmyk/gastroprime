import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { getCompanyCategoryPriceMap, getResolvedCompanyDishPrice } from '../common/company-pricing';

@Injectable()
export class DailyMenuService {
  constructor(private prisma: PrismaService) {}

  private getCategoryOrder(categoryName: string) {
    const exactOrder: Record<string, number> = {
      'Завтрак основное': 10,
      'Завтрак дополнительное': 20,
      'Суп без свинины': 30,
      'Суп со свининой': 31,
      'Первые блюда': 32,
      'Второе курица': 40,
      'Второе свинина': 41,
      'Второе с гарниром': 42,
      'Второе альтернатива': 43,
      'Вторые блюда': 44,
      'Гарнир картофельный': 50,
      'Гарнир крупа': 51,
      'Гарнир макароны': 52,
      'Гарниры': 53,
      'Салат с майонезом': 60,
      'Салаты без майонеза': 61,
      'Салат альтернативный': 62,
      'Салаты': 63,
      'Сэндвичи': 70,
      'Напитки': 80,
      'Напиток': 81,
    }

    if (exactOrder[categoryName] !== undefined) return exactOrder[categoryName]
    if (categoryName.startsWith('Завтрак')) return 20
    if (categoryName.startsWith('Суп')) return 30
    if (categoryName.startsWith('Второе')) return 40
    if (categoryName.startsWith('Гарнир')) return 50
    if (categoryName.startsWith('Салат')) return 60
    if (categoryName.startsWith('Сэндвич')) return 70
    if (categoryName.startsWith('Напит')) return 80
    return 999
  }

  private sortGroupedItems(grouped: Record<string, any[]>) {
    return Object.fromEntries(
      Object.entries(grouped).sort((a, b) => this.getCategoryOrder(a[0]) - this.getCategoryOrder(b[0]) || a[0].localeCompare(b[0], 'ru')),
    )
  }

  private async getUserCompanyPriceMap(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    })

    return getCompanyCategoryPriceMap(this.prisma, user?.companyId)
  }

  async getByDate(userId: string, date: string) {
    const priceMap = await this.getUserCompanyPriceMap(userId)
    const menu = await this.prisma.dailyMenu.findUnique({
      where: { date: new Date(date) },
      include: {
        items: {
          include: { dish: { include: { category: true } } },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!menu) {
      return { date, items: [] };
    }

    // Группируем по категориям
    const grouped = menu.items.reduce((acc, item) => {
      const category = item.dish.category.name;
      if (!acc[category]) acc[category] = [];
        acc[category].push({
          id: item.id,
          dishId: item.dishId,
          name: item.dish.name,
          description: item.dish.description,
          photoUrl: item.dish.photoUrl,
          price: getResolvedCompanyDishPrice(item.dish, priceMap),
          calories: item.dish.calories,
          weight: item.dish.weight,
          measureUnit: item.dish.measureUnit,
          containsPork: item.dish.containsPork,
          containsGarlic: item.dish.containsGarlic,
          containsMayonnaise: item.dish.containsMayonnaise,
          maxQuantity: item.maxQuantity,
          category: item.dish.category.name
        });
      return acc;
    }, {});

    return {
      date: menu.date,
      items: this.sortGroupedItems(grouped)
    };
  }

  async getByRange(userId: string, start: string, end: string) {
    const priceMap = await this.getUserCompanyPriceMap(userId)
    const menus = await this.prisma.dailyMenu.findMany({
      where: {
        date: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      include: {
        items: {
          include: { dish: { include: { category: true } } },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { date: 'asc' }
    });

    return menus.map(menu => {
      const grouped = menu.items.reduce((acc, item) => {
        const category = item.dish.category.name;
        if (!acc[category]) acc[category] = [];
        acc[category].push({
          id: item.id,
          dishId: item.dishId,
          name: item.dish.name,
          description: item.dish.description,
          photoUrl: item.dish.photoUrl,
          price: getResolvedCompanyDishPrice(item.dish, priceMap),
          calories: item.dish.calories,
          weight: item.dish.weight,
          measureUnit: item.dish.measureUnit,
          containsPork: item.dish.containsPork,
          containsGarlic: item.dish.containsGarlic,
          containsMayonnaise: item.dish.containsMayonnaise,
          maxQuantity: item.maxQuantity
        });
        return acc;
      }, {});

      return {
        date: menu.date,
        items: this.sortGroupedItems(grouped)
      };
    });
  }

  async createOrUpdate(data: { date: string; items: { dishId: string; maxQuantity: number; sortOrder: number }[] }) {
    const date = new Date(data.date);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid menu date');
    }

    if (!data.items?.length) {
      throw new BadRequestException('Menu must contain at least one dish');
    }

    const uniqueDishIds = new Set(data.items.map(item => item.dishId));
    if (uniqueDishIds.size !== data.items.length) {
      throw new BadRequestException('Daily menu contains duplicate dishes');
    }

    // Удаляем старое меню на эту дату
    await this.prisma.dailyMenu.deleteMany({ where: { date } });

    // Создаём новое меню
    const menu = await this.prisma.dailyMenu.create({
      data: {
        date,
        items: {
          create: data.items.map((item, index) => ({
            dishId: item.dishId,
            maxQuantity: item.maxQuantity,
            sortOrder: item.sortOrder ?? index
          }))
        }
      },
      include: {
        items: { include: { dish: true } }
      }
    });

    return menu;
  }

  async delete(date: string) {
    await this.prisma.dailyMenu.deleteMany({
      where: { date: new Date(date) }
    });
    return { success: true };
  }
}
