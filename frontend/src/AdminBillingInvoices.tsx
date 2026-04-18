import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const today = new Date().toISOString().slice(0, 10)
const monthStart = `${today.slice(0, 8)}01`

const typeLabels: Record<string, string> = {
  PERIOD: 'За период',
  PREPAYMENT: 'Предоплата',
}

const statusLabels: Record<string, string> = {
  ISSUED: 'Выставлен',
  DRAFT: 'Черновик',
  PAID: 'Оплачен',
  CANCELLED: 'Отменен',
}

export default function AdminBillingInvoices({ token }: { token: string }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [periodForm, setPeriodForm] = useState({ companyId: '', start: monthStart, end: today, comment: '' })
  const [prepaymentForm, setPrepaymentForm] = useState({ companyId: '', amount: '', comment: '' })
  const [creatingPeriod, setCreatingPeriod] = useState(false)
  const [creatingPrepayment, setCreatingPrepayment] = useState(false)
  const [savingInvoiceId, setSavingInvoiceId] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [companiesResponse, invoicesResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setCompanies(companiesResponse.data)
      setInvoices(invoicesResponse.data)
      if (companiesResponse.data[0]?.id) {
        setPeriodForm(prev => ({ ...prev, companyId: prev.companyId || companiesResponse.data[0].id }))
        setPrepaymentForm(prev => ({ ...prev, companyId: prev.companyId || companiesResponse.data[0].id }))
      }
    } catch (err) {
      setMessage('❌ Не удалось загрузить счета')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const downloadPdf = async (invoiceId: string, invoiceNumber: string, isClient = false) => {
    const url = isClient ? `${API_URL}/users/company/invoices/${invoiceId}/pdf` : `${API_URL}/admin/invoices/${invoiceId}/pdf`
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })
    const fileUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(fileUrl)
  }

  const createPeriodInvoice = async () => {
    setCreatingPeriod(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/invoices/period`, periodForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Счет за период создан')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось создать счет за период'}`)
    } finally {
      setCreatingPeriod(false)
    }
  }

  const createPrepaymentInvoice = async () => {
    setCreatingPrepayment(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/invoices/prepayment`, {
        ...prepaymentForm,
        amount: Number(prepaymentForm.amount) || 0,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Счет на предоплату создан')
      setPrepaymentForm(prev => ({ ...prev, amount: '', comment: '' }))
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось создать счет на предоплату'}`)
    } finally {
      setCreatingPrepayment(false)
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    setSavingInvoiceId(invoiceId)
    setMessage('')
    try {
      await axios.patch(`${API_URL}/admin/invoices/${invoiceId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Статус счета обновлен')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось обновить статус счета'}`)
    } finally {
      setSavingInvoiceId('')
    }
  }

  const applyPrepayment = async (invoiceId: string) => {
    setSavingInvoiceId(invoiceId)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/invoices/${invoiceId}/apply-prepayment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Предоплата зачислена в баланс компании')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось зачислить предоплату'}`)
    } finally {
      setSavingInvoiceId('')
    }
  }

  return (
    <div>
      <h2 className="gp-page-title">Счета</h2>
      <p className="gp-page-lead">Создание счетов за период и счетов на предоплату, плюс скачивание PDF.</p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="gp-surface-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Счет за период</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <select value={periodForm.companyId} onChange={(e) => setPeriodForm(prev => ({ ...prev, companyId: e.target.value }))}>
              <option value="">Выберите компанию</option>
              {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <input type="date" value={periodForm.start} onChange={(e) => setPeriodForm(prev => ({ ...prev, start: e.target.value }))} />
            <input type="date" value={periodForm.end} onChange={(e) => setPeriodForm(prev => ({ ...prev, end: e.target.value }))} />
            <input placeholder="Комментарий к счету" value={periodForm.comment} onChange={(e) => setPeriodForm(prev => ({ ...prev, comment: e.target.value }))} />
            <button onClick={createPeriodInvoice} disabled={creatingPeriod} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px' }}>
              {creatingPeriod ? 'Создаю...' : 'Создать счет за период'}
            </button>
          </div>
        </div>

        <div className="gp-surface-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Счет на предоплату</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <select value={prepaymentForm.companyId} onChange={(e) => setPrepaymentForm(prev => ({ ...prev, companyId: e.target.value }))}>
              <option value="">Выберите компанию</option>
              {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <input type="number" min="1" placeholder="Сумма" value={prepaymentForm.amount} onChange={(e) => setPrepaymentForm(prev => ({ ...prev, amount: e.target.value }))} />
            <input placeholder="Комментарий к счету" value={prepaymentForm.comment} onChange={(e) => setPrepaymentForm(prev => ({ ...prev, comment: e.target.value }))} />
            <button onClick={createPrepaymentInvoice} disabled={creatingPrepayment} style={{ background: '#6f42c1', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px' }}>
              {creatingPrepayment ? 'Создаю...' : 'Создать счет на предоплату'}
            </button>
          </div>
        </div>
      </div>

      <div className="gp-surface-card" style={{ padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Список счетов</h3>
        {loading ? <p>Загрузка...</p> : invoices.length === 0 ? <p>Счетов пока нет</p> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {invoices.map(invoice => (
              <div key={invoice.id} className="gp-soft-block" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{invoice.number}</strong>
                    <div style={{ color: '#666', marginTop: 4 }}>{invoice.company?.name} • {typeLabels[invoice.type] || invoice.type}</div>
                    <div style={{ color: '#666', fontSize: 14, marginTop: 6 }}>
                      <select value={invoice.status} onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)} disabled={savingInvoiceId === invoice.id}>
                        <option value="DRAFT">{statusLabels.DRAFT}</option>
                        <option value="ISSUED">{statusLabels.ISSUED}</option>
                        <option value="PAID">{statusLabels.PAID}</option>
                        <option value="CANCELLED">{statusLabels.CANCELLED}</option>
                      </select>
                    </div>
                    {invoice.periodStart && invoice.periodEnd && <div style={{ color: '#666', fontSize: 14 }}>Период: {new Date(invoice.periodStart).toLocaleDateString('ru-RU')} - {new Date(invoice.periodEnd).toLocaleDateString('ru-RU')}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>Сумма: <strong>{invoice.total} ₽</strong></div>
                    <button onClick={() => downloadPdf(invoice.id, invoice.number)} style={{ marginTop: 8, background: '#198754', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }}>Скачать PDF</button>
                    {invoice.type === 'PREPAYMENT' && invoice.status !== 'PAID' && (
                      <button onClick={() => applyPrepayment(invoice.id)} disabled={savingInvoiceId === invoice.id} style={{ marginTop: 8, marginLeft: 8, background: '#fd7e14', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }}>
                        {savingInvoiceId === invoice.id ? 'Зачисляю...' : 'Зачислить в баланс'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
