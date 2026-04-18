import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Удаляем старые данные
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.dish.deleteMany()
  await prisma.category.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  // Создаем категории
  const soups = await prisma.category.create({ data: { name: 'Супы' } })
  const mains = await prisma.category.create({ data: { name: 'Горячие блюда' } })
  const salads = await prisma.category.create({ data: { name: 'Салаты' } })
  const drinks = await prisma.category.create({ data: { name: 'Напитки' } })

  // Создаем блюда
  await prisma.dish.createMany({
    data: [
      { name: 'Борщ', description: 'Традиционный украинский суп', price: 250, calories: 180, weight: 350, categoryId: soups.id },
      { name: 'Куриный суп', description: 'Суп с курицей и лапшой', price: 220, calories: 150, weight: 350, categoryId: soups.id },
      { name: 'Котлета по-киевски', description: 'Куриная котлета с маслом', price: 450, calories: 450, weight: 200, categoryId: mains.id },
      { name: 'Говядина тушеная', description: 'С картофельным пюре', price: 520, calories: 550, weight: 350, categoryId: mains.id },
      { name: 'Цезарь с курицей', description: 'Классический салат', price: 380, calories: 320, weight: 250, categoryId: salads.id },
      { name: 'Греческий салат', description: 'Свежие овощи с фетой', price: 320, calories: 280, weight: 250, categoryId: salads.id },
      { name: 'Морс клюквенный', description: 'Натуральный морс', price: 120, calories: 80, weight: 300, categoryId: drinks.id },
      { name: 'Компот', description: 'Фруктовый компот', price: 100, calories: 60, weight: 300, categoryId: drinks.id }
    ]
  })

  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@catering.com',
      password: adminPassword,
      firstName: 'Админ',
      lastName: 'Админов',
      role: 'ADMIN',
      company: {
        create: {
          name: 'Админ Компания',
          address: 'Москва, ул. Админская, 1',
          balance: 0,
          limit: 0
        }
      }
    }
  })

  // Создаем тестового клиента
  const clientPassword = await bcrypt.hash('client123', 10)
  const client = await prisma.user.create({
    data: {
      email: 'client@catering.com',
      password: clientPassword,
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'CLIENT',
      company: {
        create: {
          name: 'ООО "Ромашка"',
          address: 'Москва, ул. Цветочная, 10',
          balance: 50000,
          limit: 100000
        }
      }
    }
  })

  console.log('✅ Seed completed!')
  console.log('Admin: admin@catering.com / admin123')
  console.log('Client: client@catering.com / client123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
