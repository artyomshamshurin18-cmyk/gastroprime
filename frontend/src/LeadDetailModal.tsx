import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый', CONTACTED: 'На связи', MEETING: 'Встреча',
  PROPOSAL: 'Предложение', NEGOTIATION: 'Переговоры', WON: 'Клиент', LOST: 'Потерян',
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: '📞 Звонок', EMAIL: '📧 Email', MEETING: '🤝 Встреча',
  NOTE: '📝 Заметка', STATUS_CHANGE: '🔄 Смена статуса', TASK: '✅ Задача', CONVERSION: '🏢 Конвертация',
}

const PREMISE_OPTIONS = [
  { value: '', label: 'Не выбран' }, { value: 'OFFICE', label: 'Офис' },
  { value: 'WAREHOUSE', label: 'Склад' }, { value: 'CLINIC', label: 'Клиника' },
  { value: 'PRODUCTION', label: 'Производство' }, { value: 'OTHER', label: 'Другое' },
]

const MEAL_TYPE_OPTIONS = [
  { value: '', label: 'Не выбран' }, { value: 'BREAKFAST_LUNCH', label: 'Завтрак + Обед' },
  { value: 'LUNCH_ONLY', label: 'Только обед' }, { value: 'LUNCH_DINNER', label: 'Обед + Ужин' },
  { value: 'ALL', label: 'Завтрак + Обед + Ужин' },
]

const MEAL_CLASS_OPTIONS = [
  { value: '', label: 'Не выбран' }, { value: 'ECONOMY', label: 'Эконом' },
  { value: 'MEDIUM', label: 'Средний' }, { value: 'PREMIUM', label: 'Премиум' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Не указан' }, { value: 'CALL', label: 'Звонок' },
  { value: 'WEBSITE', label: 'Сайт' }, { value: 'RECOMMENDATION', label: 'Рекомендация' },
  { value: 'SOCIAL', label: 'Соцсети' }, { value: 'EMAIL', label: 'Email-рассылка' },
  { value: 'OTHER', label: 'Другое' },
]

const PREMISE_LABELS: Record<string, string> = {
  OFFICE: 'Офис', WAREHOUSE: 'Склад', CLINIC: 'Клиника',
  PRODUCTION: 'Производство', OTHER: 'Другое',
}
const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST_LUNCH: 'Завтрак + Обед', LUNCH_ONLY: 'Только обед',
  LUNCH_DINNER: 'Обед + Ужин', ALL: 'Завтрак + Обед + Ужин',
}
const MEAL_CLASS_LABELS: Record<string, string> = {
  ECONOMY: 'Эконом', MEDIUM: 'Средний', PREMIUM: 'Премиум',
}
const SOURCE_LABELS: Record<string, string> = {
  CALL: 'Звонок', WEBSITE: 'Сайт', EMAIL: 'Email-рассылка',
  RECOMMENDATION: 'Рекомендация', SOCIAL: 'Соцсети', OTHER: 'Другое',
}

function LeadDetailModal({ leadId, token, onClose }: { leadId: string; token: string; onClose: () => void }) {
  const [lead, setLead] = useState<any>(null)
  const [tab, setTab] = useState<'info' | 'activity'>('info')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [newActivity, setNewActivity] = useState({ type: 'NOTE', note: '' })
  const [saving, setSaving] = useState(false)
  const [addingActivity, setAddingActivity] = useState(false)
  const [converting, setConverting] = useState(false)
  const [convertResult, setConvertResult] = useState<any>(null)
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { loadLead() }, [leadId])

  const loadLead = async () => {
    try {
      const res = await axios.get(`${API_URL}/crm/leads/${leadId}`, { headers })
      setLead(res.data)
      setEditForm({
        companyName: res.data.companyName, contactPerson: res.data.contactPerson || '',
        phone: res.data.phone || '', email: res.data.email || '', source: res.data.source || '',
        premiseType: res.data.premiseType || '', mealType: res.data.mealType || '',
        mealClass: res.data.mealClass || '', deliveryAddress: res.data.deliveryAddress || '',
        description: res.data.description || '', monthlyBudget: res.data.monthlyBudget || '',
        employeesCount: res.data.employeesCount || '',
        nextActionDate: res.data.nextActionDate ? res.data.nextActionDate.split('T')[0] : '',
        nextActionNote: res.data.nextActionNote || '',
      })
    } catch (err) { console.error('Error loading lead:', err) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: any = { ...editForm }
      if (!payload.monthlyBudget) payload.monthlyBudget = null
      if (!payload.employeesCount) payload.employeesCount = null
      if (!payload.nextActionDate) payload.nextActionDate = null
      if (!payload.nextActionNote) payload.nextActionNote = null
      await axios.patch(`${API_URL}/crm/leads/${leadId}`, payload, { headers })
      setEditMode(false); loadLead()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (newStatus: string) => {
    try { await axios.patch(`${API_URL}/crm/leads/${leadId}/status`, { status: newStatus }, { headers }); loadLead() }
    catch (err) { console.error(err) }
  }

  const handleConvert = async () => {
    if (!confirm('Конвертировать этот лид в компанию?')) return
    setConverting(true)
    try {
      const res = await axios.post(`${API_URL}/crm/leads/${leadId}/convert`, {}, { headers })
      setConvertResult(res.data.company)
      loadLead()
      setTab('activity')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка конвертации')
    }
    finally { setConverting(false) }
  }

  const handleAddActivity = async () => {
    if (!newActivity.type || (!newActivity.note && newActivity.type !== 'STATUS_CHANGE')) return
    setAddingActivity(true)
    try {
      await axios.post(`${API_URL}/crm/leads/${leadId}/activities`, newActivity, { headers })
      setNewActivity({ type: 'NOTE', note: '' }); loadLead()
    } catch (err) { console.error(err) }
    finally { setAddingActivity(false) }
  }

  const formatCurrency = (a: number|null|undefined) => a ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(a) : '—'
  const formatDate = (d: string|null|undefined) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const formatDateTime = (d: string|null|undefined) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  if (!lead) return <div className="gp-modal-overlay" onClick={onClose}><div className="gp-modal" onClick={e => e.stopPropagation()} style={{maxWidth:600}}><div className="gp-modal-body" style={{textAlign:'center',padding:40,color:'#6f6a64'}}>Загрузка...</div></div></div>

  const infoRows = [
    { label: 'Компания', value: lead.companyName },
    { label: 'Контактное лицо', value: lead.contactPerson || '—' },
    { label: 'Телефон', value: lead.phone || '—' },
    { label: 'Email', value: lead.email || '—' },
    { label: 'Источник', value: SOURCE_LABELS[lead.source] || lead.source || '—' },
    { label: 'Тип площадки', value: PREMISE_LABELS[lead.premiseType] || lead.premiseType || '—' },
    { label: 'Тип питания', value: MEAL_TYPE_LABELS[lead.mealType] || lead.mealType || '—' },
    { label: 'Класс питания', value: MEAL_CLASS_LABELS[lead.mealClass] || lead.mealClass || '—' },
    { label: 'Адрес доставки', value: lead.deliveryAddress || '—' },
    { label: 'Бюджет', value: formatCurrency(lead.monthlyBudget) },
    { label: 'Сотрудников', value: lead.employeesCount || '—' },
    { label: 'Дата создания', value: formatDate(lead.createdAt) },
    { label: 'След. действие', value: lead.nextActionDate ? formatDate(lead.nextActionDate) + (lead.nextActionNote ? ': ' + lead.nextActionNote : '') : '—' },
  ]

  return (
    <div className="gp-modal-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="gp-modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <h2>{lead.companyName}</h2>
            <span className="crm-badge" style={{ background:'#eef2ff', color:'#1f2937', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
              {STATUS_LABELS[lead.status] || lead.status}
            </span>
            {lead.convertedCompany && (
              <span className="crm-badge" style={{ background:'#ecfdf5', color:'#065f46', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                🏢 Конвертирован
              </span>
            )}
          </div>
          <button className="gp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="gp-modal-tabs" style={{ display:'flex', gap:0, borderBottom:'1px solid #eee', padding:'0 24px' }}>
          <div onClick={()=>{setTab('info'); setEditMode(false)}}
            style={{ padding:'12px 20px', cursor:'pointer', borderBottom: tab==='info' ? '2px solid #ed3915' : '2px solid transparent', fontWeight: tab==='info' ? 600 : 400, color: tab==='info' ? '#ed3915' : '#6f6a64' }}>
            📋 Информация
          </div>
          <div onClick={()=>setTab('activity')}
            style={{ padding:'12px 20px', cursor:'pointer', borderBottom: tab==='activity' ? '2px solid #ed3915' : '2px solid transparent', fontWeight: tab==='activity' ? 600 : 400, color: tab==='activity' ? '#ed3915' : '#6f6a64' }}>
            📜 Активности ({lead.activities?.length || 0})
          </div>
        </div>

        <div className="gp-modal-body" style={{ padding:'0 24px 24px', maxHeight:'60vh', overflowY:'auto' }}>
          {tab === 'info' && (
            <div>
              {convertResult && (
                <div style={{padding:'12px 16px',background:'#ecfdf5',border:'1px solid #a7f3d0',borderRadius:12,marginTop:12,display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:24}}>✅</span>
                  <div>
                    <strong style={{color:'#065f46'}}>Компания создана!</strong><br/>
                    <span style={{color:'#047857',fontSize:13}}>{convertResult.name} — ID: {convertResult.id.slice(0,8)}...</span>
                  </div>
                </div>
              )}

              <div style={{ margin:'16px 0', display:'flex', gap:8, flexWrap:'wrap' }}>
                {['NEW','CONTACTED','MEETING','PROPOSAL','NEGOTIATION','WON','LOST'].map(s => (
                  <button key={s} onClick={()=>handleStatusChange(s)}
                    style={{ padding:'6px 12px', borderRadius:20, border: lead.status===s ? '2px solid #ed3915' : '1px solid #ddd', background: lead.status===s ? '#fff3eb' : '#fff', fontSize:12, cursor:'pointer', fontWeight: lead.status===s ? 600 : 400 }}>
                    {STATUS_LABELS[s] || s}
                  </button>
                ))}
              </div>

              {/* Convert to Company button — show only for WON leads not yet converted */}
              {lead.status === 'WON' && !lead.convertedCompany && (
                <div style={{marginBottom:16}}>
                  <button onClick={handleConvert} disabled={converting}
                    style={{padding:'10px 24px',background:'linear-gradient(135deg,#059669 0%,#10b981 100%)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:14,opacity:converting?0.7:1}}>
                    {converting ? 'Конвертируем...' : '🏢 Конвертировать в компанию'}
                  </button>
                </div>
              )}

              {!editMode ? (
                <div>
                  <div className="crm-info-grid">
                    {infoRows.map((row,i) => (
                      <div key={i} className="crm-info-row">
                        <span className="crm-info-label">{row.label}</span>
                        <span className="crm-info-value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {lead.description && <div style={{marginTop:12}}><div className="crm-info-label">Описание</div><div style={{whiteSpace:'pre-wrap',color:'#374151',fontSize:14}}>{lead.description}</div></div>}
                  <button onClick={()=>setEditMode(true)} style={{marginTop:16,padding:'8px 16px',background:'#f5f5f5',border:'1px solid #ddd',borderRadius:10,cursor:'pointer'}}>✏️ Редактировать</button>
                </div>
              ) : (
                <div style={{marginTop:16}}>
                  <div className="crm-form-group"><label>Название компании</label><input type="text" value={editForm.companyName} onChange={e=>setEditForm((p:any)=>({...p,companyName:e.target.value}))} /></div>
                  <div className="crm-form-row">
                    <div className="crm-form-group"><label>Контактное лицо</label><input type="text" value={editForm.contactPerson} onChange={e=>setEditForm((p:any)=>({...p,contactPerson:e.target.value}))} /></div>
                    <div className="crm-form-group"><label>Телефон</label><input type="text" value={editForm.phone} onChange={e=>setEditForm((p:any)=>({...p,phone:e.target.value}))} /></div>
                  </div>
                  <div className="crm-form-row">
                    <div className="crm-form-group"><label>Email</label><input type="email" value={editForm.email} onChange={e=>setEditForm((p:any)=>({...p,email:e.target.value}))} /></div>
                    <div className="crm-form-group"><label>Источник</label>
                      <select value={editForm.source} onChange={e=>setEditForm((p:any)=>({...p,source:e.target.value}))}>
                        {SOURCE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="crm-form-row">
                    <div className="crm-form-group"><label>Тип площадки</label>
                      <select value={editForm.premiseType} onChange={e=>setEditForm((p:any)=>({...p,premiseType:e.target.value}))}>
                        {PREMISE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="crm-form-group"><label>Сотрудников</label><input type="number" value={editForm.employeesCount} onChange={e=>setEditForm((p:any)=>({...p,employeesCount:e.target.value}))} /></div>
                  </div>
                  <div className="crm-form-row">
                    <div className="crm-form-group"><label>Тип питания</label>
                      <select value={editForm.mealType} onChange={e=>setEditForm((p:any)=>({...p,mealType:e.target.value}))}>
                        {MEAL_TYPE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="crm-form-group"><label>Класс питания</label>
                      <select value={editForm.mealClass} onChange={e=>setEditForm((p:any)=>({...p,mealClass:e.target.value}))}>
                        {MEAL_CLASS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="crm-form-group"><label>Адрес доставки</label><input type="text" value={editForm.deliveryAddress} onChange={e=>setEditForm((p:any)=>({...p,deliveryAddress:e.target.value}))} /></div>
                  <div className="crm-form-row">
                    <div className="crm-form-group"><label>Бюджет (₽)</label><input type="number" value={editForm.monthlyBudget} onChange={e=>setEditForm((p:any)=>({...p,monthlyBudget:e.target.value}))} /></div>
                    <div className="crm-form-group"><label>Дата след. действия</label><input type="date" value={editForm.nextActionDate} onChange={e=>setEditForm((p:any)=>({...p,nextActionDate:e.target.value}))} /></div>
                  </div>
                  <div className="crm-form-group"><label>Что сделать</label><input type="text" value={editForm.nextActionNote} onChange={e=>setEditForm((p:any)=>({...p,nextActionNote:e.target.value}))} /></div>
                  <div className="crm-form-group"><label>Описание</label><textarea value={editForm.description} onChange={e=>setEditForm((p:any)=>({...p,description:e.target.value}))} rows={3} /></div>
                  <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:16}}>
                    <button onClick={()=>setEditMode(false)} style={{padding:'8px 16px',background:'#f5f5f5',border:'1px solid #ddd',borderRadius:10,cursor:'pointer'}}>Отмена</button>
                    <button onClick={handleSave} disabled={saving} style={{padding:'8px 20px',background:'linear-gradient(135deg,#ed3915 0%,#ff6a3d 100%)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',opacity:saving?0.7:1}}>
                      {saving?'Сохранение...':'Сохранить'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div>
              <div className="crm-new-activity" style={{margin:'16px 0',padding:16,background:'#f9fafb',borderRadius:12}}>
                <div style={{display:'flex',gap:12,marginBottom:12}}>
                  <select value={newActivity.type} onChange={e=>setNewActivity(p=>({...p,type:e.target.value}))}
                    style={{padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',flex:1}}>
                    <option value="NOTE">📝 Заметка</option>
                    <option value="CALL">📞 Звонок</option>
                    <option value="EMAIL">📧 Email</option>
                    <option value="MEETING">🤝 Встреча</option>
                    <option value="TASK">✅ Задача</option>
                  </select>
                  <button onClick={handleAddActivity} disabled={addingActivity||(!newActivity.note)}
                    style={{padding:'8px 20px',background:'linear-gradient(135deg,#ed3915 0%,#ff6a3d 100%)',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer',opacity:addingActivity?0.7:1}}>
                    {addingActivity?'...':'Добавить'}
                  </button>
                </div>
                <textarea value={newActivity.note} onChange={e=>setNewActivity(p=>({...p,note:e.target.value}))}
                  placeholder="Опишите активность..." rows={2}
                  style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',resize:'vertical',fontSize:13}} />
              </div>

              {(!lead.activities || lead.activities.length===0) ? (
                <div style={{textAlign:'center',padding:30,color:'#6f6a64'}}>Нет активностей</div>
              ) : (
                <div className="crm-activity-feed">
                  {lead.activities.map((a:any)=>(
                    <div key={a.id} className="crm-activity-item">
                      <div className="crm-activity-header">
                        <span className="crm-activity-type">{ACTIVITY_TYPE_LABELS[a.type]||a.type}</span>
                        <span className="crm-activity-date">{formatDateTime(a.createdAt)}</span>
                      </div>
                      <div className="crm-activity-note">{a.note||''}</div>
                      <div className="crm-activity-author">— {a.createdBy?.firstName||a.createdBy?.lastName||'Пользователь'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadDetailModal
