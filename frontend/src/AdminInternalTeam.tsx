import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const INTERNAL_COMPANY_NAME = 'Gastroprime'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

const roleLabels: Record<string, string> = {
  CLIENT: 'Сотрудник',
  MASTER_CLIENT: 'Координатор компании',
  MANAGER: 'Менеджер',
  ADMIN: 'Администратор',
  SUPERADMIN: 'Суперадминистратор',
}

const userStatusLabels: Record<string, string> = {
  ACTIVE: 'Активный',
  VACATION: 'В отпуске',
  DISMISSED: 'Уволен',
}

interface CompanyOption {
  id: string
  name: string
}

interface TeamUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  phone?: string
  avatarUrl?: string
  status?: string
  role: string
  companyId?: string | null
  company?: {
    id: string
    name: string
  } | null
}

interface TeamDraft {
  firstName: string
  lastName: string
  jobTitle: string
  phone: string
  status: string
  role: string
}

const emptyCreateForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  phone: '',
  status: 'ACTIVE',
  role: 'CLIENT',
}

export default function AdminInternalTeam({ token }: { token: string }) {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [drafts, setDrafts] = useState<Record<string, TeamDraft>>({})
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [avatarUploadingId, setAvatarUploadingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const internalCompany = useMemo(() => companies.find((company) => company.name === INTERNAL_COMPANY_NAME) || null, [companies])
  const teamUsers = useMemo(() => users.filter((user) => user.companyId === internalCompany?.id), [users, internalCompany?.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersResponse, companiesResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setUsers(usersResponse.data)
      setCompanies(companiesResponse.data)
      setDrafts(Object.fromEntries(usersResponse.data.map((user: TeamUser) => [
        user.id,
        {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          jobTitle: user.jobTitle || '',
          phone: user.phone || '',
          status: user.status || 'ACTIVE',
          role: user.role || 'CLIENT',
        }
      ])))
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось загрузить команду GastroPrime')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateDraft = (userId: string, field: keyof TeamDraft, value: string) => {
    setDrafts(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      }
    }))
  }

  const createUser = async () => {
    if (!internalCompany?.id) {
      setMessage('❌ Сначала нужна компания GastroPrime в справочнике компаний')
      return
    }

    if (!createForm.email || !createForm.password) {
      setMessage('❌ Для создания сотрудника нужны рабочая почта и пароль')
      return
    }

    setCreating(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/users`, {
        ...createForm,
        companyId: internalCompany.id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCreateForm(emptyCreateForm)
      setMessage('✅ Сотрудник GastroPrime создан')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось создать сотрудника'}`)
    } finally {
      setCreating(false)
    }
  }

  const saveUser = async (userId: string) => {
    const draft = drafts[userId]
    if (!draft) return

    setSavingId(userId)
    setMessage('')
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}`, {
        ...draft,
        companyId: internalCompany?.id || null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Карточка сотрудника обновлена')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось сохранить сотрудника'}`)
    } finally {
      setSavingId(null)
    }
  }

  const uploadAvatar = async (userId: string, file?: File | null) => {
    if (!file) return

    setAvatarUploadingId(userId)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await axios.post(`${API_URL}/admin/users/${userId}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setMessage('✅ Аватар сотрудника обновлен')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось загрузить аватар'}`)
    } finally {
      setAvatarUploadingId(null)
    }
  }

  return (
    <div>
      <h2>Команда GastroPrime</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Это отдельная карточка нашей компании. Отсюда удобно вести внутреннюю команду и потом добавлять нужных людей в клиентские чаты.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      {!internalCompany ? (
        <div style={{ padding: 14, background: '#fff3cd', borderRadius: 10, color: '#7a5600' }}>
          Компания <strong>Gastroprime</strong> не найдена в справочнике компаний. Как только она есть в «Компании», здесь появится внутренняя команда.
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ marginTop: 0 }}>Добавить сотрудника GastroPrime</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <input placeholder="Рабочая почта" value={createForm.email} onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))} />
              <input placeholder="Пароль" value={createForm.password} onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))} />
              <input placeholder="Имя" value={createForm.firstName} onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))} />
              <input placeholder="Фамилия" value={createForm.lastName} onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))} />
              <input placeholder="Должность" value={createForm.jobTitle} onChange={(e) => setCreateForm(prev => ({ ...prev, jobTitle: e.target.value }))} />
              <input placeholder="Рабочий телефон" value={createForm.phone} onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))} />
              <select value={createForm.role} onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}>
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={createForm.status} onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}>
                {Object.entries(userStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <button onClick={createUser} disabled={creating} style={{ marginTop: 15, background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px' }}>
              {creating ? 'Создание...' : 'Создать сотрудника'}
            </button>
          </div>

          {loading ? (
            <p>Загрузка команды...</p>
          ) : teamUsers.length === 0 ? (
            <p>В команде GastroPrime пока никого нет</p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {teamUsers.map((user) => {
                const draft = drafts[user.id]
                if (!draft) return null

                return (
                  <div key={user.id} style={{ background: '#fff', padding: 20, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
                      <div style={{ display: 'grid', gap: 10 }}>
                        <div style={{ width: 120, height: 120, borderRadius: 20, overflow: 'hidden', background: '#f4f4f4', border: '1px solid #ececec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {user.avatarUrl ? <img src={mediaUrl(user.avatarUrl)} alt={user.email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#999' }}>Аватар</span>}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => uploadAvatar(user.id, e.target.files?.[0] || null)} />
                        {avatarUploadingId === user.id && <span style={{ color: '#666', fontSize: 13 }}>Загружаю аватар...</span>}
                      </div>

                      <div>
                        <div style={{ marginBottom: 12 }}>
                          <strong>{[draft.firstName, draft.lastName].filter(Boolean).join(' ') || user.email}</strong>
                          <div style={{ color: '#666', marginTop: 4 }}>{draft.jobTitle || 'Должность не указана'}</div>
                          <div style={{ color: '#666', fontSize: 14 }}>{roleLabels[draft.role] || draft.role} • {userStatusLabels[draft.status] || draft.status}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                          <input value={draft.firstName} onChange={(e) => updateDraft(user.id, 'firstName', e.target.value)} placeholder="Имя" />
                          <input value={draft.lastName} onChange={(e) => updateDraft(user.id, 'lastName', e.target.value)} placeholder="Фамилия" />
                          <input value={draft.jobTitle} onChange={(e) => updateDraft(user.id, 'jobTitle', e.target.value)} placeholder="Должность" />
                          <input value={user.email} readOnly placeholder="Рабочая почта" />
                          <input value={draft.phone} onChange={(e) => updateDraft(user.id, 'phone', e.target.value)} placeholder="Рабочий телефон" />
                          <select value={draft.role} onChange={(e) => updateDraft(user.id, 'role', e.target.value)}>
                            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                          <select value={draft.status} onChange={(e) => updateDraft(user.id, 'status', e.target.value)}>
                            {Object.entries(userStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                          <button onClick={() => saveUser(user.id)} disabled={savingId === user.id} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px' }}>
                            {savingId === user.id ? 'Сохраняю...' : 'Сохранить карточку'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
