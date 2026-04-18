import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10)

interface WeeklyMenu {
  id: string
  user: {
    email: string
    firstName: string
    lastName: string
    company: { name: string }
  }
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
      dish: { name: string; price: number }
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

export default function AdminWeeklyMenus({ token }: { token: string }) {
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()))
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return toDateInputValue(date)
  })
  const [menus, setMenus] = useState<WeeklyMenu[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadMenus = async () => {
    if (!startDate || !endDate) {
      setError('Выберите начальную и конечную дату')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await axios.get(`${API_URL}/admin/weekly-menus?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMenus(response.data)
    } catch (err) {
      console.error('Error:', err)
      setError('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  const updateStatus = async (menuId: string, newStatus: string) => {
    setUpdating(menuId)
    try {
      await axios.patch(
        `${API_URL}/admin/weekly-menus/${menuId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMenus(prev => prev.map(menu => menu.id === menuId ? { ...menu, status: newStatus } : menu))
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Не удалось обновить статус заявки')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  const getTotalPrice = (menu: WeeklyMenu) => {
    return menu.selections.reduce((total, selection) => {
      return total + selection.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
    }, 0)
  }

  return (
    <div>
      <h2>Заявки на недельное меню</h2>

      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Здесь появляются заявки клиентов. Ты можешь просмотреть выбранные блюда и поменять статус, чтобы клиент видел обновление.
      </p>

      <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadMenus} disabled={loading} style={{ padding: '8px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
          {loading ? 'Загрузка...' : 'Показать заявки'}
        </button>
      </div>

      {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: 15 }}>{error}</div>}

      {menus.length === 0 ? (
        <p>Заявок за выбранный период нет</p>
      ) : (
        menus.map(menu => (
          <div key={menu.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 20 }}>
              <div>
                <strong>{menu.user.firstName} {menu.user.lastName}</strong>
                <div style={{ color: '#666', fontSize: 14 }}>{menu.user.email}</div>
                <div style={{ color: '#007bff', fontSize: 14 }}>{menu.user.company?.name}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div>{formatDate(menu.startDate)} - {formatDate(menu.endDate)}</div>
                <div style={{ color: '#28a745', fontWeight: 'bold' }}>{getTotalPrice(menu)} ₽</div>
                <div style={{ marginTop: 8 }}>
                  <select
                    value={menu.status}
                    onChange={(e) => updateStatus(menu.id, e.target.value)}
                    disabled={updating === menu.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: '1px solid #ddd',
                      backgroundColor: statusColors[menu.status] + '20',
                      color: statusColors[menu.status],
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {menu.selections.map(selection => (
              <div key={selection.date} style={{ marginTop: 10, padding: 10, background: '#f8f9fa', borderRadius: 4 }}>
                <div style={{ fontWeight: 500, marginBottom: 5 }}>{formatDate(selection.date)}</div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  Приборов: {selection.utensils} | Хлеб: {selection.needBread ? 'да' : 'нет'} {selection.notes && `| ${selection.notes}`}
                </div>
                <div style={{ marginTop: 5 }}>
                  {selection.items.map(item => (
                    <span key={`${selection.date}-${item.dish.name}`} style={{ marginRight: 15, fontSize: 14 }}>
                      {item.dish.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
