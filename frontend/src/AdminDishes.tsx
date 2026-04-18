import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

interface Category {
  id: string
  name: string
}

interface Dish {
  id: string
  name: string
  description?: string
  photoUrl?: string | null
  price: number
  calories?: number | null
  weight?: number | null
  measureUnit?: string
  containsPork?: boolean
  containsGarlic?: boolean
  containsMayonnaise?: boolean
  breakfastPart?: string | null
  categoryId: string
  category?: {
    id: string
    name: string
  }
}

interface DishDraft {
  name: string
  description: string
  price: number
  calories: number
  weight: number
  measureUnit: string
  containsPork: boolean
  containsGarlic: boolean
  containsMayonnaise: boolean
  breakfastPart: string
  categoryId: string
}

interface ImportPreviewRow {
  rowNumber: number
  name: string
  description: string
  price: number
  calories: number
  weight: number
  measureUnit: string
  categoryName: string
  categoryId: string
  action: 'create' | 'update'
  existingDishId?: string | null
  existingCategoryName?: string | null
  errors: string[]
}

interface ImportPreview {
  fileName: string
  totalRows: number
  validRows: number
  errorRows: number
  createCount: number
  updateCount: number
  rows: ImportPreviewRow[]
}

const emptyDishForm: DishDraft = {
  name: '',
  description: '',
  price: 0,
  calories: 0,
  weight: 0,
  measureUnit: 'GRAM',
  containsPork: false,
  containsGarlic: false,
  containsMayonnaise: false,
  breakfastPart: '',
  categoryId: '',
}

const displayNumber = (value: number) => value === 0 ? '' : String(value)
const parseNumber = (value: string) => value === '' ? 0 : parseInt(value, 10) || 0

export default function AdminDishes({ token }: { token: string }) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [drafts, setDrafts] = useState<Record<string, DishDraft>>({})
  const [createForm, setCreateForm] = useState<DishDraft>(emptyDishForm)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [commitLoading, setCommitLoading] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [dishesResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/dishes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/menu/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setDishes(dishesResponse.data)
      setCategories(categoriesResponse.data)
      setDrafts(Object.fromEntries(dishesResponse.data.map((dish: Dish) => [
        dish.id,
        {
          name: dish.name || '',
          description: dish.description || '',
          price: dish.price || 0,
          calories: dish.calories || 0,
          weight: dish.weight || 0,
          measureUnit: dish.measureUnit || 'GRAM',
          containsPork: Boolean(dish.containsPork),
          containsGarlic: Boolean(dish.containsGarlic),
          containsMayonnaise: Boolean(dish.containsMayonnaise),
          breakfastPart: dish.breakfastPart || '',
          categoryId: dish.categoryId || '',
        }
      ])))

      setCreateForm(prev => ({
        ...prev,
        categoryId: prev.categoryId || categoriesResponse.data[0]?.id || '',
      }))
    } catch (err) {
      console.error(err)
      setMessage('❌ Не удалось загрузить блюда')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateDraft = (dishId: string, field: keyof DishDraft, value: string | number | boolean) => {
    setDrafts(prev => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        [field]: value,
      }
    }))
  }

  const createDish = async () => {
    if (!createForm.name || !createForm.categoryId) {
      setMessage('❌ Для добавления блюда нужны название и категория')
      return
    }

    setCreating(true)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/dishes`, createForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCreateForm({ ...emptyDishForm, categoryId: categories[0]?.id || '' })
      setMessage('✅ Блюдо добавлено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось добавить блюдо'}`)
    } finally {
      setCreating(false)
    }
  }

  const previewImport = async () => {
    if (!selectedFile) {
      setMessage('❌ Сначала выбери Excel-файл')
      return
    }

    setPreviewLoading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post(`${API_URL}/admin/dishes/import/preview`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })

      setImportPreview(response.data)
      setMessage(response.data.errorRows > 0
        ? '⚠️ В файле есть ошибки. Исправь их и загрузи файл заново.'
        : '✅ Файл успешно разобран, можно импортировать')
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
      const response = await axios.post(`${API_URL}/admin/dishes/import/commit`, {
        rows: importPreview.rows,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setImportPreview(null)
      setSelectedFile(null)
      setMessage(`✅ Импорт завершен. Создано: ${response.data.created}, обновлено: ${response.data.updated}`)
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось выполнить импорт'}`)
    } finally {
      setCommitLoading(false)
    }
  }

  const saveDish = async (dishId: string) => {
    const draft = drafts[dishId]
    if (!draft) return

    setSavingId(dishId)
    setMessage('')
    try {
      await axios.patch(`${API_URL}/admin/dishes/${dishId}`, draft, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Блюдо обновлено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось обновить блюдо'}`)
    } finally {
      setSavingId(null)
    }
  }

  const deleteDish = async (dishId: string) => {
    if (!confirm('Удалить блюдо?')) return

    try {
      await axios.delete(`${API_URL}/admin/dishes/${dishId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Блюдо удалено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить блюдо'}`)
    }
  }

  const uploadDishPhoto = async (dishId: string, file?: File | null) => {
    if (!file) return

    setUploadingPhotoId(dishId)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await axios.post(`${API_URL}/admin/dishes/${dishId}/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      setMessage('✅ Фото блюда обновлено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось загрузить фото блюда'}`)
    } finally {
      setUploadingPhotoId(null)
    }
  }

  const removeDishPhoto = async (dishId: string) => {
    setUploadingPhotoId(dishId)
    setMessage('')
    try {
      await axios.delete(`${API_URL}/admin/dishes/${dishId}/photo`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Фото блюда удалено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить фото блюда'}`)
    } finally {
      setUploadingPhotoId(null)
    }
  }

  return (
    <div>
      <h2>Блюда</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 15 }}>
        Здесь можно вручную работать с блюдами и загружать Excel-файл для массового импорта. Сначала показываем предпросмотр, потом подтверждаем импорт.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : message.includes('⚠️') ? '#fff3cd' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      {categories.length === 0 && (
        <div style={{ padding: 12, background: '#fff3cd', color: '#856404', marginBottom: 20, borderRadius: 6 }}>
          Нет категорий. Сначала нужно, чтобы в системе были созданы категории блюд.
        </div>
      )}

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Импорт из Excel</h3>
        <p style={{ color: '#666', marginTop: -5 }}>
          Поддерживаемые колонки: <strong>Категория</strong>, <strong>Название</strong>, <strong>Описание</strong>, <strong>Цена</strong>, <strong>Калории</strong>, <strong>Вес/объем</strong>, <strong>Единица измерения</strong>.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => {
            const file = e.target.files?.[0] || null
            setSelectedFile(file)
            setImportPreview(null)
          }} />
          <button onClick={previewImport} disabled={previewLoading || !selectedFile} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {previewLoading ? 'Разбираю файл...' : 'Показать предпросмотр'}
          </button>
          {importPreview && (
            <button onClick={commitImport} disabled={commitLoading || importPreview.errorRows > 0} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              {commitLoading ? 'Импортирую...' : 'Подтвердить импорт'}
            </button>
          )}
          {importPreview && (
            <button onClick={() => { setImportPreview(null); setSelectedFile(null) }} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              Сбросить предпросмотр
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
                <div key={`${row.rowNumber}-${row.name}`} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 14, background: row.errors.length ? '#fff5f5' : '#fcfcfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div>
                      <strong>Строка {row.rowNumber}: {row.name || 'Без названия'}</strong>
                      <div style={{ color: '#666' }}>{row.categoryName || 'Без категории'}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 999, background: row.action === 'create' ? '#d4edda' : '#cfe2ff', color: row.action === 'create' ? '#155724' : '#084298', fontWeight: 600 }}>
                      {row.action === 'create' ? 'Создать' : 'Обновить'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    <div>Цена: <strong>{row.price} ₽</strong></div>
                    <div>Калории: <strong>{row.calories || 0}</strong></div>
                    <div>Выход: <strong>{row.weight || 0} {row.measureUnit === 'ML' ? 'мл' : row.measureUnit === 'PCS' ? 'порц.' : 'г'}</strong></div>
                    {row.existingCategoryName && <div>Текущая категория: <strong>{row.existingCategoryName}</strong></div>}
                  </div>

                  {row.description && <div style={{ marginTop: 8, color: '#666' }}>{row.description}</div>}

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
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Добавить блюдо вручную</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Наименование</span>
            <input placeholder="Например: Борщ" value={createForm.name} onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Состав / ингредиенты</span>
            <input placeholder="Например: говядина, картофель, морковь, лук, специи" value={createForm.description} onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Цена, ₽</span>
            <input type="number" min="0" placeholder="Например: 300" value={displayNumber(createForm.price)} onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseNumber(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Калории</span>
            <input type="number" min="0" placeholder="Например: 450" value={displayNumber(createForm.calories)} onChange={(e) => setCreateForm(prev => ({ ...prev, calories: parseNumber(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Вес / объем на порцию</span>
            <input type="number" min="0" placeholder="Например: 250" value={displayNumber(createForm.weight)} onChange={(e) => setCreateForm(prev => ({ ...prev, weight: parseNumber(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Единица</span>
            <select value={createForm.measureUnit} onChange={(e) => setCreateForm(prev => ({ ...prev, measureUnit: e.target.value }))}>
              <option value="GRAM">г</option>
              <option value="ML">мл</option>
              <option value="PCS">порц.</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Категория</span>
            <select value={createForm.categoryId} onChange={(e) => setCreateForm(prev => ({ ...prev, categoryId: e.target.value }))}>
              <option value="">Выбери категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Часть завтрака</span>
            <select value={createForm.breakfastPart} onChange={(e) => setCreateForm(prev => ({ ...prev, breakfastPart: e.target.value }))}>
              <option value="">Не завтрак / не важно</option>
              <option value="MAIN">Основная часть</option>
              <option value="SIDE">Дополнительная часть</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={createForm.containsPork} onChange={(e) => setCreateForm(prev => ({ ...prev, containsPork: e.target.checked }))} />
            Содержит свинину
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={createForm.containsGarlic} onChange={(e) => setCreateForm(prev => ({ ...prev, containsGarlic: e.target.checked }))} />
            Содержит чеснок
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={createForm.containsMayonnaise} onChange={(e) => setCreateForm(prev => ({ ...prev, containsMayonnaise: e.target.checked }))} />
            Содержит майонез
          </label>
        </div>
        <button onClick={createDish} disabled={creating} style={{ marginTop: 15, background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
          {creating ? 'Добавление...' : 'Добавить блюдо'}
        </button>
      </div>

      {loading ? (
        <p>Загрузка блюд...</p>
      ) : dishes.length === 0 ? (
        <p>Блюд пока нет</p>
      ) : (
        dishes.map(dish => {
          const draft = drafts[dish.id]
          if (!draft) return null

          return (
            <div key={dish.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ marginBottom: 10 }}>
                <strong>{dish.name}</strong>
                <div style={{ color: '#666' }}>{dish.category?.name}</div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ width: 132, height: 132, borderRadius: 16, overflow: 'hidden', background: '#f6f6f6', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(0,0,0,0.06)' }}>
                  {dish.photoUrl ? <img src={mediaUrl(dish.photoUrl)} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} /> : <span style={{ color: '#999', fontSize: 12 }}>Нет фото</span>}
                </div>
                <div style={{ display: 'grid', gap: 8, minWidth: 240, flex: '1 1 260px' }}>
                  <input type="file" accept="image/*" onChange={(e) => uploadDishPhoto(dish.id, e.target.files?.[0] || null)} />
                  <div style={{ color: '#666', fontSize: 13 }}>{uploadingPhotoId === dish.id ? 'Загружаю фото...' : 'Фото автоматически центрируется и обрезается под аккуратный квадратный превью-блок'}</div>
                  {dish.photoUrl && <button onClick={() => removeDishPhoto(dish.id)} disabled={uploadingPhotoId === dish.id} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '10px 14px', width: '100%', maxWidth: 220 }}>Удалить фото</button>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Наименование</span>
                  <input value={draft.name} onChange={(e) => updateDraft(dish.id, 'name', e.target.value)} placeholder="Название" />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Состав / ингредиенты</span>
                  <input value={draft.description} onChange={(e) => updateDraft(dish.id, 'description', e.target.value)} placeholder="Состав / ингредиенты" />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Цена, ₽</span>
                  <input type="number" min="0" value={displayNumber(draft.price)} onChange={(e) => updateDraft(dish.id, 'price', parseNumber(e.target.value))} placeholder="Цена" />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Калории</span>
                  <input type="number" min="0" value={displayNumber(draft.calories)} onChange={(e) => updateDraft(dish.id, 'calories', parseNumber(e.target.value))} placeholder="Калории" />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Вес / объем на порцию</span>
                  <input type="number" min="0" value={displayNumber(draft.weight)} onChange={(e) => updateDraft(dish.id, 'weight', parseNumber(e.target.value))} placeholder="Вес/объем" />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Единица</span>
                  <select value={draft.measureUnit} onChange={(e) => updateDraft(dish.id, 'measureUnit', e.target.value)}>
                    <option value="GRAM">г</option>
                    <option value="ML">мл</option>
                    <option value="PCS">порц.</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Категория</span>
                  <select value={draft.categoryId} onChange={(e) => updateDraft(dish.id, 'categoryId', e.target.value)}>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Часть завтрака</span>
                  <select value={draft.breakfastPart} onChange={(e) => updateDraft(dish.id, 'breakfastPart', e.target.value)}>
                    <option value="">Не завтрак / не важно</option>
                    <option value="MAIN">Основная часть</option>
                    <option value="SIDE">Дополнительная часть</option>
                  </select>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={draft.containsPork} onChange={(e) => updateDraft(dish.id, 'containsPork', e.target.checked)} />
                  Содержит свинину
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={draft.containsGarlic} onChange={(e) => updateDraft(dish.id, 'containsGarlic', e.target.checked)} />
                  Содержит чеснок
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={draft.containsMayonnaise} onChange={(e) => updateDraft(dish.id, 'containsMayonnaise', e.target.checked)} />
                  Содержит майонез
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <button onClick={() => saveDish(dish.id)} disabled={savingId === dish.id} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {savingId === dish.id ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={() => deleteDish(dish.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  Удалить
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
