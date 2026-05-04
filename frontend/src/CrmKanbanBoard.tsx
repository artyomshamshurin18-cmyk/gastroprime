import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import NewLeadModal from './NewLeadModal'
import LeadDetailModal from './LeadDetailModal'
import { API_URL } from './api-config';


const PIPELINE_STATUSES = [
  { id: 'NEW',          label: 'Новые',         color: '#94a3b8' },
  { id: 'CONTACTED',    label: 'На связи',      color: '#3b82f6' },
  { id: 'MEETING',      label: 'Встреча',       color: '#8b5cf6' },
  { id: 'PROPOSAL',     label: 'Предложение',   color: '#f59e0b' },
  { id: 'NEGOTIATION',  label: 'Переговоры',    color: '#f97316' },
  { id: 'WON',          label: 'Клиент',        color: '#22c55e' },
  { id: 'LOST',         label: 'Потерян',       color: '#ef4444' },
]

const VISIBLE_STATUSES = PIPELINE_STATUSES.filter(s => !['WON', 'LOST'].includes(s.id))
const ALL_STATUSES = PIPELINE_STATUSES

function CrmKanbanBoard({ token }: { token: string }) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNewLead, setShowNewLead] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [showTasks, setShowTasks] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchLeads = useCallback(async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await axios.get(`${API_URL}/crm/leads`, { headers, params })
      setLeads(res.data.data || [])
    } catch (err: any) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }, [token, search, statusFilter])

  const fetchDashboard = useCallback(async () => {
    try {
      // Try enhanced dashboard first, fallback to basic
      const res = await axios.get(`${API_URL}/crm/dashboard/enhanced`, { headers }).catch(
        () => axios.get(`${API_URL}/crm/dashboard`, { headers })
      )
      setDashboard(res.data)
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
    }
  }, [token])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/crm/tasks`, { headers })
      setTasks(res.data || [])
    } catch (err: any) {
      // Silently fail — tasks might not be available
    }
  }, [token])

  const completeTask = async (taskId: string) => {
    try {
      await axios.patch(`${API_URL}/crm/tasks/${taskId}/complete`, {}, { headers })
      fetchTasks()
      fetchDashboard()
    } catch (err: any) {
      console.error('Error completing task:', err)
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchDashboard()
    fetchTasks()
  }, [fetchLeads, fetchDashboard, fetchTasks])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/crm/leads/${leadId}/status`, { status: newStatus }, { headers })
      fetchLeads()
      fetchDashboard()
    } catch (err: any) {
      console.error('Error changing status:', err)
    }
  }

  const leadsByStatus = (statusId: string) => {
    return leads.filter(l => l.status === statusId)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return '🔥 ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    if (diff === 0) return '📅 Сегодня'
    if (diff === 1) return '📅 Завтра'
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' млн ₽'
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + ' тыс ₽'
    return amount + ' ₽'
  }

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#6f6a64' }}>Загрузка CRM...</div>
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>CRM — Воронка продаж</h2>
          {tasks.length > 0 && (
            <button onClick={() => setShowTasks(!showTasks)}
              style={{ padding:'5px 12px', background: showTasks ? '#ed3915' : '#f5f5f5', color: showTasks ? '#fff' : '#333', border:'1px solid #ddd', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }}>
              ✅ Задачи ({dashboard?.todayTasks || tasks.length})
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Поиск по компании, контакту, телефону..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #ddd', minWidth: 240, fontSize: 14 }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14 }}
          >
            <option value="">Все статусы</option>
            {ALL_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNewLead(true)}
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
          >
            + Новый лид
          </button>
        </div>
      </div>

      {/* Enhanced Dashboard Bar */}
      {dashboard && (
        <div className="crm-dashboard-bar" style={{flexWrap:'wrap'}}>
          {dashboard.byStatus?.filter((s: any) => !['WON', 'LOST'].includes(s.status)).map((s: any) => {
            const statusInfo = ALL_STATUSES.find(ps => ps.id === s.status)
            return (
              <div key={s.status} className="crm-stat-chip" style={{ borderLeftColor: statusInfo?.color || '#ccc' }}>
                <span className="crm-stat-count">{s.count}</span>
                <span className="crm-stat-label">{statusInfo?.label || s.status}</span>
              </div>
            )
          })}
          <div className="crm-stat-chip crm-stat-chip--total">
            <span className="crm-stat-count">{dashboard.total}</span>
            <span className="crm-stat-label">Всего</span>
          </div>
          {dashboard.potentialSum > 0 && (
            <div className="crm-stat-chip" style={{ borderLeftColor: '#059669', background:'#ecfdf5' }}>
              <span className="crm-stat-count" style={{color:'#059669'}}>{formatCurrencyShort(dashboard.potentialSum)}</span>
              <span className="crm-stat-label">Потенциал</span>
            </div>
          )}
          {dashboard.todayTasks > 0 && (
            <div className="crm-stat-chip" style={{ borderLeftColor: '#f59e0b', background:'#fffbeb' }}>
              <span className="crm-stat-count" style={{color:'#d97706'}}>{dashboard.todayTasks}</span>
              <span className="crm-stat-label">🔥 Просрочено</span>
            </div>
          )}
        </div>
      )}

      {/* Task Widget */}
      {showTasks && tasks.length > 0 && (
        <div style={{margin:'12px 0',padding:16,background:'#fffbeb',borderRadius:12,border:'1px solid #fde68a'}}>
          <h4 style={{margin:'0 0 8px',color:'#92400e'}}>✅ Задачи на сегодня</h4>
          {tasks.map((t: any) => (
            <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'6px 0',borderBottom:'1px solid #fef3c7'}}>
              <input type="checkbox" onChange={() => completeTask(t.id)} style={{cursor:'pointer'}} />
              <span style={{flex:1,fontSize:14}}>{t.title}</span>
              {t.dueDate && <span style={{fontSize:12,color:'#92400e'}}>{formatDate(t.dueDate)}</span>}
              {t.deal && <span style={{fontSize:11,color:'#6f6a64'}}>→ {t.deal.companyName}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="crm-board">
        {VISIBLE_STATUSES.map(status => (
          <div key={status.id} className="crm-column">
            <div className="crm-column-header" style={{ borderTopColor: status.color }}>
              <span className="crm-column-title">{status.label}</span>
              <span className="crm-column-count">{leadsByStatus(status.id).length}</span>
            </div>
            <div className="crm-column-body">
              {leadsByStatus(status.id).length === 0 && (
                <div className="crm-empty-column">Нет лидов</div>
              )}
              {leadsByStatus(status.id).map(lead => (
                <div key={lead.id} className="crm-card" onClick={() => setSelectedLeadId(lead.id)}>
                  <div className="crm-card-name">{lead.companyName}</div>
                  {lead.contactPerson && <div className="crm-card-contact">👤 {lead.contactPerson}</div>}
                  {lead.phone && <div className="crm-card-phone">📞 {lead.phone}</div>}
                  {lead.monthlyBudget != null && lead.monthlyBudget > 0 && (
                    <div className="crm-card-budget">💰 {formatCurrency(lead.monthlyBudget)}</div>
                  )}
                  {lead.nextActionDate && (
                    <div className="crm-card-next-action">
                      📅 {formatDate(lead.nextActionDate)}
                      {lead.nextActionNote && <span> — {lead.nextActionNote}</span>}
                    </div>
                  )}
                  {lead.assignedTo && (
                    <div className="crm-card-assigned">
                      👤 {lead.assignedTo.firstName || lead.assignedTo.lastName || ''}
                    </div>
                  )}
                  <div className="crm-card-actions">
                    {status.id !== 'WON' && status.id !== 'LOST' && (
                      <select
                        value={lead.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className="crm-status-select"
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showNewLead && (
        <NewLeadModal
          token={token}
          onClose={() => {
            setShowNewLead(false)
            fetchLeads()
            fetchDashboard()
          }}
        />
      )}

      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          token={token}
          onClose={() => {
            setSelectedLeadId(null)
            fetchLeads()
            fetchDashboard()
          }}
        />
      )}
    </div>
  )
}

export default CrmKanbanBoard
