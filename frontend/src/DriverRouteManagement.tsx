import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

interface RouteDish {
  name: string
  quantity: number
}

interface RouteCompany {
  companyId: string
  companyName: string
  address: string
  contactPerson: string
  contactPhone: string
  deliveryTime: string
  dishes: RouteDish[]
  status: string
  notes: string
  latitude?: number
  longitude?: number
}

interface RouteData {
  date: string
  points: RouteCompany[]
}

const statusFlow = ['PENDING', 'EN_ROUTE', 'ARRIVED', 'UNLOADING', 'COMPLETED']

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидание',
  EN_ROUTE: 'В пути',
  ARRIVED: 'Прибыл',
  UNLOADING: 'Отгружаю',
  COMPLETED: 'Выполнено',
}

const statusColors: Record<string, string> = {
  PENDING: '#6c757d',
  EN_ROUTE: '#0d6efd',
  ARRIVED: '#198754',
  UNLOADING: '#fd7e14',
  COMPLETED: '#198754',
}

export default function DriverRouteManagement({ token }: { token: string }) {
  const [route, setRoute] = useState<RouteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingCompanyId, setUpdatingCompanyId] = useState<string | null>(null)
  const [notesInput, setNotesInput] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({})
  const notesTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const loadRoute = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/driver/my-routes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRoute(response.data)
      const initialNotes: Record<string, string> = {}
      response.data.points?.forEach((p: RouteCompany) => {
        initialNotes[p.companyId] = p.notes || ''
      })
      setNotesInput(initialNotes)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось загрузить маршрут')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoute()
  }, [])

  const advanceStatus = async (companyId: string, currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) return

    const nextStatus = statusFlow[currentIndex + 1]
    setUpdatingCompanyId(companyId)
    try {
      await axios.patch(
        `${API_URL}/driver/routes/${companyId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRoute((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          points: prev.points.map((p) =>
            p.companyId === companyId ? { ...p, status: nextStatus } : p
          ),
        }
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось обновить статус')
    } finally {
      setUpdatingCompanyId(null)
    }
  }

  const saveNotes = async (companyId: string) => {
    setSavingNotes((prev) => ({ ...prev, [companyId]: true }))
    try {
      await axios.patch(
        `${API_URL}/driver/routes/${companyId}/notes`,
        { notes: notesInput[companyId] || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось сохранить заметку')
    } finally {
      setSavingNotes((prev) => ({ ...prev, [companyId]: false }))
    }
  }

  const handleNotesChange = (companyId: string, value: string) => {
    setNotesInput((prev) => ({ ...prev, [companyId]: value }))

    if (notesTimers.current[companyId]) {
      clearTimeout(notesTimers.current[companyId])
    }

    notesTimers.current[companyId] = setTimeout(() => {
      saveNotes(companyId)
    }, 1500)
  }

  const openInMaps = (address: string, lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(address)}`,
        '_blank'
      )
    }
  }

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <h2>📍 Маршрут на сегодня</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 18 }}>
        {today}
      </p>

      {error && (
        <div
          style={{
            padding: 12,
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading && <div style={{ color: '#666' }}>Загрузка маршрута...</div>}

      {!loading && route && route.points?.length === 0 && (
        <div
          className="gp-soft-block"
          style={{ textAlign: 'center', padding: 48 }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <div>На сегодня маршрутов нет</div>
        </div>
      )}

      {!loading &&
        route?.points?.map((point, idx) => {
          const statusIndex = statusFlow.indexOf(point.status)
          const isLast = statusIndex >= statusFlow.length - 1
          const nextLabel = isLast
            ? null
            : statusLabels[statusFlow[statusIndex + 1]]

          return (
            <div
              key={point.companyId}
              className="gp-card"
              style={{
                marginBottom: 20,
                border: `1px solid ${statusColors[point.status] || '#dee2e6'}`,
                borderLeft: `4px solid ${statusColors[point.status] || '#dee2e6'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        background: '#1c1a18',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: 18 }}>{point.companyName}</strong>
                  </div>
                  <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
                    <div>📍 {point.address}</div>
                    {point.contactPerson && (
                      <div>👤 {point.contactPerson}</div>
                    )}
                    {point.contactPhone && (
                      <div>📞 {point.contactPhone}</div>
                    )}
                    {point.deliveryTime && (
                      <div>🕐 {point.deliveryTime}</div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: `${statusColors[point.status] || '#6c757d'}15`,
                      color: statusColors[point.status] || '#6c757d',
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    {statusLabels[point.status] || point.status}
                  </span>
                  <br />
                  <button
                    onClick={() =>
                      window.open(
                        `tel:${point.contactPhone}`,
                        '_blank'
                      )
                    }
                    style={{
                      background: '#fff7f1',
                      color: '#b53b1f',
                      border: '1px solid #f1d5c3',
                      borderRadius: 12,
                      padding: '8px 12px',
                      marginRight: 8,
                      marginTop: 4,
                    }}
                    title="Позвонить"
                  >
                    📞
                  </button>
                  <button
                    onClick={() =>
                      openInMaps(
                        point.address,
                        point.latitude,
                        point.longitude
                      )
                    }
                    style={{
                      background: '#fff7f1',
                      color: '#b53b1f',
                      border: '1px solid #f1d5c3',
                      borderRadius: 12,
                      padding: '8px 12px',
                      marginTop: 4,
                    }}
                    title="Открыть в Google Maps"
                  >
                    🗺️
                  </button>
                </div>
              </div>

              {/* Блюда */}
              {point.dishes?.length > 0 && (
                <div
                  style={{
                    marginBottom: 12,
                    background: '#fffdfb',
                    borderRadius: 12,
                    border: '1px solid #f1e5db',
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 8,
                      color: '#b53b1f',
                    }}
                  >
                    🍽️ Блюда
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid #f1e5db',
                          fontSize: 13,
                          color: '#666',
                        }}
                      >
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '6px 8px',
                          }}
                        >
                          Блюдо
                        </th>
                        <th
                          style={{
                            textAlign: 'right',
                            padding: '6px 8px',
                          }}
                        >
                          Кол-во
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.dishes.map((dish, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: '1px solid #f5ede6',
                          }}
                        >
                          <td style={{ padding: '6px 8px' }}>
                            {dish.name}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              textAlign: 'right',
                              fontWeight: 600,
                            }}
                          >
                            {dish.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Статус */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                {statusFlow.map((s, i) => {
                  const currentIdx = statusFlow.indexOf(point.status)
                  const isActive = i <= currentIdx
                  const isCurrent = i === currentIdx
                  return (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: isActive
                          ? statusColors[s]
                          : '#ccc',
                        fontWeight: isCurrent ? 700 : 400,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: isActive
                            ? statusColors[s]
                            : '#e0e0e0',
                          display: 'inline-block',
                        }}
                      />
                      {statusLabels[s]}
                      {i < statusFlow.length - 1 && (
                        <span style={{ color: '#ddd', marginLeft: 2 }}>
                          →
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {!isLast && (
                <button
                  onClick={() => advanceStatus(point.companyId, point.status)}
                  disabled={updatingCompanyId === point.companyId}
                  style={{
                    background:
                      'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {updatingCompanyId === point.companyId
                    ? 'Обновляю...'
                    : `➡️ ${nextLabel || ''}`}
                </button>
              )}

              {/* Заметка */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#666',
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  📝 Заметка
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <textarea
                    value={notesInput[point.companyId] || ''}
                    onChange={(e) =>
                      handleNotesChange(point.companyId, e.target.value)
                    }
                    placeholder="Заметка по доставке..."
                    rows={2}
                    style={{ flex: 1, resize: 'vertical' }}
                  />
                </div>
                {savingNotes[point.companyId] && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#666',
                      marginTop: 4,
                    }}
                  >
                    Сохраняю...
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
