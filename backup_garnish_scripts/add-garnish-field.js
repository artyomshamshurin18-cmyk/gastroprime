// Скрипт для добавления поля гарнира в форму редактирования блюда
(function() {
  console.log('Скрипт добавления поля гарнира загружен');
  
  // Ждем загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 1000);
  }
  
  function init() {
    console.log('Инициализация скрипта добавления поля гарнира');
    
    // Функция для добавления поля гарнира в форму
    function addGarnishField() {
      // Ищем форму редактирования блюда
      const forms = document.querySelectorAll('form, div[style*=background]');
      
      forms.forEach(form => {
        // Проверяем, есть ли уже поле гарнира
        if (form.querySelector('.garnish-field-added')) return;
        
        // Ищем поля категории (categoryId)
        const categoryField = form.querySelector('[name*=category], [id*=category], select, input');
        if (!categoryField) return;
        
        // Проверяем, что это форма блюда (есть поля name, price)
        const hasName = form.textContent.includes('Название') || form.querySelector('[name*=name]');
        const hasPrice = form.textContent.includes('Цена') || form.querySelector('[name*=price]');
        
        if (!hasName || !hasPrice) return;
        
        console.log('Найдена форма редактирования блюда, добавляем поле гарнира...');
        
        // Создаем контейнер для поля гарнира
        const garnishContainer = document.createElement('div');
        garnishContainer.className = 'garnish-field-added';
        garnishContainer.style.cssText = 'margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid #dee2e6;';
        
        // Заголовок
        const title = document.createElement('div');
        title.textContent = 'Гарнир';
        title.style.cssText = 'font-weight: bold; margin-bottom: 8px; color: #495057;';
        garnishContainer.appendChild(title);
        
        // Поле выбора гарнира
        const select = document.createElement('select');
        select.name = 'garnishDishId';
        select.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; background: white;';
        
        // Опция Без гарнира
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Без гарнира';
        select.appendChild(emptyOption);
        
        // Опции гарниров (пока статические)
        const garnishes = [
          {id: '11111111-2222-3333-4444-555555555551', name: 'Сметана'},
          {id: '11111111-2222-3333-4444-555555555552', name: 'Кетчуп'},
          {id: '11111111-2222-3333-4444-555555555553', name: 'Майонез'},
          {id: '11111111-2222-3333-4444-555555555554', name: 'Джем'},
          {id: '11111111-2222-3333-4444-555555555555', name: 'Соус'}
        ];
        
        garnishes.forEach(garnish => {
          const option = document.createElement('option');
          option.value = garnish.id;
          option.textContent = garnish.name;
          select.appendChild(option);
        });
        
        garnishContainer.appendChild(select);
        
        // Описание
        const desc = document.createElement('div');
        desc.textContent = 'Выберите гарнир для этого блюда';
        desc.style.cssText = 'font-size: 12px; color: #6c757d; margin-top: 5px;';
        garnishContainer.appendChild(desc);
        
        // Добавляем поле после поля категории
        categoryField.parentNode.insertBefore(garnishContainer, categoryField.nextSibling);
        
        console.log('Поле гарнира добавлено');
      });
    }
    
    // Запускаем добавление поля
    addGarnishField();
    
    // Также добавляем при изменении DOM
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setTimeout(addGarnishField, 100);
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Периодическая проверка
    setInterval(addGarnishField, 2000);
  }
})();
