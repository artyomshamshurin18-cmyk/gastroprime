import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

export default function ClientProfile({ token, user, onUserUpdate }: { token: string, user: any, onUserUpdate: (user: any) => void }) {
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    allergies: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    setForm({
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      allergies: user?.allergies || '',
    })
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await axios.patch(`${API_URL}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onUserUpdate(response.data)
      setMessage('✅ Профиль сохранен')
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось сохранить профиль'}`)
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file?: File | null) => {
    if (!file) return
    setUploadingAvatar(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await axios.post(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      onUserUpdate(response.data)
      setMessage('✅ Аватар обновлен')
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось загрузить аватар'}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setUploadingAvatar(true)
    setMessage('')
    try {
      const response = await axios.delete(`${API_URL}/users/me/avatar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onUserUpdate(response.data)
      setMessage('✅ Аватар удален')
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить аватар'}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div>
      <h2>Профиль</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Здесь клиент может обновить свои личные данные. Баланс и лимит на день меняются только администратором.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.08)', display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: '#f3f3f3', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.avatarUrl ? <img src={mediaUrl(user.avatarUrl)} alt="Аватар" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#999', fontSize: 12 }}>Аватар</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Фото сотрудника</div>
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0] || null)} />
            <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>{uploadingAvatar ? 'Загружаю...' : 'Можно загрузить фото или аватар'}</div>
            {user?.avatarUrl && <button onClick={removeAvatar} disabled={uploadingAvatar} style={{ marginTop: 8, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px' }}>Удалить аватар</button>}
          </div>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Имя</span>
          <input value={form.firstName} onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Фамилия</span>
          <input value={form.lastName} onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Телефон</span>
          <input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Почта</span>
          <input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Аллергия на продукты</span>
          <textarea value={form.allergies} onChange={(e) => setForm(prev => ({ ...prev, allergies: e.target.value }))} rows={4} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ background: '#f8f9fa', padding: 14, borderRadius: 8 }}>
            <div style={{ color: '#666', marginBottom: 4 }}>Текущий баланс</div>
            <strong>{user?.company?.balance ?? 0} ₽</strong>
          </div>
          <div style={{ background: '#f8f9fa', padding: 14, borderRadius: 8 }}>
            <div style={{ color: '#666', marginBottom: 4 }}>Лимит на день</div>
            <strong>{user?.company?.dailyLimit ?? 0} ₽</strong>
          </div>
        </div>

        <button onClick={saveProfile} disabled={saving} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '12px 18px', width: '100%' }}>
          {saving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </div>
    </div>
  )
}
