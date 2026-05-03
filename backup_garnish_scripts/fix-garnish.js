// Скрипт для добавления кнопки "Связать гарнир" в ручной выбор
(function() {
  console.log("Fix garnish script loaded");
  
  // Ждем загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  
  function init() {
    console.log("Initializing fix garnish script");
    
    // Проверяем, находимся ли мы в ручном выборе блюд
    function isManualSelectionPage() {
      const h3 = document.querySelector("h3");
      return h3 && h3.textContent && h3.textContent.includes("Ручной выбор");
    }
    
    if (!isManualSelectionPage()) {
      console.log("Not on manual selection page");
      return;
    }
    
    // Функция для добавления кнопок
    function addGarnishButtons() {
      console.log("Looking for second dishes in manual selection...");
      
      // Ищем все карточки блюд
      const dishCards = document.querySelectorAll("div");
      
      dishCards.forEach(card => {
        // Проверяем, есть ли уже кнопка
        if (card.querySelector(".manual-garnish-btn")) return;
        
        // Проверяем стили карточки
        const style = card.getAttribute("style") || "";
        const isDishCard = style.includes("background: #fff") && style.includes("border-radius:") && style.includes("padding:");
        
        if (!isDishCard) return;
        
        // Получаем текст карточки
        const cardText = card.textContent || "";
        
        // Проверяем, является ли это вторым блюдом (по тексту)
        const isSecondDish = cardText.includes("Второе") || 
                            cardText.includes("Жаркое") || 
                            cardText.includes("Котлеты") ||
                            cardText.includes("Свинина") ||
                            cardText.includes("Куриное") ||
                            cardText.includes("Гуляш") ||
                            cardText.includes("Мясо");
        
        if (isSecondDish) {
          console.log("Found second dish in manual selection:", cardText.substring(0, 50));
          
          // Находим поле ввода количества
          const quantityInput = card.querySelector("input[type="number"]");
          if (!quantityInput) return;
          
          // Создаем кнопку
          const btn = document.createElement("button");
          btn.className = "manual-garnish-btn";
          btn.textContent = "Связать гарнир";
          btn.style.background = "#eef5ff";
          btn.style.color = "#0d6efd";
          btn.style.border = "1px solid #bfd7ff";
          btn.style.borderRadius = "6px";
          btn.style.padding = "4px 8px";
          btn.style.cursor = "pointer";
          btn.style.marginLeft = "10px";
          btn.style.fontSize = "12px";
          btn.style.marginTop = "5px";
          
          // Добавляем обработчик
          btn.onclick = function(e) {
            e.stopPropagation();
            alert("Выбор гарнира для блюда: " + cardText.substring(0, 30) + "...\n\nВ реальном интерфейсе здесь должно открыться модальное окно выбора гарнира.");
          };
          
          // Добавляем кнопку после поля ввода
          quantityInput.parentNode.appendChild(btn);
        }
      });
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
    
    console.log("Fix garnish script initialized successfully");
  }
})();
