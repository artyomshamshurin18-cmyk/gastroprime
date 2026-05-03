// WeeklyMenuSelector с поддержкой импорта шаблона Gastroprime

import { useState, useEffect } from 'react'
import axios from 'axios'
import { sortCategoryEntries } from './categoryOrder'
import { GastroprimeImportButton } from './GastroprimeMenuImporter'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

// ... (все интерфейсы остаются как были) ...

export default function WeeklyMenuSelector({ token, companyId }: { token: string; companyId?: string }) {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 6)
    return date.toISOString().slice(0, 10)
  })
  const [dailyMenus, setDailyMenus] = useState([])
  const [myMenu, setMyMenu] = useState(null)
  const [selections, setSelections] = useState({})
  const [activeDate, setActiveDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toDateKey = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().slice(0, 10)
  }

  const loadDailyMenus = async () => {
    if (!startDate || !endDate) {
      setError('Выберите начальную и конечную дату')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await axios.get(`${API_URL}/daily-menu?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDailyMenus(response.data)

      const myMenuResponse = await axios.get(`${API_URL}/weekly-menu/my?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (myMenuResponse.data.length > 0) {
        const menu = myMenuResponse.data[0]
        setMyMenu(menu)

        const initialSelections = {}
        menu.selections.forEach((sel) => {
          const dateKey = toDateKey(sel.date)
          initialSelections[dateKey] = {
            date: dateKey,
            dishes: sel.items.map((item) => ({
              dishId: item.dish.id,
              quantity: item.quantity,
              name: item.dish.name
            })),
            utensils: sel.utensils,
            needBread: sel.needBread,
            notes: sel.notes || ''
          }
        })
        setSelections(initialSelections)
      } else {
        setMyMenu(null)
        setSelections({})
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Не удалось загрузить меню')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDailyMenus()
  }, [startDate, endDate])

  // ... (все остальные функции остаются как были) ...

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 18, color: '#666' }}>Загрузка меню...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, marginBottom: 20, color: '#2c1b12' }}>Выбор меню на неделю</h1>
        
        {/* КНОПКИ ИМПОРТА ШАБЛОНА GASTROPRIME */}
        <GastroprimeImportButton 
          dailyMenus={dailyMenus}
          setSelections={setSelections}
          toDateKey={toDateKey}
        />

        <div style={{ display: 'grid', gap: 10, marginBottom: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Начальная дата</label>
            <input
              type=date
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Конечная дата</label>
            <input
              type=date
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={loadDailyMenus}
              style={{ padding: '12px 24px', background: '#ed3915', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}
            >
              Обновить
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: 15, background: '#f8d7da', color: '#721c24', borderRadius: 8, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {myMenu && (
          <div style={{ padding: 15, background: '#d4edda', color: '#155724', borderRadius: 8, marginBottom: 20 }}>
            ✅ У вас уже есть сохраненное меню на этот период. Вы можете его изменить.
          </div>
        )}
      </div>

      {/* ... (остальная часть компонента остается без изменений) ... */}
    </div>
  )
}
