import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const today = new Date().toISOString().slice(0, 10)
const monthStart = `${today.slice(0, 8)}01`

const deliveryStatusLabels: Record<string, string> = {
  DELIVERED: 'Доставлено',
  DELIVERED_WITH_DEVIATION: 'Доставлено с отклонением',
}

export default function AdminReconciliation({ token }: { token: string }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [companyId, setCompanyId] = useState('')
  const [start, setStart] = useState(monthStart)
  const [end, setEnd] = useState(today)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCompanies(response.data)
      if (response.data[0]?.id) {
        setCompanyId(prev => prev || response.data[0].id)
      }
    } catch (err) {
      setError('Не удалось загрузить компании')
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadReconciliation = async (targetCompanyId = companyId) => {
    if (!targetCompanyId) {
      setError('Выберите компанию')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/admin/reconciliation?companyId=${targetCompanyId}&start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(response.data)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Не удалось построить сверку')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="gp-page-title">Сверка за период</h2>
      <p className="gp-page-lead">
        Считается по фактическим дневным отгрузкам компании с учетом ежедневных отклонений, которые менеджер отметил в сводке.
      </p>

      {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 6, marginBottom: 20 }}>{error}</div>}

      <div className="gp-surface-card gp-toolbar" style={{ padding: 20, marginBottom: 20 }}>
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">Выберите компанию</option>
          {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={() => loadReconciliation()} disabled={loading} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px' }}>
          {loading ? 'Считаю...' : 'Построить сверку'}
        </button>
      </div>

      {data && (
        <>
          <div className="gp-surface-card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>{data.company.name}</h3>
            {data.company.billingAddress && <div className="gp-muted-text" style={{ marginBottom: 4 }}>Юр. адрес: {data.company.billingAddress}</div>}
            {data.company.billingDetails && <div className="gp-muted-text" style={{ whiteSpace: 'pre-wrap' }}>{data.company.billingDetails}</div>}
          </div>

          <div className="gp-grid-cards" style={{ marginBottom: 20 }}>
            <div className="gp-stat-card"><div className="gp-muted-text">Дней в периоде</div><strong>{data.period.days}</strong></div>
            <div className="gp-stat-card"><div className="gp-muted-text">Дней с отгрузкой</div><strong>{data.summary.daysWithOrders}</strong></div>
            <div className="gp-stat-card"><div className="gp-muted-text">Закрыто</div><strong>{data.summary.closedDays}</strong></div>
            <div className="gp-stat-card"><div className="gp-muted-text">Не закрыто</div><strong>{data.summary.openDays}</strong></div>
            <div className="gp-stat-card"><div className="gp-muted-text">Отклонения</div><strong>{data.summary.deviationTotal} ₽</strong></div>
            <div className="gp-stat-card"><div className="gp-muted-text">Итого к счету</div><strong style={{ color: '#198754' }}>{data.summary.total} ₽</strong></div>
          </div>

          <div className="gp-surface-card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Дни периода</h3>
            {data.rows.length === 0 ? (
              <p>За выбранный период нет данных по отгрузкам.</p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {data.rows.map((row: any) => (
                  <div key={row.date} className="gp-soft-block" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <strong>{row.date}</strong>
                        <div style={{ color: '#666', marginTop: 4 }}>
                          Сотрудников: {row.usersCount}, заявок: {row.selectionsCount}, порций: {row.portions}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Сумма дня: <strong>{row.subtotal} ₽</strong></div>
                        <div>Отклонение: <strong style={{ color: row.deviationAmount ? '#dc3545' : '#666' }}>{row.deviationAmount} ₽</strong></div>
                        <div>Итого: <strong style={{ color: '#198754' }}>{row.total} ₽</strong></div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, color: row.deliveryStatus ? '#198754' : '#fd7e14' }}>
                      {row.deliveryStatus ? (deliveryStatusLabels[row.deliveryStatus] || row.deliveryStatus) : 'День еще не закрыт менеджером'}
                    </div>
                    {row.deviationComment && <div style={{ marginTop: 6, color: '#8a6d3b' }}>Отклонение: {row.deviationComment}</div>}
                    {row.managerComment && <div style={{ marginTop: 6, color: '#666' }}>Комментарий менеджера: {row.managerComment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
