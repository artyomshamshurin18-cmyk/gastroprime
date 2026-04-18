const exactCategoryOrder: Record<string, number> = {
  'Завтрак основное': 10,
  'Завтрак дополнительное': 20,
  'Суп без свинины': 30,
  'Суп со свининой': 31,
  'Первые блюда': 32,
  'Второе курица': 40,
  'Второе свинина': 41,
  'Второе альтернатива': 42,
  'Вторые блюда': 43,
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

export const getCategoryOrder = (categoryName: string) => {
  if (categoryName in exactCategoryOrder) return exactCategoryOrder[categoryName]
  if (categoryName.startsWith('Завтрак')) return 20
  if (categoryName.startsWith('Суп')) return 30
  if (categoryName.startsWith('Второе')) return 40
  if (categoryName.startsWith('Гарнир')) return 50
  if (categoryName.startsWith('Салат')) return 60
  if (categoryName.startsWith('Сэндвич')) return 70
  if (categoryName.startsWith('Напит')) return 80
  return 999
}

export const sortCategoryEntries = <T,>(entries: Array<[string, T]>) => (
  [...entries].sort((a, b) => getCategoryOrder(a[0]) - getCategoryOrder(b[0]) || a[0].localeCompare(b[0], 'ru'))
)
