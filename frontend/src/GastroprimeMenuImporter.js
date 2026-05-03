// GastroprimeMenuImporter.js
// Специальный импортер для шаблона Gastroprime

import { useState } from 'react'

export const useGastroprimeImporter = (dailyMenus, setSelections, toDateKey) => {
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importStats, setImportStats] = useState(null)

  // Маппинг категорий шаблона → категории приложения
  const categoryMapping = {
    'Завтрак (основное блюдо)': 'Завтрак',
    'Завтрак (дополнительное блюдо)': 'Завтрак',
    'Суп со свининой': 'Обед',
    'Суп без свинины': 'Обед',
    'Второе Свинина': 'Обед',
    'Второе Альтернатива': 'Обед',
    'Гарнир Картофельный': 'Обед',
    'Гарнир крупа': 'Обед',
    'Гарнир макароны': 'Обед',
    'Салат с майонезом': 'Обед',
    'Салаты без майонеза': 'Обед',
    'Премиум меню': 'Ужин'
  }

  const handleGastroprimeImport = async (file) => {
    setImporting(true)
    setImportError('')
    setImportStats(null)

    try {
      const text = await file.text()
      const rows = text.split('\n').filter(row => row.trim())
      
      if (rows.length < 2) {
        throw new Error('Файл пустой или содержит только заголовки')
      }

      // Определяем разделитель
      const firstLine = rows[0]
      const isTsv = firstLine.includes('\t')
      const delimiter = isTsv ? '\t' : ','
      
      const headers = rows[0].split(delimiter).map(h => h.trim())
      
      // Проверяем что это наш шаблон
      const isGastroprimeTemplate = headers.some(h => 
        h.includes('Завтрак (основное блюдо)') || 
        h.includes('Суп со свининой')
      )
      
      if (!isGastroprimeTemplate) {
        throw new Error('Это не шаблон Gastroprime. Используйте правильный шаблон.')
      }

      const newSelections = {}
      let totalDishes = 0
      let totalDates = 0

      // Парсим данные
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(delimiter)
        const dateStr = values[0]?.trim()
        
        if (!dateStr) continue

        // Конвертация даты
        let dateObj
        if (dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = dateStr.split('.')
          dateObj = new Date(`${year}-${month}-${day}`)
        } else {
          dateObj = new Date(dateStr)
        }

        if (isNaN(dateObj.getTime())) {
          console.warn(`Некорректная дата: ${dateStr}`)
          continue
        }

        const dateKey = toDateKey(dateObj)
        
        // Находим меню на эту дату
        const dayMenu = dailyMenus.find(m => toDateKey(m.date) === dateKey)
        if (!dayMenu) {
          console.warn(`Меню на дату ${dateKey} не найдено`)
          continue
        }

        // Собираем блюда для этой даты
        const matchedDishes = []
        
        for (let j = 1; j < Math.min(headers.length, values.length); j++) {
          const dishName = values[j]?.trim()
          const templateCategory = headers[j]
          
          if (!dishName) continue

          // Ищем блюдо по названию
          let foundDish = null
          
          Object.values(dayMenu.items).forEach(dishes => {
            const dish = dishes.find(d => {
              const dishNameLower = d.name.toLowerCase()
              const importedNameLower = dishName.toLowerCase()
              
              // Простое сопоставление
              return dishNameLower.includes(importedNameLower) ||
                     importedNameLower.includes(dishNameLower)
            })
            
            if (dish) foundDish = dish
          })

          if (foundDish) {
            matchedDishes.push({
              dishId: foundDish.dishId,
              quantity: 1,
              name: foundDish.name
            })
            totalDishes++
          }
        }

        if (matchedDishes.length > 0) {
          newSelections[dateKey] = {
            date: dateKey,
            dishes: matchedDishes,
            utensils: 1,
            needBread: false,
            notes: `Импортировано из шаблона Gastroprime`
          }
          totalDates++
        }
      }

      if (totalDates === 0) {
        throw new Error('Не удалось импортировать ни одного дня')
      }

      // Обновляем состояние
      setSelections(prev => ({
        ...prev,
        ...newSelections
      }))

      setImportStats({
        dates: totalDates,
        dishes: totalDishes
      })

      alert(`✅ Успешно импортировано ${totalDates} дней с ${totalDishes} блюдами`)

    } catch (error) {
      setImportError(error.message)
      console.error('Ошибка импорта:', error)
    } finally {
      setImporting(false)
    }
  }

  const downloadGastroprimeTemplate = () => {
    const template = `Дата\tЗавтрак (основное блюдо)\tЗавтрак (дополнительное блюдо)\tСуп со свининой\tСуп без свинины\tВторое Свинина\tВторое Альтернатива\tГарнир Картофельный\tГарнир крупа\tГарнир макароны\tСалат с майонезом\tСалаты без майонеза \tПремиум меню
21.04.2026\tКаша овсяная молочная\tБутерброд с ветчиной и сыром на тостовом хлебе 2 шт\tБорщ с фасолью (куриный)\tУха\tТефтели свиные\tКурица по-тайски в кисло-сладком соусе\tКартофельное пюре\tРис отварной\tМакароны отварные\tСалат \"Оливье\"\tСалат \"Греческий\"\tСтейк из лосося`
    
    const blob = new Blob([template], { type: 'text/tsv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'шаблон_меню_gastroprime.tsv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    importing,
    importError,
    importStats,
    handleGastroprimeImport,
    downloadGastroprimeTemplate
  }
}

export const GastroprimeImportButton = ({ dailyMenus, setSelections, toDateKey }) => {
  const {
    importing,
    importError,
    importStats,
    handleGastroprimeImport,
    downloadGastroprimeTemplate
  } = useGastroprimeImporter(dailyMenus, setSelections, toDateKey)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleGastroprimeImport(file)
    event.target.value = ''
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <label style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }}>
          {importing ? '⏳ Импорт...' : '📁 Загрузить шаблон Gastroprime'}
          <input
            type=file
            accept=.csv,.tsv,.txt
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={importing}
          />
        </label>

        <button
          onClick={downloadGastroprimeTemplate}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          📥 Скачать шаблон
        </button>
      </div>

      {importError && (
        <div style={{ padding: 10, background: '#f8d7da', color: '#721c24', borderRadius: 8, marginBottom: 10 }}>
          ❌ {importError}
        </div>
      )}

      {importStats && (
        <div style={{ padding: 10, background: '#d4edda', color: '#155724', borderRadius: 8, marginBottom: 10 }}>
          ✅ Импортировано: <strong>{importStats.dates}</strong> дней, <strong>{importStats.dishes}</strong> блюд
        </div>
      )}

      <div style={{ fontSize: 14, color: '#666' }}>
        <strong>Формат:</strong> Экспортируйте Excel как CSV/TSV с колонками как в шаблоне
      </div>
    </div>
  )
}
