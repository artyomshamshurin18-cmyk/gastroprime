import { PrismaService } from './prisma.service'

export const defaultCompanyCategoryPriceByName: Record<string, number> = {
  'Завтрак основное': 180,
  'Суп без свинины': 110,
  'Суп со свининой': 110,
  'Первые блюда': 110,
  'Второе курица': 170,
  'Второе свинина': 170,
  'Второе с гарниром': 210,
  'Вторые блюда': 170,
  'Гарнир картофельный': 40,
  'Гарнир крупа': 40,
  'Гарнир макароны': 40,
  'Гарниры': 40,
  'Салат с майонезом': 70,
  'Салаты без майонеза': 70,
  'Салаты': 70,
  'Сэндвичи': 180,
  'Премиум меню': 600,
}

export async function getCompanyCategoryPriceMap(prisma: PrismaService, companyId?: string | null) {
  if (!companyId) {
    return new Map<string, number>()
  }

  const rows = await prisma.companyCategoryPrice.findMany({
    where: { companyId },
    select: {
      categoryId: true,
      price: true,
    },
  })

  return new Map(rows.map((row) => [row.categoryId, row.price]))
}

export function getResolvedCompanyDishPrice(
  dish: { price?: number | null, categoryId?: string | null, category?: { id?: string | null, name?: string | null } | null },
  priceMap: Map<string, number>,
) {
  const categoryId = dish.categoryId || dish.category?.id || null
  if (categoryId && priceMap.has(categoryId)) {
    return priceMap.get(categoryId) || 0
  }

  return Number(dish.price) || 0
}

export async function getDefaultCompanyCategoryPrices(prisma: PrismaService) {
  const categories = await prisma.category.findMany({
    where: {
      name: {
        in: Object.keys(defaultCompanyCategoryPriceByName),
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  return categories.map((category) => ({
    categoryId: category.id,
    price: defaultCompanyCategoryPriceByName[category.name],
  }))
}

export function buildCompanyCategoryPricesPayload(data: any) {
  if (!Array.isArray(data?.categoryPrices)) {
    return undefined
  }

  const normalized = data.categoryPrices
    .map((item: any) => ({
      categoryId: typeof item?.categoryId === 'string' ? item.categoryId.trim() : '',
      price: Number(item?.price),
    }))
    .filter((item: { categoryId: string, price: number }) => item.categoryId && Number.isFinite(item.price) && item.price > 0)

  return {
    deleteMany: {},
    create: normalized.map((item: { categoryId: string, price: number }) => ({
      categoryId: item.categoryId,
      price: Math.round(item.price),
    })),
  }
}
