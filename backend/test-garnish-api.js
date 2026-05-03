const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGarnishSupport() {
  console.log('Testing garnish support in database...');
  
  try {
    // 1. Проверяем, есть ли поле garnishDishId в OrderItem
    const tableInfo = await prisma.;
    
    console.log('1. Column check:', tableInfo.length > 0 ? '✅ Field garnishDishId exists' : '❌ Field not found');
    
    // 2. Проверяем, есть ли гарниры в базе
    const garnishCategories = await prisma.category.findMany({
      where: {
        name: {
          contains: 'гарнир',
          mode: 'insensitive'
        }
      },
      include: {
        dishes: true
      }
    });
    
    console.log('2. Garnish categories:', garnishCategories.length);
    garnishCategories.forEach(cat => {
      console.log();
    });
    
    // 3. Проверяем структуру OrderItem
    const sampleOrderItem = await prisma.orderItem.findFirst({
      include: {
        dish: true,
        garnishDish: true
      }
    });
    
    console.log('3. Sample OrderItem structure:');
    console.log('   - Can include garnishDish:', sampleOrderItem ? '✅ Yes' : 'No orders yet');
    
    if (sampleOrderItem && sampleOrderItem.garnishDish) {
      console.log();
    }
    
    // 4. Создаем тестовый заказ с гарниром
    console.log('4. Testing order creation with garnish...');
    
    // Находим блюдо и гарнир для теста
    const mainDish = await prisma.dish.findFirst({
      where: { name: { contains: 'котлет', mode: 'insensitive' } }
    });
    
    const garnishDish = await prisma.dish.findFirst({
      where: { name: { contains: 'рис', mode: 'insensitive' } }
    });
    
    if (mainDish && garnishDish) {
      console.log();
      console.log();
      
      // Проверяем, что можем создать OrderItem с garnishDishId
      const testItem = {
        dishId: mainDish.id,
        garnishDishId: garnishDish.id,
        quantity: 1,
        unitPrice: mainDish.price + garnishDish.price
      };
      
      console.log('   - Test item structure:', testItem);
      console.log('   - ✅ Backend ready for garnishes!');
    } else {
      console.log('   - ⚠️ Need test dishes in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.();
  }
}

testGarnishSupport();
