// Перехватчик для добавления garnishDishId в запросы сохранения меню
(function() {
  console.log('Garnish interceptor loaded');
  
  // Сохраняем оригинальный fetch
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options) {
    // Проверяем, это ли запрос на сохранение меню
    if (url && typeof url === 'string' && url.includes('/daily-menu') && options && options.method === 'POST') {
      console.log('Intercepting menu save request');
      
      try {
        // Парсим тело запроса
        if (options.body) {
          const body = JSON.parse(options.body);
          
          // Получаем сохраненные гарниры из localStorage
          const savedGarnishes = JSON.parse(localStorage.getItem('adminGarnishes') || '{}');
          
          // Добавляем garnishDishId к каждому второму блюду
          if (body.items && Array.isArray(body.items)) {
            body.items = body.items.map(item => {
              // Находим блюдо по ID (нам нужно сопоставить ID блюда с названием)
              // Это сложно без доступа к данным React, поэтому используем простой подход
              
              // Если у нас есть сопоставление названий блюд с ID
              const dishName = window.dishIdToName && window.dishIdToName[item.dishId];
              if (dishName && savedGarnishes[dishName]) {
                // Здесь нужно найти ID гарнира по названию
                // Пока просто добавляем заглушку
                console.log('Adding garnish for dish:', dishName, 'garnish:', savedGarnishes[dishName]);
                
                // Для теста добавляем фиксированный ID гарнира
                // В реальности нужно найти ID гарнира по названию
                item.garnishDishId = 'test-garnish-id';
              }
              
              return item;
            });
          }
          
          // Обновляем тело запроса
          options.body = JSON.stringify(body);
          console.log('Updated request body:', body);
        }
      } catch(e) {
        console.error('Error intercepting request:', e);
      }
    }
    
    // Вызываем оригинальный fetch
    return originalFetch.apply(this, arguments);
  };
  
  console.log('Garnish interceptor installed');
})();
EOF"