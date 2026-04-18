import { useEffect, useMemo, useState, type ReactNode } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

const cardStyle = {
  background: '#fff',
  padding: 18,
  borderRadius: 12,
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
} as const

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 22,
} as const

const segmentColors: Record<string, string> = {
  A: '#198754',
  B: '#fd7e14',
  C: '#dc3545',
}

function formatCurrency(value: number) {
  return `${(value || 0).toLocaleString('ru-RU')} ₽`
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ru-RU')
}

function Chip({ children, background = '#eef2f6', color = '#334155' }: { children: ReactNode, background?: string, color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, background, color, fontSize: 13, fontWeight: 600 }}>
      {children}
    </span>
  )
}

export default function AdminAnalytics({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any[]>([])
  const [abc, setAbc] = useState<any>({ ordersABC: [], selectionsABC: [] })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [filters, setFilters] = useState({ start: '', end: '' })

  const loadAnalytics = async (nextFilters = filters) => {
    setLoading(true)
    setMessage('')
    try {
      const params = {
        ...(nextFilters.start ? { start: nextFilters.start } : {}),
        ...(nextFilters.end ? { end: nextFilters.end } : {}),
      }

      const [statsResponse, usersResponse, abcResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/user-analytics`, { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get(`${API_URL}/admin/abc-analysis`, { headers: { Authorization: `Bearer ${token}` }, params }),
      ])

      setStats(statsResponse.data)
      setUserAnalytics(usersResponse.data)
      setAbc(abcResponse.data)
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось загрузить аналитику'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const topUser = userAnalytics[0]
  const topRevenueDish = abc.ordersABC?.[0]
  const topSelectionDish = abc.selectionsABC?.[0]

  const statusChips = useMemo(() => {
    if (!stats?.ordersByStatus) return []
    return Object.entries(stats.ordersByStatus)
  }, [stats])

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #ffffff 0%, #f5f8ff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h2 style={sectionTitleStyle}>Аналитика</h2>
            <p style={{ color: '#64748b', margin: 0, maxWidth: 780 }}>
              Здесь видно, кто заказывает больше всех, что чаще выбирают клиенты и какие блюда попадают в сегменты A, B и C.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>С</span>
              <input type="date" value={filters.start} onChange={(e) => setFilters(prev => ({ ...prev, start: e.target.value }))} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>По</span>
              <input type="date" value={filters.end} onChange={(e) => setFilters(prev => ({ ...prev, end: e.target.value }))} />
            </label>
            <button onClick={() => loadAnalytics()} disabled={loading} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', height: 40, marginTop: 18 }}>
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
            <button onClick={() => { const next = { start: '', end: '' }; setFilters(next); loadAnalytics(next) }} disabled={loading} style={{ background: '#e9ecef', color: '#212529', border: 'none', borderRadius: 8, padding: '10px 16px', height: 40, marginTop: 18 }}>
              Сбросить
            </button>
          </div>
        </div>

        {message && <div style={{ marginTop: 16, padding: 12, background: '#f8d7da', borderRadius: 8 }}>{message}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={cardStyle}><div style={{ color: '#64748b', marginBottom: 8 }}>Пользователи</div><strong style={{ fontSize: 28 }}>{stats?.totalUsers ?? 0}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b', marginBottom: 8 }}>Заказы</div><strong style={{ fontSize: 28 }}>{stats?.totalOrders ?? 0}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b', marginBottom: 8 }}>Заказы сегодня</div><strong style={{ fontSize: 28 }}>{stats?.todayOrders ?? 0}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b', marginBottom: 8 }}>Выручка</div><strong style={{ fontSize: 28 }}>{formatCurrency(stats?.totalRevenue ?? 0)}</strong></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', marginBottom: 6 }}>Лидер по выручке</div>
          <strong style={{ fontSize: 18 }}>{topUser ? ([topUser.firstName, topUser.lastName].filter(Boolean).join(' ') || topUser.email) : '—'}</strong>
          <div style={{ color: '#64748b', marginTop: 8 }}>{topUser ? formatCurrency(topUser.totalSpent) : 'Нет данных'}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', marginBottom: 6 }}>Топ блюдо по выручке</div>
          <strong style={{ fontSize: 18 }}>{topRevenueDish?.name || '—'}</strong>
          <div style={{ color: '#64748b', marginTop: 8 }}>{topRevenueDish ? formatCurrency(topRevenueDish.metric) : 'Нет данных'}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', marginBottom: 6 }}>Топ блюдо по выборам</div>
          <strong style={{ fontSize: 18 }}>{topSelectionDish?.name || '—'}</strong>
          <div style={{ color: '#64748b', marginTop: 8 }}>{topSelectionDish ? `${topSelectionDish.metric} выборов` : 'Нет данных'}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>Статусы заказов</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {statusChips.map(([status, count]) => (
            <Chip key={status}>{status}: {String(count)}</Chip>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Пользователи и их поведение</h3>
          <div style={{ color: '#64748b', fontSize: 14 }}>Сортировка по сумме заказов</div>
        </div>

        {loading && userAnalytics.length === 0 ? <p>Загрузка...</p> : userAnalytics.length === 0 ? <p>Пока нет данных</p> : (
          <div style={{ display: 'grid', gap: 14 }}>
            {userAnalytics.map((user) => (
              <div key={user.userId} style={{ border: '1px solid #edf2f7', borderRadius: 12, padding: 18, background: '#fcfdff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                      <strong style={{ fontSize: 18 }}>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</strong>
                      {user.allergies && <Chip background="#fff3cd" color="#856404">Есть аллергии</Chip>}
                    </div>
                    <div style={{ color: '#64748b', display: 'grid', gap: 4 }}>
                      <span>{user.email}</span>
                      {user.phone && <span>{user.phone}</span>}
                      {user.companyName && <span>{user.companyName}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Баланс</span><strong>{formatCurrency(user.balance)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Лимит</span><strong>{formatCurrency(user.limit)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Лимит/день</span><strong>{formatCurrency(user.dailyLimit)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Последний заказ</span><strong>{formatDate(user.lastOrderDate)}</strong></div>
                  </div>
                </div>

                {user.allergies && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#fff7e6', color: '#8a5a00' }}>
                    Аллергии: {user.allergies}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 14 }}>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}><div style={{ color: '#64748b', fontSize: 13 }}>Заказов</div><strong>{user.totalOrders}</strong></div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}><div style={{ color: '#64748b', fontSize: 13 }}>Сумма</div><strong>{formatCurrency(user.totalSpent)}</strong></div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}><div style={{ color: '#64748b', fontSize: 13 }}>Средний чек</div><strong>{formatCurrency(user.averageOrderValue)}</strong></div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}><div style={{ color: '#64748b', fontSize: 13 }}>Заявок</div><strong>{user.weeklyMenuCount}</strong></div>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}><div style={{ color: '#64748b', fontSize: 13 }}>Выбрано блюд</div><strong>{user.selectedDishCount}</strong></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Топ блюд</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {user.topDishes?.length ? user.topDishes.map((dish: any) => <Chip key={dish.name}>{dish.name} ({dish.quantity})</Chip>) : 'Нет данных'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Топ категорий</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {user.topCategories?.length ? user.topCategories.map((category: any) => <Chip key={category.name}>{category.name} ({category.quantity})</Chip>) : 'Нет данных'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>ABC по выручке</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {abc.ordersABC?.length ? abc.ordersABC.slice(0, 15).map((item: any) => (
              <div key={`revenue-${item.name}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 60px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{item.category}</div>
                </div>
                <div>{formatCurrency(item.metric)}</div>
                <div>{item.share}%</div>
                <Chip background={`${segmentColors[item.segment] || '#6c757d'}20`} color={segmentColors[item.segment] || '#6c757d'}>{item.segment}</Chip>
              </div>
            )) : <p>Нет данных</p>}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>ABC по выборам клиентов</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {abc.selectionsABC?.length ? abc.selectionsABC.slice(0, 15).map((item: any) => (
              <div key={`selection-${item.name}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 60px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{item.category}</div>
                </div>
                <div>{item.metric}</div>
                <div>{item.share}%</div>
                <Chip background={`${segmentColors[item.segment] || '#6c757d'}20`} color={segmentColors[item.segment] || '#6c757d'}>{item.segment}</Chip>
              </div>
            )) : <p>Нет данных</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
