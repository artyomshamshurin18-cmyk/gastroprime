import { useState, useEffect } from 'react'
import axios from 'axios'
import { sortCategoryEntries } from './categoryOrder'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

const formatInputDate = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (value: Date, days: number) => {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

interface Dish {
  id: string
  name: string
  category?: { name: string }
  price: number
}

interface MenuImportRow {
  rowNumber: number
  date: string
  categoryName: string
  dishName: string
  dishId: string
  maxQuantity: number
  sortOrder: number
  dateAction: 'create' | 'replace'
  errors: string[]
}

interface MenuImportPreview {
  totalRows: number
  validRows: number
  errorRows: number
  dateCount: number
  createDateCount: number
  replaceDateCount: number
  rows: MenuImportRow[]
}

export default function AdminMenuPlanning({ token }: { token: string }) {
  const [date, setDate] = useState('')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [selectedDishes, setSelectedDishes] = useState<Record<string, { dishId: string; maxQuantity: number; name: string }>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [commitLoading, setCommitLoading] = useState(false)
  const [importPreview, setImportPreview] = useState<MenuImportPreview | null>(null)
  const [exportStart, setExportStart] = useState(() => formatInputDate(new Date()))
  const [exportEnd, setExportEnd] = useState(() => formatInputDate(addDays(new Date(), 29)))
  const [exporting, setExporting] = useState(false)

  useEffect(() => { loadDishes() }, [])

  const loadDishes = async () => {
    try {
      const r = await axios.get(`${API_URL}/menu/dishes`, { headers: { Authorization: `Bearer ${token}` } })
      setDishes(r.data)
    } catch (e) {
      console.error(e)
    }
  }

  const toggleDish = (dish: Dish) => {
    setSelectedDishes(prev => {
      if (prev[dish.id]) {
        const next = { ...prev }
        delete next[dish.id]
        return next
      }
      return { ...prev, [dish.id]: { dishId: dish.id, maxQuantity: 100, name: dish.name } }
    })
  }

  const updateMaxQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedDishes(prev => ({ ...prev, [id]: { ...prev[id], maxQuantity: quantity } }))
  }

  const saveMenu = async () => {
    if (!date || !Object.keys(selectedDishes).length) {
      setMessage('❌ Выберите дату и хотя бы одно блюдо')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/daily-menu`, {
        date,
        items: Object.values(selectedDishes).map((item, index) => ({ dishId: item.dishId, maxQuantity: item.maxQuantity, sortOrder: index }))
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('✅ Меню на дату сохранено')
      setSelectedDishes({})
      setDate('')
    } catch (e: any) {
      setMessage(`❌ Ошибка: ${e.response?.data?.message || e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const exportMenu = async () => {
    if (!exportStart || !exportEnd) {
      setMessage('❌ Укажите период для Excel-выгрузки')
      return
    }

    setExporting(true)
    setMessage('')
    try {
      const response = await axios.get(`${API_URL}/admin/daily-menu/export?start=${exportStart}&end=${exportEnd}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `daily-menu-${exportStart}-to-${exportEnd}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setMessage('✅ Excel с меню сформирован и скачан')
    } catch (e: any) {
      console.error(e)
      setMessage('❌ Не удалось выгрузить Excel с меню')
    } finally {
      setExporting(false)
    }
  }

  const previewImport = async () => {
    if (!importFile) {
      setMessage('❌ Сначала выбери Excel-файл')
      return
    }

    setPreviewLoading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await axios.post(`${API_URL}/admin/daily-menu/import/preview`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })

      setImportPreview(response.data)
      setMessage(response.data.errorRows > 0
        ? '⚠️ Файл разобран, но в нем есть ошибки'
        : '✅ Файл разобран, можно импортировать меню')
    } catch (e: any) {
      console.error(e)
      setMessage(`❌ ${e.response?.data?.message || 'Не удалось разобрать Excel-файл'}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const commitImport = async () => {
    if (!importPreview?.rows?.length) {
      setMessage('❌ Нет данных для импорта')
      return
    }

    if (importPreview.errorRows > 0) {
      setMessage('❌ Нельзя импортировать файл, пока в нем есть ошибки')
      return
    }

    setCommitLoading(true)
    setMessage('')
    try {
      const response = await axios.post(`${API_URL}/admin/daily-menu/import/commit`, {
        rows: importPreview.rows,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setImportPreview(null)
      setImportFile(null)
      setMessage(`✅ Импорт завершен. Обновлено дат: ${response.data.datesImported}`)
    } catch (e: any) {
      console.error(e)
      setMessage(`❌ ${e.response?.data?.message || 'Не удалось импортировать меню'}`)
    } finally {
      setCommitLoading(false)
    }
  }

  const grouped = dishes.reduce((acc: Record<string, Dish[]>, dish) => {
    const category = dish.category?.name || 'Без категории'
    if (!acc[category]) acc[category] = []
    acc[category].push(dish)
    return acc
  }, {})

  return (
    <div>
      <h2>Планирование меню</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Можно планировать меню вручную на одну дату или сразу загрузить месяц из Excel.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : message.includes('⚠️') ? '#fff3cd' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Excel-выгрузка меню</h3>
        <p style={{ color: '#666', marginTop: -5 }}>
          Можно скачать текущее планирование за период в Excel, поправить файл и потом загрузить его обратно.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} />
          <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} />
          <button onClick={exportMenu} disabled={exporting || !exportStart || !exportEnd} style={{ background: '#198754', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {exporting ? 'Формирую Excel...' : 'Скачать Excel'}
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Импорт меню по датам из Excel</h3>
        <p style={{ color: '#666', marginTop: -5 }}>
          Нужные колонки: <strong>Дата</strong>, <strong>Категория</strong>, <strong>Блюдо</strong>. Дополнительно можно указать <strong>Макс. количество</strong> и <strong>Порядок</strong>.
          Одна строка = одно блюдо на одну дату.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportPreview(null) }} />
          <button onClick={previewImport} disabled={previewLoading || !importFile} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {previewLoading ? 'Разбираю файл...' : 'Показать preview'}
          </button>
          {importPreview && (
            <button onClick={commitImport} disabled={commitLoading || importPreview.errorRows > 0} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              {commitLoading ? 'Импортирую...' : 'Подтвердить импорт'}
            </button>
          )}
        </div>

        {importPreview && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Строк всего</div><strong>{importPreview.totalRows}</strong></div>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Дат</div><strong>{importPreview.dateCount}</strong></div>
              <div style={{ background: '#d4edda', padding: 12, borderRadius: 8 }}><div style={{ color: '#155724' }}>Новых дат</div><strong>{importPreview.createDateCount}</strong></div>
              <div style={{ background: '#cfe2ff', padding: 12, borderRadius: 8 }}><div style={{ color: '#084298' }}>Заменить дат</div><strong>{importPreview.replaceDateCount}</strong></div>
              <div style={{ background: '#f8d7da', padding: 12, borderRadius: 8 }}><div style={{ color: '#721c24' }}>Ошибки</div><strong>{importPreview.errorRows}</strong></div>
            </div>

            <div style={{ maxHeight: 420, overflow: 'auto', display: 'grid', gap: 12 }}>
              {importPreview.rows.map(row => (
                <div key={`${row.rowNumber}-${row.dishName}-${row.date}`} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 14, background: row.errors.length ? '#fff5f5' : '#fcfcfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div>
                      <strong>Строка {row.rowNumber}: {row.date || 'Без даты'}</strong>
                      <div style={{ color: '#666' }}>{row.categoryName || 'Без категории'} • {row.dishName || 'Без блюда'}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 999, background: row.dateAction === 'replace' ? '#cfe2ff' : '#d4edda', color: row.dateAction === 'replace' ? '#084298' : '#155724', fontWeight: 600 }}>
                      {row.dateAction === 'replace' ? 'Заменить меню даты' : 'Создать меню даты'}
                    </div>
                  </div>
                  <div style={{ color: '#666' }}>Лимит: {row.maxQuantity}, порядок: {row.sortOrder}</div>
                  {row.errors.length > 0 && (
                    <div style={{ marginTop: 10, padding: 10, background: '#f8d7da', borderRadius: 6, color: '#721c24' }}>
                      {row.errors.map(error => <div key={error}>• {error}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Ручное планирование на одну дату</h3>
        <div style={{ marginBottom: 20, display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={saveMenu} disabled={loading} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '8px 20px' }}>
            {loading ? 'Сохранение...' : 'Сохранить меню'}
          </button>
        </div>

        {sortCategoryEntries(Object.entries(grouped)).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#007bff' }}>{category}</h4>
            {items.map(dish => {
              const selected = selectedDishes[dish.id]
              return (
                <div key={dish.id} onClick={() => toggleDish(dish)} style={{ display: 'flex', padding: 12, border: selected ? '2px solid #28a745' : '1px solid #ddd', background: selected ? '#d4edda' : 'white', marginBottom: 8, cursor: 'pointer', borderRadius: 6 }}>
                  <input type="checkbox" checked={!!selected} readOnly style={{ marginRight: 12 }} />
                  <div style={{ flex: 1 }}>{dish.name} - {dish.price} ₽</div>
                  {selected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      Max:{' '}
                      <input type="number" min="1" value={selected.maxQuantity} onChange={(e) => updateMaxQuantity(dish.id, parseInt(e.target.value) || 1)} style={{ width: 70 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
