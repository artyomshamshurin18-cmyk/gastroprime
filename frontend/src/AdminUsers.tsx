import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

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

interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  allergies?: string
  status?: string
  role: string
  companyId?: string | null
  company?: {
    id: string
    name: string
  } | null
}

interface UserDraft {
  firstName: string
  lastName: string
  phone: string
  allergies: string
  status: string
  role: string
  companyId: string
}

interface UserImportRow {
  rowNumber: number
  companyName: string
  companyId: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  password: string
  action: 'create' | 'update'
  errors: string[]
}

interface UserImportPreview {
  totalRows: number
  validRows: number
  errorRows: number
  createCount: number
  updateCount: number
  rows: UserImportRow[]
}

const emptyCreateForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  allergies: '',
  status: 'ACTIVE',
  role: 'CLIENT',
  companyId: '',
}

export default function AdminUsers({ token, currentUser }: { token: string, currentUser?: any }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({})
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [defaultPassword, setDefaultPassword] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [commitLoading, setCommitLoading] = useState(false)
  const [importPreview, setImportPreview] = useState<UserImportPreview | null>(null)
  const canManageAdminRoles = currentUser?.role !== 'MANAGER'
  const roleOptions = canManageAdminRoles
    ? ['CLIENT', 'MASTER_CLIENT', 'MANAGER', 'ADMIN', 'SUPERADMIN']
    : ['CLIENT', 'MASTER_CLIENT']

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersResponse, companiesResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setUsers(usersResponse.data)
      setCompanies(companiesResponse.data)
      setDrafts(Object.fromEntries(usersResponse.data.map((user: AdminUser) => [
        user.id,
        {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          allergies: user.allergies || '',
          status: user.status || 'ACTIVE',
          role: user.role || 'CLIENT',
          companyId: user.companyId || user.company?.id || '',
        }
      ])))

      setCreateForm(prev => ({
        ...prev,
        companyId: prev.companyId || companiesResponse.data[0]?.id || '',
      }))
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateDraft = (userId: string, field: keyof UserDraft, value: string) => {
    setDrafts(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      }
    }))
  }

  const createUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.companyId) {
      setMessage('❌ Для создания пользователя нужны email, пароль и компания')
      return
    }

    setCreating(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/users`, createForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCreateForm({ ...emptyCreateForm, companyId: companies[0]?.id || '' })
      setMessage('✅ Пользователь создан')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось создать пользователя'}`)
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
      await axios.patch(`${API_URL}/admin/users/${userId}`, draft, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Данные пользователя обновлены')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось сохранить изменения'}`)
    } finally {
      setSavingId(null)
    }
  }

  const deleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Удалить пользователя ${email}? Это удалит его выборы, заказы и связанные данные.`)) return

    setDeletingId(userId)
    setMessage('')
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Пользователь удален')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить пользователя'}`)
    } finally {
      setDeletingId(null)
    }
  }

  const previewImport = async () => {
    if (!importFile) {
      setMessage('❌ Сначала выбери Excel-файл')
      return
    }

    setPreviewLoading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('defaultPassword', defaultPassword)

      const response = await axios.post(`${API_URL}/admin/users/import/preview`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })

      setImportPreview(response.data)
      setMessage(response.data.errorRows > 0
        ? '⚠️ В файле есть ошибки. Исправь их или укажи пароль по умолчанию.'
        : '✅ Файл разобран, можно импортировать пользователей')
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось разобрать Excel-файл'}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const commitImport = async () => {
    if (!importPreview?.rows?.length) {
      setMessage('❌ Нет данных для импорта')
      return
    }

    if (importPreview.errorRows > 0) {
      setMessage('❌ Нельзя импортировать файл, пока в нем есть ошибки')
      return
    }

    setCommitLoading(true)
    setMessage('')
    try {
      const response = await axios.post(`${API_URL}/admin/users/import/commit`, {
        rows: importPreview.rows,
        defaultPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setImportPreview(null)
      setImportFile(null)
      setDefaultPassword('')
      setMessage(`✅ Импорт завершен. Создано: ${response.data.created}, обновлено: ${response.data.updated}`)
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось импортировать пользователей'}`)
    } finally {
      setCommitLoading(false)
    }
  }

  return (
    <div>
      <h2>Пользователи</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Пользователи теперь привязываются к существующим компаниям. Компании создаются отдельно во вкладке «Компании».
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : message.includes('⚠️') ? '#fff3cd' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      {canManageAdminRoles && <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Импорт пользователей из Excel</h3>
        <p style={{ color: '#666', marginTop: -5 }}>
          Колонки: <strong>Компания</strong>, <strong>Email</strong>, <strong>Имя</strong>, <strong>Фамилия</strong>, <strong>Телефон</strong>, <strong>Роль</strong>, <strong>Пароль</strong>. Если пароля в файле нет, можно задать общий пароль по умолчанию.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportPreview(null) }} />
          <input placeholder="Пароль по умолчанию" value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} />
          <button onClick={previewImport} disabled={previewLoading || !importFile} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {previewLoading ? 'Разбираю файл...' : 'Показать preview'}
          </button>
          {importPreview && (
            <button onClick={commitImport} disabled={commitLoading || importPreview.errorRows > 0} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              {commitLoading ? 'Импортирую...' : 'Подтвердить импорт'}
            </button>
          )}
        </div>

        {importPreview && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Строк всего</div><strong>{importPreview.totalRows}</strong></div>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Без ошибок</div><strong>{importPreview.validRows}</strong></div>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Создать</div><strong>{importPreview.createCount}</strong></div>
              <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}><div style={{ color: '#666' }}>Обновить</div><strong>{importPreview.updateCount}</strong></div>
              <div style={{ background: '#f8d7da', padding: 12, borderRadius: 8 }}><div style={{ color: '#721c24' }}>Ошибки</div><strong>{importPreview.errorRows}</strong></div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {importPreview.rows.map((row) => (
                <div key={`${row.rowNumber}-${row.email}`} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 14, background: row.errors.length ? '#fff5f5' : '#fcfcfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div>
                      <strong>Строка {row.rowNumber}: {row.email || 'Без email'}</strong>
                      <div style={{ color: '#666' }}>{row.companyName || 'Без компании'}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 999, background: row.action === 'create' ? '#d4edda' : '#cfe2ff', color: row.action === 'create' ? '#155724' : '#084298', fontWeight: 600 }}>
                      {row.action === 'create' ? 'Создать' : 'Обновить'}
                    </div>
                  </div>
                  <div style={{ color: '#666' }}>{[row.firstName, row.lastName].filter(Boolean).join(' ') || 'Без имени'} {row.phone ? `• ${row.phone}` : ''}</div>
                  {row.errors.length > 0 && (
                    <div style={{ marginTop: 10, padding: 10, background: '#f8d7da', borderRadius: 6, color: '#721c24' }}>
                      {row.errors.map(error => <div key={error}>• {error}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>}

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Добавить пользователя</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <input placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))} />
          <input placeholder="Пароль" type="text" value={createForm.password} onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))} />
          <input placeholder="Имя" value={createForm.firstName} onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))} />
          <input placeholder="Фамилия" value={createForm.lastName} onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))} />
          <input placeholder="Телефон" value={createForm.phone} onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))} />
          <input placeholder="Аллергии" value={createForm.allergies} onChange={(e) => setCreateForm(prev => ({ ...prev, allergies: e.target.value }))} />
          <select value={createForm.status} onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}>
            {Object.entries(userStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={createForm.role} onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}>
            {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}
          </select>
          <select value={createForm.companyId} onChange={(e) => setCreateForm(prev => ({ ...prev, companyId: e.target.value }))}>
            <option value="">Выбери компанию</option>
            {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </div>

        <button onClick={createUser} disabled={creating} style={{ marginTop: 15, background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
          {creating ? 'Создание...' : 'Создать пользователя'}
        </button>
      </div>

      {loading ? (
        <p>Загрузка пользователей...</p>
      ) : users.length === 0 ? (
        <p>Пользователей пока нет</p>
      ) : (
        users.map(user => {
          const draft = drafts[user.id]
          if (!draft) return null

          return (
            <div key={user.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ marginBottom: 12 }}>
                <strong>{user.email}</strong>
                <div style={{ color: '#666' }}>{user.company?.name || 'Компания не выбрана'}</div>
                <div style={{ color: '#666', fontSize: 14 }}>{roleLabels[draft.role] || draft.role} • {userStatusLabels[draft.status] || draft.status}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <input value={draft.firstName} onChange={(e) => updateDraft(user.id, 'firstName', e.target.value)} placeholder="Имя" />
                <input value={draft.lastName} onChange={(e) => updateDraft(user.id, 'lastName', e.target.value)} placeholder="Фамилия" />
                <input value={draft.phone} onChange={(e) => updateDraft(user.id, 'phone', e.target.value)} placeholder="Телефон" />
                <input value={draft.allergies} onChange={(e) => updateDraft(user.id, 'allergies', e.target.value)} placeholder="Аллергии" />
                <select value={draft.status} onChange={(e) => updateDraft(user.id, 'status', e.target.value)}>
                  {Object.entries(userStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={draft.role} onChange={(e) => updateDraft(user.id, 'role', e.target.value)}>
                  {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}
                </select>
                <select value={draft.companyId} onChange={(e) => updateDraft(user.id, 'companyId', e.target.value)}>
                  <option value="">Без компании</option>
                  {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                <button onClick={() => saveUser(user.id)} disabled={savingId === user.id} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {savingId === user.id ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button onClick={() => deleteUser(user.id, user.email)} disabled={deletingId === user.id} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {deletingId === user.id ? 'Удаляю...' : 'Удалить пользователя'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
