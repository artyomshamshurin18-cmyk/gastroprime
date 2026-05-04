import { useState } from 'react'
import axios from 'axios'
import { API_URL } from './api-config';


const SOURCE_OPTIONS = [
  { value: '', label: 'Не указан' },
  { value: 'CALL', label: 'Звонок' },
  { value: 'WEBSITE', label: 'Сайт' },
  { value: 'RECOMMENDATION', label: 'Рекомендация' },
  { value: 'SOCIAL', label: 'Соцсети' },
  { value: 'EMAIL', label: 'Email-рассылка' },
  { value: 'OTHER', label: 'Другое' },
]

const PREMISE_OPTIONS = [
  { value: '', label: 'Не выбран' },
  { value: 'OFFICE', label: 'Офис' },
  { value: 'WAREHOUSE', label: 'Склад' },
  { value: 'CLINIC', label: 'Клиника' },
  { value: 'PRODUCTION', label: 'Производство' },
  { value: 'OTHER', label: 'Другое' },
]

const MEAL_TYPE_OPTIONS = [
  { value: '', label: 'Не выбран' },
  { value: 'BREAKFAST_LUNCH', label: 'Завтрак + Обед' },
  { value: 'LUNCH_ONLY', label: 'Только обед' },
  { value: 'LUNCH_DINNER', label: 'Обед + Ужин' },
  { value: 'ALL', label: 'Завтрак + Обед + Ужин' },
]

const MEAL_CLASS_OPTIONS = [
  { value: '', label: 'Не выбран' },
  { value: 'ECONOMY', label: 'Эконом' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'PREMIUM', label: 'Премиум' },
]

function NewLeadModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    source: '',
    premiseType: '',
    mealType: '',
    mealClass: '',
    deliveryAddress: '',
    description: '',
    monthlyBudget: '',
    employeesCount: '',
    nextActionDate: '',
    nextActionNote: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.companyName.trim()) {
      setError('Название компании обязательно')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload: any = { companyName: form.companyName }
      if (form.contactPerson) payload.contactPerson = form.contactPerson
      if (form.phone) payload.phone = form.phone
      if (form.email) payload.email = form.email
      if (form.source) payload.source = form.source
      if (form.premiseType) payload.premiseType = form.premiseType
      if (form.mealType) payload.mealType = form.mealType
      if (form.mealClass) payload.mealClass = form.mealClass
      if (form.deliveryAddress) payload.deliveryAddress = form.deliveryAddress
      if (form.description) payload.description = form.description
      if (form.monthlyBudget) payload.monthlyBudget = parseInt(form.monthlyBudget, 10)
      if (form.employeesCount) payload.employeesCount = parseInt(form.employeesCount, 10)
      if (form.nextActionDate) payload.nextActionDate = form.nextActionDate
      if (form.nextActionNote) payload.nextActionNote = form.nextActionNote
      await axios.post(`${API_URL}/crm/leads`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании лида')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gp-modal-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="gp-modal-header">
          <h2>Новый лид</h2>
          <button className="gp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="gp-modal-body" style={{ padding: '0 24px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          <div className="crm-form-group">
            <label>Название компании *</label>
            <input type="text" value={form.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder="ООО Пример" />
          </div>

          <div className="crm-form-group">
            <label>Контактное лицо</label>
            <input type="text" value={form.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} placeholder="Иванов Иван" />
          </div>

          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Телефон</label>
              <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+7 (___) ___-__-__" />
            </div>
            <div className="crm-form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Источник</label>
              <select value={form.source} onChange={e => handleChange('source', e.target.value)}>
                {SOURCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="crm-form-group">
              <label>Месячный бюджет (₽)</label>
              <input type="number" value={form.monthlyBudget} onChange={e => handleChange('monthlyBudget', e.target.value)} placeholder="500000" />
            </div>
          </div>

          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Тип площадки</label>
              <select value={form.premiseType} onChange={e => handleChange('premiseType', e.target.value)}>
                {PREMISE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="crm-form-group">
              <label>Кол-во сотрудников</label>
              <input type="number" value={form.employeesCount} onChange={e => handleChange('employeesCount', e.target.value)} placeholder="50" />
            </div>
          </div>

          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Тип питания</label>
              <select value={form.mealType} onChange={e => handleChange('mealType', e.target.value)}>
                {MEAL_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="crm-form-group">
              <label>Класс питания</label>
              <select value={form.mealClass} onChange={e => handleChange('mealClass', e.target.value)}>
                {MEAL_CLASS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label>Адрес доставки</label>
            <input type="text" value={form.deliveryAddress} onChange={e => handleChange('deliveryAddress', e.target.value)} placeholder="г. Москва, ул. Примерная, д. 1" />
          </div>

          <div className="crm-form-row">
            <div className="crm-form-group">
              <label>Дата след. действия</label>
              <input type="date" value={form.nextActionDate} onChange={e => handleChange('nextActionDate', e.target.value)} />
            </div>
            <div className="crm-form-group">
              <label>Что нужно сделать</label>
              <input type="text" value={form.nextActionNote} onChange={e => handleChange('nextActionNote', e.target.value)} placeholder="Перезвонить, отправить КП..." />
            </div>
          </div>

          <div className="crm-form-group">
            <label>Описание потребностей</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} placeholder="Какие задачи, бюджет, сроки..." />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer' }}>
              Отмена
            </button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Создание...' : 'Создать лид'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewLeadModal
