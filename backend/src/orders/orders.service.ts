import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrdersByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    const company = user?.company

    if (!company) {
      return []
    }

    return this.prisma.order.findMany({
      where: { companyId: company.id },
      include: {
        items: { include: { dish: true } },
        company: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async createOrder(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    const company = user?.company

    if (!company) {
      throw new BadRequestException('Company not found')
    }

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      throw new BadRequestException('Свободный заказ отключен. Используйте запланированное меню.')
    }

    // Получаем блюда для расчёта суммы
    const dishIds = data.items.map((item: any) => item.dishId)
    const dishes = await this.prisma.dish.findMany({
      where: { id: { in: dishIds } }
    })

    const dishMap = new Map(dishes.map(d => [d.id, d]))

    // Считаем общую сумму
    let totalAmount = 0
    const orderItems = data.items.map((item: any) => {
      const dish = dishMap.get(item.dishId)
      if (!dish) {
        throw new BadRequestException(`Dish ${item.dishId} not found`)
      }
      const itemTotal = dish.price * item.quantity
      totalAmount += itemTotal
      return {
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: dish.price
      }
    })

    // Проверяем лимит
    if (company.limit && totalAmount > company.limit) {
      throw new BadRequestException('Order amount exceeds company limit')
    }

    // Генерируем номер заказа
    const date = new Date()
    const orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.random()).slice(2,6)}`

    // Создаём заказ
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        companyId: company.id,
        status: 'PENDING',
        totalAmount,
        deliveryDate: new Date(data.deliveryDate),
        deliveryTime: data.deliveryTime,
        comment: data.comment,
        items: {
          create: orderItems
        }
      },
      include: {
        items: { include: { dish: true } },
        company: true
      }
    })

    return order
  }
}
