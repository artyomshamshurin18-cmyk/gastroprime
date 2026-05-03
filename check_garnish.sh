#!/bin/bash
echo '🔍 Проверка гарниров в Gastroprime'
echo '================================='

# 1. Проверяем бэкенд
echo ''
echo '📦 1. Проверка бэкенда:'
if grep -q 'garnishDish:' backend/src/daily-menu/daily-menu.service.ts; then
    echo '   ✅ Бэкенд обновлён (возвращает garnishDish объект)'
else
    echo '   ❌ Бэкенд не обновлён'
fi

# 2. Проверяем фронтенд
echo ''
echo '🎨 2. Проверка фронтенда:'
if grep -q 'garnishDish?:' frontend/src/WeeklyMenuSelector.tsx; then
    echo '   ✅ Фронтенд обновлён (интерфейс содержит garnishDish)'
elif grep -q 'garnishDishName' frontend/src/WeeklyMenuSelector.tsx; then
    echo '   ⚠️  Фронтенд использует старый формат (garnishDishName)'
else
    echo '   ❌ Фронтенд не обновлён'
fi

# 3. Проверяем запущен ли бэкенд
echo ''
echo '🚀 3. Проверка сервисов:'
if netstat -tlnp | grep -q :3001; then
    echo '   ✅ Бэкенд запущен на порту 3001'
else
    echo '   ❌ Бэкенд не запущен'
fi

# 4. Инструкции
echo ''
echo '🎯 4. Что делать дальше:'
echo '   --------------------'
echo '   Вариант A: Временный SQL фикс (быстро):'
echo '     psql -U postgres -d catering_b2b -c "'
echo '       UPDATE \"Dish\" d SET description = d.description || E''\\nГарнир: '' || gd.name'
echo '       FROM \"DailyMenuItem\" dmi'
echo '       LEFT JOIN \"Dish\" gd ON dmi.garnishDishId = gd.id'
echo '       WHERE d.id = dmi.dishId AND dmi.garnishDishId IS NOT NULL;'
echo '     "'
echo ''
echo '   Вариант B: Полный фикс (рекомендуется):'
echo '     1. Обновить WeeklyMenuSelector.tsx (добавить интерфейсы)'
echo '     2. Пересобрать фронтенд: cd frontend && npm run build'
echo '     3. Скопировать билд: cp -r dist/* /var/www/gastroprime/'
echo ''
echo '   Вариант C: Проверить вручную:'
echo '     1. Залогинься как demo/demo'
echo '     2. Перейди в меню на 30 апреля'
echo '     3. Проверь отображается ли гарнир'
echo ''
echo '🔄 Для отката:'
echo '   git checkout -- backend/src/daily-menu/daily-menu.service.ts'
echo '   git checkout -- frontend/src/WeeklyMenuSelector.tsx'
