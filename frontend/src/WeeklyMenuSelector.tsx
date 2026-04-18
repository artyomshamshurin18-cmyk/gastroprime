import { useState, useEffect } from 'react'
import axios from 'axios'
import { sortCategoryEntries } from './categoryOrder'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

interface Dish {
  id: string
  dishId: string
  name: string
  description?: string
  photoUrl?: string | null
  price: number
  maxQuantity: number
  calories?: number | null
  weight?: number | null
  measureUnit?: string
  containsPork?: boolean
  containsGarlic?: boolean
  containsMayonnaise?: boolean
}

interface DailyMenu {
  date: string
  items: Record<string, Dish[]>
}

interface SelectedDish {
  dishId: string
  quantity: number
  name: string
}

interface DaySelection {
  date: string
  dishes: SelectedDish[]
  utensils: number
  needBread: boolean
  notes: string
}

interface MyWeeklyMenu {
  id: string
  startDate: string
  endDate: string
  status: string
  selections: Array<{
    date: string
    utensils: number
    needBread: boolean
    notes: string
    items: Array<{
      quantity: number
      dish: {
        name: string
        price: number
        description?: string
        photoUrl?: string | null
        calories?: number | null
        weight?: number | null
        measureUnit?: string
        containsPork?: boolean
        containsGarlic?: boolean
        containsMayonnaise?: boolean
      }
    }>
  }>
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  PENDING: 'На рассмотрении',
  CONFIRMED: 'Подтверждено',
  REJECTED: 'Отклонено',
  COMPLETED: 'Выполнено'
}

const statusColors: Record<string, string> = {
  DRAFT: '#6c757d',
  PENDING: '#ffc107',
  CONFIRMED: '#28a745',
  REJECTED: '#dc3545',
  COMPLETED: '#17a2b8'
}

const measureUnitLabels: Record<string, string> = {
  GRAM: 'г',
  ML: 'мл',
  PCS: 'порц.',
  PIECE: 'шт',
  PORTION: 'порц.',
}

const toDateKey = (value: string) => value.slice(0, 10)

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (value: Date, days: number) => {
  const next = new Date(value)
  next.setHours(12, 0, 0, 0)
  next.setDate(next.getDate() + days)
  return next
}

const buildPlanningDates = (count = 7) => {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Array.from({ length: count }, (_, index) => formatIsoDate(addDays(today, index + 1)))
}

const getDishFacts = (dish: {
  weight?: number | null
  measureUnit?: string
  calories?: number | null
  containsPork?: boolean
  containsGarlic?: boolean
  containsMayonnaise?: boolean
}) => {
  const facts = [] as string[]

  if (dish.weight) {
    facts.push(`${dish.weight} ${measureUnitLabels[dish.measureUnit || 'GRAM'] || (dish.measureUnit || '').toLowerCase() || 'г'}`)
  }
  if (dish.calories) facts.push(`${dish.calories} ккал`)
  if (dish.containsPork) facts.push('Есть свинина')
  if (dish.containsGarlic) facts.push('Есть чеснок')
  if (dish.containsMayonnaise) facts.push('Есть майонез')

  return facts
}

export default function WeeklyMenuSelector({ token, mode = 'planning' }: { token: string, mode?: 'planning' | 'requests' }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [planningDates, setPlanningDates] = useState<string[]>([])
  const [activeDate, setActiveDate] = useState('')
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([])
  const [selections, setSelections] = useState<Record<string, DaySelection>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null)
  const [removingDayKey, setRemovingDayKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [myMenus, setMyMenus] = useState<MyWeeklyMenu[]>([])

  const loadMyMenus = async () => {
    try {
      const response = await axios.get(`${API_URL}/weekly-menu/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyMenus(Array.isArray(response.data) ? response.data : response.data ? [response.data] : [])
    } catch (err) {
      console.error('Error loading my menus:', err)
    }
  }

  const loadMenusForRange = async (rangeStart: string, rangeEnd: string) => {
    if (!rangeStart || !rangeEnd) return

    setLoading(true)
    setError(null)

    try {
      const url = `${API_URL}/daily-menu/by-range?start=${rangeStart}&end=${rangeEnd}`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const menus = Array.isArray(response.data) ? response.data : []
      setDailyMenus(menus)

      const initialSelections: Record<string, DaySelection> = {}
      menus.forEach((menu: DailyMenu) => {
        const dateKey = toDateKey(menu.date)
        initialSelections[dateKey] = {
          date: dateKey,
          dishes: [],
          utensils: 1,
          needBread: true,
          notes: ''
        }
      })
      setSelections(initialSelections)

      const availableDates = menus.map((menu: DailyMenu) => toDateKey(menu.date))
      setActiveDate(prev => {
        if (prev && availableDates.includes(prev)) return prev
        return availableDates[0] || rangeStart
      })
    } catch (err: any) {
      setDailyMenus([])
      setSelections({})
      setError(`Ошибка: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshPlanningWindow = async () => {
    const dates = buildPlanningDates(7)
    setPlanningDates(dates)
    setStartDate(dates[0])
    setEndDate(dates[dates.length - 1])
    setActiveDate(prev => prev && dates.includes(prev) ? prev : dates[0])
    await loadMenusForRange(dates[0], dates[dates.length - 1])
  }

  useEffect(() => {
    loadMyMenus()
    if (mode === 'planning') {
      refreshPlanningWindow()
    }
  }, [mode])

  const toggleDish = (date: string, dish: Dish) => {
    const dateKey = toDateKey(date)
    setSelections(prev => {
      const current = prev[dateKey] || { date: dateKey, dishes: [], utensils: 1, needBread: true, notes: '' }
      const exists = current.dishes.find(d => d.dishId === dish.dishId)

      const newDishes = exists
        ? current.dishes.filter(d => d.dishId !== dish.dishId)
        : [...current.dishes, { dishId: dish.dishId, quantity: 1, name: dish.name }]

      return { ...prev, [dateKey]: { ...current, dishes: newDishes } }
    })
  }

  const updateQuantity = (date: string, dishId: string, quantity: number) => {
    if (quantity < 1) return
    const dateKey = toDateKey(date)
    setSelections(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        dishes: prev[dateKey].dishes.map(d => d.dishId === dishId ? { ...d, quantity } : d)
      }
    }))
  }

  const updateDaySettings = (date: string, field: keyof DaySelection, value: any) => {
    const dateKey = toDateKey(date)
    setSelections(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [field]: value }
    }))
  }

  const isDishSelected = (date: string, dishId: string) => {
    const dateKey = toDateKey(date)
    return selections[dateKey]?.dishes.some(d => d.dishId === dishId) || false
  }

  const getSelectedQuantity = (date: string, dishId: string) => {
    const dateKey = toDateKey(date)
    return selections[dateKey]?.dishes.find(d => d.dishId === dishId)?.quantity || 1
  }

  const saveSelection = async () => {
    const hasSelections = Object.values(selections).some(s => s.dishes.length > 0)
    if (!hasSelections) {
      setError('Выберите хотя бы одно блюдо')
      return
    }

    setSaving(true)
    try {
      await axios.post(`${API_URL}/weekly-menu`, {
        startDate,
        endDate,
        selections: Object.values(selections).filter(s => s.dishes.length > 0).map(s => ({
          date: s.date,
          utensils: s.utensils,
          needBread: s.needBread,
          notes: s.notes,
          items: s.dishes.map(d => ({ dishId: d.dishId, quantity: d.quantity }))
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Меню сохранено!')
      loadMyMenus()
    } catch (err: any) {
      setError(`Ошибка сохранения: ${err.response?.data?.message || err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  const formatDateButton = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long'
    })
  }

  const getTotalPrice = () => {
    let total = 0
    dailyMenus.forEach(menu => {
      const dateKey = toDateKey(menu.date)
      Object.entries(menu.items).forEach(([_, dishes]) => {
        dishes.forEach(dish => {
          const selected = selections[dateKey]?.dishes.find(d => d.dishId === dish.dishId)
          if (selected) {
            total += dish.price * selected.quantity
          }
        })
      })
    })
    return total
  }

  const getMenuTotalPrice = (menu: MyWeeklyMenu) => {
    return menu.selections.reduce((total, sel) => {
      return total + sel.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
    }, 0)
  }

  const getSelectionTotalPrice = (selection: MyWeeklyMenu['selections'][number]) => {
    return selection.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
  }

  const deleteMenu = async (menuId: string) => {
    if (!window.confirm('Удалить всю заявку на этот период?')) return

    setDeletingMenuId(menuId)
    setError(null)
    try {
      await axios.delete(`${API_URL}/weekly-menu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadMyMenus()
    } catch (err: any) {
      setError(`Ошибка удаления заявки: ${err.response?.data?.message || err.message}`)
    } finally {
      setDeletingMenuId(null)
    }
  }

  const deleteSelectionDay = async (menuId: string, date: string) => {
    if (!window.confirm(`Отменить заявку на ${formatDate(date)}?`)) return

    const key = `${menuId}-${date}`
    setRemovingDayKey(key)
    setError(null)
    try {
      await axios.delete(`${API_URL}/weekly-menu/${menuId}/day/${encodeURIComponent(date.slice(0, 10))}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadMyMenus()
    } catch (err: any) {
      setError(`Ошибка отмены дня: ${err.response?.data?.message || err.message}`)
    } finally {
      setRemovingDayKey(null)
    }
  }

  const activeMenu = dailyMenus.find(menu => toDateKey(menu.date) === activeDate)
  const selectedDaysCount = Object.values(selections).filter(s => s.dishes.length > 0).length

  const requestsView = (
    <div style={{ marginTop: 10, display: 'grid', gap: 16 }}>
      {myMenus.length === 0 ? (
        <p style={{ color: '#666' }}>У вас пока нет запланированных заявок</p>
      ) : (
        myMenus.map(menu => (
          <div key={menu.id} style={{
            background: '#fff',
            padding: 18,
            borderRadius: 18,
            border: '1px solid rgba(237,57,21,0.10)',
            borderLeft: `4px solid ${statusColors[menu.status]}`,
            boxShadow: '0 14px 32px rgba(38, 23, 14, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ fontSize: 18 }}>{formatDate(menu.startDate)} - {formatDate(menu.endDate)}</strong>
                <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                  {menu.selections.length} дней • {getMenuTotalPrice(menu)} ₽
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: statusColors[menu.status] + '20',
                  color: statusColors[menu.status],
                  fontWeight: 'bold',
                  fontSize: 13
                }}>
                  {statusLabels[menu.status]}
                </span>
                <button onClick={() => deleteMenu(menu.id)} disabled={deletingMenuId === menu.id} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #f1c0c7', background: '#fff5f6', color: '#b42318' }}>
                  {deletingMenuId === menu.id ? 'Удаляю...' : 'Удалить заявку'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {menu.selections.map(selection => {
                const dayKey = `${menu.id}-${selection.date}`
                const dayTotal = getSelectionTotalPrice(selection)
                return (
                  <div key={dayKey} style={{ border: '1px solid #eee4da', borderRadius: 16, padding: 16, background: '#fffdfb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{formatDate(selection.date)}</strong>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{selection.items.length} блюд • {dayTotal} ₽</div>
                      </div>
                      <button onClick={() => deleteSelectionDay(menu.id, selection.date)} disabled={removingDayKey === dayKey} style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #f1c0c7', background: '#fff5f6', color: '#b42318' }}>
                        {removingDayKey === dayKey ? 'Отменяю...' : 'Отменить день'}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                      {selection.items.map((item, index) => {
                        const facts = getDishFacts(item.dish)
                        return (
                          <div key={`${dayKey}-${item.dish.name}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 14, background: '#fff', border: '1px solid #f1e5db', flexWrap: 'wrap' }}>
                            <div style={{ width: 76, height: 76, borderRadius: 14, overflow: 'hidden', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                              {item.dish.photoUrl ? <img src={mediaUrl(item.dish.photoUrl)} alt={item.dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#aaa', fontSize: 11 }}>Фото</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <div style={{ fontWeight: 700 }}>{item.dish.name}</div>
                              {item.dish.description && <div style={{ marginTop: 4, color: '#666', lineHeight: 1.45 }}><strong>Состав:</strong> {item.dish.description}</div>}
                              {facts.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                                  {facts.map(fact => <span key={fact} style={{ padding: '4px 8px', borderRadius: 999, background: '#fff4ee', color: '#b53b1f', fontSize: 12, fontWeight: 600 }}>{fact}</span>)}
                                </div>
                              )}
                            </div>
                            <div style={{ minWidth: 110, marginLeft: 'auto', textAlign: 'right', fontWeight: 700 }}>
                              {item.quantity} × {item.dish.price} ₽
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {(selection.notes || selection.utensils || selection.needBread) && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: '#fff7f1', color: '#6b4b3a', display: 'grid', gap: 4 }}>
                        <div>Приборов: {selection.utensils}</div>
                        <div>Хлеб: {selection.needBread ? 'нужен' : 'не нужен'}</div>
                        {selection.notes && <div>Комментарий: {selection.notes}</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div style={{ padding: 0 }}>
      {mode === 'requests' ? (
        <>
          <h2>Запланированные заявки</h2>
          <p style={{ color: '#666', marginTop: -5, marginBottom: 20 }}>Здесь собраны все ваши заявки на плановое меню, их состав, суммы и статусы. При необходимости можно отменить отдельный день или удалить всю заявку.</p>
          {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: 15 }}>{error}</div>}
          {requestsView}
        </>
      ) : (
        <>
          <h2>Планирование меню</h2>
          <p style={{ color: '#666', marginTop: -5, marginBottom: 20 }}>Здесь всегда показано меню на ближайшие 7 дней, начиная с завтрашнего. Просто выберите нужную дату кнопкой и соберите заказ на этот день.</p>

          <h3>Выберите день</h3>
          <div style={{ display: 'grid', gap: 10, marginBottom: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {planningDates.map(date => {
              const hasMenu = dailyMenus.some(menu => toDateKey(menu.date) === date)
              const isActive = activeDate === date
              const selectedCount = selections[date]?.dishes.length || 0

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setActiveDate(date)}
                  disabled={loading}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: isActive ? '2px solid #ed3915' : '1px solid #eadfd6',
                    background: isActive ? 'linear-gradient(135deg, #fff2ec 0%, #ffffff 100%)' : '#fff',
                    color: '#1f1a17',
                    boxShadow: isActive ? '0 12px 24px rgba(237, 57, 21, 0.12)' : '0 8px 20px rgba(38, 23, 14, 0.05)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{formatDateButton(date)}</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{new Date(date).toLocaleDateString('ru-RU', { weekday: 'long' })}</div>
                  <div style={{ fontSize: 12, marginTop: 8, color: hasMenu ? (selectedCount > 0 ? '#198754' : '#8b5e3c') : '#b42318', fontWeight: 600 }}>
                    {!hasMenu ? 'Меню пока нет' : selectedCount > 0 ? `Выбрано блюд: ${selectedCount}` : 'Открыть меню'}
                  </div>
                </button>
              )
            })}
          </div>

          {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: 15 }}>{error}</div>}

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: 8 }}>
              Загрузка меню...
            </div>
          ) : !activeMenu ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: 8 }}>
              На {activeDate ? formatDate(activeDate) : 'выбранный день'} меню пока не опубликовано.
            </div>
          ) : (
            <div>
              <div key={activeMenu.date} style={{ border: '1px solid rgba(237,57,21,0.10)', borderRadius: 18, marginBottom: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 14px 32px rgba(38, 23, 14, 0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #fff7f1 0%, #ffffff 100%)', padding: 18, borderBottom: '1px solid #f1e5db' }}>
                  <h3 style={{ margin: 0 }}>{formatDate(activeMenu.date)}</h3>
                </div>

                <div style={{ padding: 15, background: '#fff', borderBottom: '1px solid #f1e5db', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 110 }}>
                    <label style={{ fontSize: 13 }}>Приборов</label>
                    <input
                      type="number"
                      min="1"
                      value={selections[toDateKey(activeMenu.date)]?.utensils || 1}
                      onChange={(e) => updateDaySettings(activeMenu.date, 'utensils', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', maxWidth: 90, padding: 6, marginTop: 4 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffaf5', border: '1px solid #f0ddd3', borderRadius: 12, padding: '10px 12px' }}>
                    <input
                      type="checkbox"
                      checked={selections[toDateKey(activeMenu.date)]?.needBread ?? true}
                      onChange={(e) => updateDaySettings(activeMenu.date, 'needBread', e.target.checked)}
                    />
                    <label>Нужен хлеб</label>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input
                      type="text"
                      value={selections[toDateKey(activeMenu.date)]?.notes || ''}
                      onChange={(e) => updateDaySettings(activeMenu.date, 'notes', e.target.value)}
                      placeholder="Примечания..."
                      style={{ width: '100%', padding: 10 }}
                    />
                  </div>
                </div>

                <div style={{ padding: 20 }}>
                  {sortCategoryEntries(Object.entries(activeMenu.items)).map(([category, dishes]) => (
                    <div key={category} style={{ marginBottom: 20 }}>
                      <h4 style={{ color: '#b53b1f', marginBottom: 12, fontSize: 18 }}>{category}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {dishes.map(dish => {
                          const selected = isDishSelected(activeMenu.date, dish.dishId)
                          const facts = getDishFacts(dish)
                          return (
                            <div
                              key={dish.id}
                              onClick={() => toggleDish(activeMenu.date, dish)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                flexWrap: 'wrap',
                                padding: 14,
                                border: selected ? '2px solid #28a745' : '1px solid #ece3da',
                                borderRadius: 16,
                                cursor: 'pointer',
                                background: selected ? 'linear-gradient(135deg, #effaf2 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fffdfb 0%, #ffffff 100%)',
                                boxShadow: selected ? '0 10px 24px rgba(25, 135, 84, 0.10)' : '0 10px 24px rgba(44, 27, 18, 0.04)'
                              }}
                            >
                              <input type="checkbox" checked={selected} readOnly style={{ marginRight: 12 }} />
                              <div style={{ width: 88, height: 88, borderRadius: 14, overflow: 'hidden', background: '#f6f6f6', border: selected ? '2px solid rgba(25, 135, 84, 0.25)' : '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                                {dish.photoUrl ? <img src={mediaUrl(dish.photoUrl)} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', transform: 'scale(1.08)' }} /> : <span style={{ color: '#aaa', fontSize: 11 }}>Фото</span>}
                              </div>
                              <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{dish.name}</div>
                                {dish.description && <div style={{ fontSize: 14, lineHeight: 1.45, color: '#666', marginTop: 4 }}><strong>Состав:</strong> {dish.description}</div>}
                                {facts.length > 0 && (
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                                    {facts.map(fact => <span key={fact} style={{ padding: '4px 8px', borderRadius: 999, background: '#fff4ee', color: '#b53b1f', fontSize: 12, fontWeight: 600 }}>{fact}</span>)}
                                  </div>
                                )}
                              </div>
                              <div style={{ textAlign: 'right', marginLeft: 'auto', minWidth: 110 }}>
                                <div style={{ display: 'inline-block', padding: '7px 10px', borderRadius: 999, background: '#fff4ee', color: '#b53b1f', fontWeight: 700 }}>{dish.price} ₽</div>
                              </div>
                              {selected && (
                                <div style={{ marginLeft: 0, background: '#fff', border: '1px solid #dcefe2', borderRadius: 12, padding: 10 }} onClick={(e) => e.stopPropagation()}>
                                  <label style={{ fontSize: 12, marginRight: 5, display: 'block', marginBottom: 4 }}>Кол-во:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={getSelectedQuantity(activeMenu.date, dish.dishId)}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      if (val === '') return
                                      updateQuantity(activeMenu.date, dish.dishId, parseInt(val) || 1)
                                    }}
                                    style={{ width: 72, padding: 6, textAlign: 'center' }}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {selections[toDateKey(activeMenu.date)]?.dishes.length > 0 && (
                  <div style={{ padding: 16, background: 'linear-gradient(135deg, #effaf2 0%, #ffffff 100%)', borderTop: '1px solid #cfe8d6' }}>
                    <strong>Выбрано:</strong> {selections[toDateKey(activeMenu.date)].dishes.map(d => `${d.name} (${d.quantity}шт)`).join(', ')}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: 20, background: 'linear-gradient(135deg, #fff7f1 0%, #ffffff 100%)', borderRadius: 18, marginBottom: 20, border: '1px solid rgba(237,57,21,0.10)', boxShadow: '0 14px 32px rgba(38, 23, 14, 0.06)' }}>
                <div>
                  <strong style={{ fontSize: 22 }}>Итого: {getTotalPrice()} ₽</strong>
                  <span style={{ marginLeft: 20, color: '#666', display: 'inline-block' }}>
                    Выбрано дней: {selectedDaysCount}
                  </span>
                </div>
                <button onClick={saveSelection} disabled={saving} style={{ padding: '15px 30px', background: saving ? '#ccc' : 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: 'white', border: 'none', borderRadius: 14, width: '100%', maxWidth: 320, fontWeight: 700 }}>
                  {saving ? 'Сохранение...' : '💾 Сохранить выбор'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
