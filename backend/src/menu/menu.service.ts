import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getAllDishes() {
    return this.prisma.dish.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    })
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  }
}
