// Временный скрипт для добавления кнопки "Связать гарнир" в AdminMenuPlanning
(function() {
  console.log('Admin garnish script loaded');
  
  // Ждем загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('Initializing admin garnish script');
    
    // Проверяем, находимся ли мы на странице планирования меню
    const h2 = document.querySelector('h2');
    const isPlanningPage = h2 && h2.textContent && h2.textContent.includes('Планирование меню');
    
    if (!isPlanningPage) {
      console.log('Not on admin planning page');
      return;
    }
    
    // Создаем простую систему для хранения выбранных гарниров
    window.adminGarnishes = window.adminGarnishes || {};
    
    // Функция для добавления кнопок
    function addGarnishButtons() {
      console.log('Looking for second dishes...');
      
      // Ищем все карточки блюд
      const dishCards = document.querySelectorAll('div');
      
      dishCards.forEach(card => {
        // Проверяем, есть ли уже кнопка
        if (card.querySelector('.garnish-btn')) return;
        
        // Проверяем стили карточки (приблизительно)
        const style = card.getAttribute('style') || '';
        const isDishCard = style.includes('padding:') && style.includes('border:') && style.includes('cursor:');
        
        if (!isDishCard) return;
        
        // Получаем текст карточки
        const cardText = card.textContent || '';
        
        // Проверяем, является ли это вторым блюдом (по тексту)
        const isSecondDish = cardText.includes('Второе') || 
                            cardText.includes('Жаркое') || 
                            cardText.includes('Котлеты') ||
                            cardText.includes('Свинина') ||
                            cardText.includes('Куриное');
        
        if (isSecondDish) {
          console.log('Found second dish:', cardText.substring(0, 50));
          
          // Извлекаем название блюда
          const lines = cardText.split('\n');
          const dishName = lines[0] || cardText.split('-')[0].trim();
          
          // Создаем кнопку
          const btn = document.createElement('button');
          btn.className = 'garnish-btn';
          btn.textContent = window.adminGarnishes[dishName] ? 'Изменить гарнир' : 'Связать гарнир';
          btn.style.background = '#eef5ff';
          btn.style.color = '#0d6efd';
          btn.style.border = '1px solid #bfd7ff';
          btn.style.borderRadius = '6px';
          btn.style.padding = '4px 8px';
          btn.style.cursor = 'pointer';
          btn.style.marginLeft = '10px';
          btn.style.fontSize = '12px';
          
          // Добавляем обработчик
          btn.onclick = function(e) {
            e.stopPropagation();
            
            // Показываем простой выбор гарнира
            const garnish = prompt('Введите название гарнира для блюда "' + dishName + '":\n\nДоступные гарниры: Гротен, Кус-кус, Спагетти, Картофель, Рис, Гречка', window.adminGarnishes[dishName] || '');
            
            if (garnish !== null) {
              if (garnish.trim() === '') {
                // Удаляем гарнир
                delete window.adminGarnishes[dishName];
                btn.textContent = 'Связать гарнир';
                alert('Гарнир удален');
              } else {
                // Сохраняем гарнир
                window.adminGarnishes[dishName] = garnish.trim();
                btn.textContent = 'Изменить гарнир';
                alert('Гарнир "' + garnish + '" привязан к блюду "' + dishName + '"');
              }
              
              // Сохраняем в localStorage
              try {
                localStorage.setItem('adminGarnishes', JSON.stringify(window.adminGarnishes));
              } catch(e) {
                console.error('Error saving to localStorage:', e);
              }
            }
          };
          
          // Находим место для вставки кнопки
          const quantityInput = card.querySelector('input[type="number"]');
          if (quantityInput && quantityInput.parentNode) {
            quantityInput.parentNode.appendChild(btn);
          } else {
            card.appendChild(btn);
          }
        }
      });
    }
    
    // Восстанавливаем сохраненные гарниры из localStorage
    try {
      const saved = localStorage.getItem('adminGarnishes');
      if (saved) {
        window.adminGarnishes = JSON.parse(saved);
        console.log('Restored garnishes:', Object.keys(window.adminGarnishes).length);
      }
    } catch(e) {
      console.error('Error restoring garnishes:', e);
    }
    
    // Запускаем добавление кнопок
    addGarnishButtons();
    
    // Также добавляем кнопки при изменении DOM
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setTimeout(addGarnishButtons, 100);
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Периодическая проверка
    setInterval(addGarnishButtons, 2000);
    
    console.log('Admin garnish script initialized successfully');
  }
})();
EOF"