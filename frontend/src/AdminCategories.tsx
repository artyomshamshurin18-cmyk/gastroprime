import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

interface Category {
  id: string
  name: string
  _count?: {
    dishes: number
  }
}

export default function AdminCategories({ token }: { token: string }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [replacements, setReplacements] = useState<Record<string, string>>({})
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCategories(response.data)
      setDrafts(Object.fromEntries(response.data.map((category: Category) => [category.id, category.name || ''])))
      setReplacements(prev => Object.fromEntries(response.data.map((category: Category) => [category.id, prev[category.id] || ''])))
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось загрузить категории')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const categoryOptions = useMemo(() => categories.map(category => ({ value: category.id, label: category.name })), [categories])

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage('❌ Введите название категории')
      return
    }

    setCreating(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/categories`, { name: newCategoryName }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewCategoryName('')
      setMessage('✅ Категория создана')
      await loadCategories()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось создать категорию'}`)
    } finally {
      setCreating(false)
    }
  }

  const saveCategory = async (categoryId: string) => {
    const name = drafts[categoryId]
    if (!name?.trim()) {
      setMessage('❌ Название категории не может быть пустым')
      return
    }

    setSavingId(categoryId)
    setMessage('')
    try {
      await axios.patch(`${API_URL}/admin/categories/${categoryId}`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Категория обновлена')
      await loadCategories()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось обновить категорию'}`)
    } finally {
      setSavingId(null)
    }
  }

  const deleteCategory = async (category: Category) => {
    const dishesCount = category._count?.dishes || 0
    const replacementCategoryId = replacements[category.id] || undefined

    if (dishesCount > 0 && !replacementCategoryId) {
      setMessage('❌ Для удаления категории с блюдами выберите, куда перенести блюда')
      return
    }

    if (!confirm(dishesCount > 0
      ? `Удалить категорию «${category.name}» и перенести ${dishesCount} блюд?`
      : `Удалить категорию «${category.name}»?`)) {
      return
    }

    setDeletingId(category.id)
    setMessage('')
    try {
      await axios.delete(`${API_URL}/admin/categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { replacementCategoryId }
      })
      setMessage('✅ Категория удалена')
      await loadCategories()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить категорию'}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h2>Категории</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Здесь можно создавать, переименовывать и удалять категории. Если в категории уже есть блюда, их можно перенести в другую категорию прямо при удалении.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Добавить категорию</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input placeholder="Например: Десерт" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ minWidth: 280 }} />
          <button onClick={createCategory} disabled={creating} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {creating ? 'Создание...' : 'Создать категорию'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Загрузка категорий...</p>
      ) : categories.length === 0 ? (
        <p>Категорий пока нет</p>
      ) : (
        categories.map(category => {
          const dishesCount = category._count?.dishes || 0
          const moveTargets = categoryOptions.filter(option => option.value !== category.id)

          return (
            <div key={category.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <strong>{category.name}</strong>
                  <div style={{ color: '#666' }}>Блюд в категории: {dishesCount}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, alignItems: 'end' }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Название</span>
                  <input value={drafts[category.id] || ''} onChange={(e) => setDrafts(prev => ({ ...prev, [category.id]: e.target.value }))} />
                </label>

                {dishesCount > 0 && (
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Перенести блюда при удалении</span>
                    <select value={replacements[category.id] || ''} onChange={(e) => setReplacements(prev => ({ ...prev, [category.id]: e.target.value }))}>
                      <option value="">Выберите категорию</option>
                      {moveTargets.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                <button onClick={() => saveCategory(category.id)} disabled={savingId === category.id} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {savingId === category.id ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={() => deleteCategory(category)} disabled={deletingId === category.id} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {deletingId === category.id ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
