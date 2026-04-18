import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  dish: {
    name: string
  }
}

interface AdminOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  deliveryDate: string
  deliveryTime?: string
  comment?: string
  createdAt: string
  company?: {
    name?: string
  }
  user?: {
    email?: string
    firstName?: string
    lastName?: string
  }
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтвержден',
  PREPARING: 'Готовится',
  READY: 'Готов',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменен'
}

const statusColors: Record<string, string> = {
  PENDING: '#ffc107',
  CONFIRMED: '#17a2b8',
  PREPARING: '#fd7e14',
  READY: '#28a745',
  DELIVERED: '#6c757d',
  CANCELLED: '#dc3545'
}

export default function AdminOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [message, setMessage] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data)
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders
    return orders.filter(order => order.status === statusFilter)
  }, [orders, statusFilter])

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    setMessage('')
    try {
      await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order))
      setMessage('✅ Статус заказа обновлен')
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось обновить статус заказа')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU')

  return (
    <div>
      <h2>Заказы</h2>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Все статусы</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <button onClick={loadOrders} disabled={loading} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 6 }}>
          {loading ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>

      {loading ? (
        <p>Загрузка заказов...</p>
      ) : filteredOrders.length === 0 ? (
        <p>Заказов пока нет</p>
      ) : (
        filteredOrders.map(order => (
          <div key={order.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 15 }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>#{order.orderNumber}</div>
                <div style={{ color: '#666', marginTop: 4 }}>
                  {order.user?.firstName || order.user?.lastName
                    ? `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()
                    : order.user?.email}
                </div>
                <div style={{ color: '#007bff' }}>{order.company?.name || 'Без компании'}</div>
              </div>

              <div style={{ minWidth: 240 }}>
                <div><strong>Дата доставки:</strong> {formatDate(order.deliveryDate)}</div>
                <div><strong>Время:</strong> {order.deliveryTime || 'не указано'}</div>
                <div><strong>Сумма:</strong> {order.totalAmount} ₽</div>
                <div><strong>Создан:</strong> {formatDate(order.createdAt)}</div>
              </div>

              <div>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  disabled={updatingId === order.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    backgroundColor: statusColors[order.status] + '20',
                    color: statusColors[order.status],
                    fontWeight: 'bold'
                  }}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {order.comment && (
              <div style={{ marginBottom: 12, padding: 12, background: '#f8f9fa', borderRadius: 6 }}>
                <strong>Комментарий:</strong> {order.comment}
              </div>
            )}

            <div>
              <strong>Состав заказа:</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, background: '#f8f9fa', borderRadius: 6 }}>
                    <span>{item.dish.name}</span>
                    <span>{item.quantity} × {item.unitPrice} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
