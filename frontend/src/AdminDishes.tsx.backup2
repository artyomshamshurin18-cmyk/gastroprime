import { useEffect, useMemo, useState } from 'react'
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

type BulkBooleanMode = 'keep' | 'true' | 'false'

interface BulkEditForm {
  price: string
  calories: string
  weight: string
  measureUnit: string
  categoryId: string
  breakfastPart: '__keep__' | '' | 'MAIN' | 'SIDE'
  containsPork: BulkBooleanMode
  containsGarlic: BulkBooleanMode
  containsMayonnaise: BulkBooleanMode
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

const emptyBulkForm: BulkEditForm = {
  price: '',
  calories: '',
  weight: '',
  measureUnit: '',
  categoryId: '',
  breakfastPart: '__keep__',
  containsPork: 'keep',
  containsGarlic: 'keep',
  containsMayonnaise: 'keep',
}

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
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([])
  const [bulkForm, setBulkForm] = useState<BulkEditForm>(emptyBulkForm)
  const [bulkApplying, setBulkApplying] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [cloningId, setCloningId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [dishesResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/dishes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/menu/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setDishes(dishesResponse.data)
      setCategories(categoriesResponse.data)
      setSelectedDishIds(prev => prev.filter(id => dishesResponse.data.some((dish: Dish) => dish.id === id)))
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

  const filteredDishes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return dishes.filter((dish) => {
      const matchesCategory = !categoryFilter || dish.categoryId === categoryFilter
      const haystack = [dish.name, dish.description, dish.category?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      return matchesCategory && matchesSearch
    })
  }, [dishes, categoryFilter, searchTerm])

  const selectedDishIdSet = useMemo(() => new Set(selectedDishIds), [selectedDishIds])
  const selectedDishes = useMemo(() => dishes.filter((dish) => selectedDishIdSet.has(dish.id)), [dishes, selectedDishIdSet])
  const allFilteredSelected = filteredDishes.length > 0 && filteredDishes.every((dish) => selectedDishIdSet.has(dish.id))

  const toggleDishSelection = (dishId: string) => {
    setSelectedDishIds((prev) => prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId])
  }

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredDishes.map((dish) => dish.id))
      setSelectedDishIds((prev) => prev.filter((id) => !filteredIds.has(id)))
      return
    }

    setSelectedDishIds((prev) => Array.from(new Set([...prev, ...filteredDishes.map((dish) => dish.id)])))
  }

  const resetBulkForm = () => setBulkForm(emptyBulkForm)

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
      setSelectedDishIds(prev => prev.filter(id => id !== dishId))
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

  const cloneDish = async (dish: Dish) => {
    const draft = drafts[dish.id]
    if (!draft) return

    setCloningId(dish.id)
    setMessage('')
    try {
      await axios.post(`${API_URL}/admin/dishes`, {
        ...draft,
        name: `${draft.name} (копия)`,
        photoUrl: dish.photoUrl || null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(`✅ Блюдо «${dish.name}» склонировано`)
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось клонировать блюдо'}`)
    } finally {
      setCloningId(null)
    }
  }

  const applyBulkChanges = async () => {
    if (selectedDishes.length === 0) {
      setMessage('❌ Сначала выбери блюда, к которым нужно применить изменения')
      return
    }

    const overrides: Partial<DishDraft> = {}

    if (bulkForm.price !== '') overrides.price = parseNumber(bulkForm.price)
    if (bulkForm.calories !== '') overrides.calories = parseNumber(bulkForm.calories)
    if (bulkForm.weight !== '') overrides.weight = parseNumber(bulkForm.weight)
    if (bulkForm.measureUnit) overrides.measureUnit = bulkForm.measureUnit
    if (bulkForm.categoryId) overrides.categoryId = bulkForm.categoryId
    if (bulkForm.breakfastPart !== '__keep__') overrides.breakfastPart = bulkForm.breakfastPart
    if (bulkForm.containsPork !== 'keep') overrides.containsPork = bulkForm.containsPork === 'true'
    if (bulkForm.containsGarlic !== 'keep') overrides.containsGarlic = bulkForm.containsGarlic === 'true'
    if (bulkForm.containsMayonnaise !== 'keep') overrides.containsMayonnaise = bulkForm.containsMayonnaise === 'true'

    if (Object.keys(overrides).length === 0) {
      setMessage('❌ Заполни хотя бы одно поле в блоке массового изменения')
      return
    }

    setBulkApplying(true)
    setMessage('')

    try {
      let updated = 0
      const failed: string[] = []

      for (const dish of selectedDishes) {
        const draft = drafts[dish.id]
        if (!draft) continue

        try {
          await axios.patch(`${API_URL}/admin/dishes/${dish.id}`, {
            ...draft,
            ...overrides,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          updated += 1
        } catch (err: any) {
          console.error(err)
          failed.push(`${dish.name}: ${err.response?.data?.message || 'ошибка обновления'}`)
        }
      }

      await loadData()

      if (failed.length > 0) {
        setMessage(`⚠️ Обновлено ${updated} из ${selectedDishes.length}. Ошибки: ${failed.slice(0, 2).join(' | ')}${failed.length > 2 ? ' …' : ''}`)
      } else {
        resetBulkForm()
        setSelectedDishIds([])
        setMessage(`✅ Массовое обновление применено к ${updated} блюдам`)
      }
    } finally {
      setBulkApplying(false)
    }
  }

  const deleteSelectedDishes = async () => {
    if (selectedDishes.length === 0) {
      setMessage('❌ Сначала выбери блюда для удаления')
      return
    }

    if (!confirm(`Удалить выбранные блюда: ${selectedDishes.length} шт.?`)) return

    setBulkDeleting(true)
    setMessage('')

    try {
      let deleted = 0
      const failed: string[] = []

      for (const dish of selectedDishes) {
        try {
          await axios.delete(`${API_URL}/admin/dishes/${dish.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          deleted += 1
        } catch (err: any) {
          console.error(err)
          failed.push(`${dish.name}: ${err.response?.data?.message || 'ошибка удаления'}`)
        }
      }

      await loadData()

      if (failed.length > 0) {
        setMessage(`⚠️ Удалено ${deleted} из ${selectedDishes.length}. Ошибки: ${failed.slice(0, 2).join(' | ')}${failed.length > 2 ? ' …' : ''}`)
      } else {
        setSelectedDishIds([])
        setMessage(`✅ Удалено ${deleted} блюд`)
      }
    } finally {
      setBulkDeleting(false)
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

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Поиск, фильтрация и массовые действия</h3>
            <div style={{ color: '#666', marginTop: 6 }}>Ищи блюда по названию и составу, фильтруй по категориям и применяй одинаковые изменения сразу к выбранным позициям.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 14px', borderRadius: 999, background: '#f8f9fa', fontWeight: 600 }}>Всего: {dishes.length}</div>
            <div style={{ padding: '10px 14px', borderRadius: 999, background: '#eef6ff', color: '#0b5ed7', fontWeight: 600 }}>Найдено: {filteredDishes.length}</div>
            <div style={{ padding: '10px 14px', borderRadius: 999, background: selectedDishIds.length ? '#e8fff3' : '#f8f9fa', color: selectedDishIds.length ? '#0f7b45' : '#666', fontWeight: 600 }}>Выбрано: {selectedDishIds.length}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 2fr) minmax(220px, 1fr)', gap: 12, marginBottom: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Быстрый поиск</span>
            <input
              placeholder="Например: плов, курица, суп, салат"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Фильтр по категории</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Все категории</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <button onClick={toggleSelectAllFiltered} disabled={filteredDishes.length === 0} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            {allFilteredSelected ? 'Снять выделение с найденных' : 'Выбрать все найденные'}
          </button>
          <button onClick={() => setSelectedDishIds([])} disabled={selectedDishIds.length === 0} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
            Очистить выделение
          </button>
          <button onClick={() => { setSearchTerm(''); setCategoryFilter('') }} disabled={!searchTerm && !categoryFilter} style={{ background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', borderRadius: 6, padding: '10px 18px' }}>
            Сбросить фильтры
          </button>
        </div>

        <div style={{ border: '1px solid #e8eef7', borderRadius: 12, padding: 16, background: '#fbfdff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <strong>Массовое изменение выбранных блюд</strong>
              <div style={{ color: '#666', marginTop: 6 }}>Заполняй только те поля, которые нужно применить ко всем выбранным позициям. Остальные значения останутся как есть.</div>
            </div>
            <div style={{ color: selectedDishIds.length ? '#0f7b45' : '#666', fontWeight: 600 }}>Выбрано: {selectedDishIds.length}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Цена, ₽</span>
              <input type="number" min="0" value={bulkForm.price} onChange={(e) => setBulkForm(prev => ({ ...prev, price: e.target.value }))} placeholder="Не менять" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Калории</span>
              <input type="number" min="0" value={bulkForm.calories} onChange={(e) => setBulkForm(prev => ({ ...prev, calories: e.target.value }))} placeholder="Не менять" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Вес / объем</span>
              <input type="number" min="0" value={bulkForm.weight} onChange={(e) => setBulkForm(prev => ({ ...prev, weight: e.target.value }))} placeholder="Не менять" />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Единица</span>
              <select value={bulkForm.measureUnit} onChange={(e) => setBulkForm(prev => ({ ...prev, measureUnit: e.target.value }))}>
                <option value="">Не менять</option>
                <option value="GRAM">г</option>
                <option value="ML">мл</option>
                <option value="PCS">порц.</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Категория</span>
              <select value={bulkForm.categoryId} onChange={(e) => setBulkForm(prev => ({ ...prev, categoryId: e.target.value }))}>
                <option value="">Не менять</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Часть завтрака</span>
              <select value={bulkForm.breakfastPart} onChange={(e) => setBulkForm(prev => ({ ...prev, breakfastPart: e.target.value as BulkEditForm['breakfastPart'] }))}>
                <option value="__keep__">Не менять</option>
                <option value="">Сбросить</option>
                <option value="MAIN">Основная часть</option>
                <option value="SIDE">Дополнительная часть</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Свинина</span>
              <select value={bulkForm.containsPork} onChange={(e) => setBulkForm(prev => ({ ...prev, containsPork: e.target.value as BulkBooleanMode }))}>
                <option value="keep">Не менять</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Чеснок</span>
              <select value={bulkForm.containsGarlic} onChange={(e) => setBulkForm(prev => ({ ...prev, containsGarlic: e.target.value as BulkBooleanMode }))}>
                <option value="keep">Не менять</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Майонез</span>
              <select value={bulkForm.containsMayonnaise} onChange={(e) => setBulkForm(prev => ({ ...prev, containsMayonnaise: e.target.value as BulkBooleanMode }))}>
                <option value="keep">Не менять</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={applyBulkChanges} disabled={bulkApplying || selectedDishIds.length === 0} style={{ background: '#198754', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              {bulkApplying ? 'Применяю...' : 'Применить к выбранным'}
            </button>
            <button onClick={resetBulkForm} disabled={bulkApplying || bulkDeleting} style={{ background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', borderRadius: 6, padding: '10px 18px' }}>
              Очистить поля массового изменения
            </button>
            <button onClick={deleteSelectedDishes} disabled={bulkDeleting || selectedDishIds.length === 0} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
              {bulkDeleting ? 'Удаляю...' : 'Удалить выбранные'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Загрузка блюд...</p>
      ) : dishes.length === 0 ? (
        <p>Блюд пока нет</p>
      ) : filteredDishes.length === 0 ? (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <strong>По текущему фильтру блюд не найдено.</strong>
          <div style={{ color: '#666', marginTop: 8 }}>Попробуй очистить поиск или выбрать другую категорию.</div>
        </div>
      ) : (
        filteredDishes.map(dish => {
          const draft = drafts[dish.id]
          if (!draft) return null

          return (
            <div key={dish.id} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12, alignItems: 'flex-start' }}>
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedDishIdSet.has(dish.id)} onChange={() => toggleDishSelection(dish.id)} style={{ marginTop: 4 }} />
                  <div>
                    <strong>{dish.name}</strong>
                    <div style={{ color: '#666', marginTop: 4 }}>{dish.category?.name}</div>
                  </div>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ padding: '6px 10px', borderRadius: 999, background: '#f8f9fa', color: '#666', fontSize: 13 }}>
                    ID: {dish.id.slice(0, 8)}
                  </div>
                  <div style={{ padding: '6px 10px', borderRadius: 999, background: '#eef6ff', color: '#0b5ed7', fontSize: 13 }}>
                    {draft.weight || 0} {draft.measureUnit === 'ML' ? 'мл' : draft.measureUnit === 'PCS' ? 'порц.' : 'г'}
                  </div>
                </div>
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
                <button onClick={() => cloneDish(dish)} disabled={cloningId === dish.id} style={{ background: '#6f42c1', color: 'white', border: 'none', borderRadius: 6, padding: '10px 18px' }}>
                  {cloningId === dish.id ? 'Клонирую...' : 'Клонировать'}
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
