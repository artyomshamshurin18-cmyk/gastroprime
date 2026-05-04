import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL, MEDIA_URL } from './api-config';


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

const measureUnitLabel: Record<string, string> = {
  GRAM: 'г',
  ML: 'мл',
  PCS: 'порц.',
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

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
      setShowCreateForm(false)
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
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
      const response = await axios.post(`${API_URL}/admin/dishes/import/commit`, { rows: importPreview.rows }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setImportPreview(null)
      setSelectedFile(null)
      setShowImport(false)
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
      setExpandedId(null)
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      setMessage('✅ Фото блюда обновлено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось загрузить фото'}`)
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
      setMessage('✅ Фото удалено')
      await loadData()
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.response?.data?.message || 'Не удалось удалить фото'}`)
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
      setMessage('❌ Сначала выбери блюда')
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
      setMessage('❌ Заполни хотя бы одно поле')
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
          await axios.patch(`${API_URL}/admin/dishes/${dish.id}`, { ...draft, ...overrides }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          updated += 1
        } catch (err: any) {
          failed.push(`${dish.name}: ${err.response?.data?.message || 'ошибка'}`)
        }
      }
      await loadData()
      if (failed.length > 0) {
        setMessage(`⚠️ Обновлено ${updated} из ${selectedDishes.length}. ${failed.slice(0, 2).join(' | ')}`)
      } else {
        resetBulkForm()
        setSelectedDishIds([])
        setMessage(`✅ Обновлено ${updated} блюд`)
      }
    } finally {
      setBulkApplying(false)
    }
  }

  const deleteSelectedDishes = async () => {
    if (selectedDishes.length === 0) {
      setMessage('❌ Сначала выбери блюда')
      return
    }
    if (!confirm(`Удалить ${selectedDishes.length} блюд?`)) return
    setBulkDeleting(true)
    setMessage('')
    try {
      let deleted = 0
      for (const dish of selectedDishes) {
        try {
          await axios.delete(`${API_URL}/admin/dishes/${dish.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          deleted += 1
        } catch {}
      }
      await loadData()
      setSelectedDishIds([])
      setMessage(`✅ Удалено ${deleted} блюд`)
    } finally {
      setBulkDeleting(false)
    }
  }

  // --- RENDER HELPERS ---

  const renderDishFields = (draft: DishDraft, onChange: (field: keyof DishDraft, value: string | number | boolean) => void) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Название</span>
        <input value={draft.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Название" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Состав / ингредиенты</span>
        <input value={draft.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Состав / ингредиенты" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Цена, ₽</span>
        <input type="number" min="0" value={displayNumber(draft.price)} onChange={(e) => onChange('price', parseNumber(e.target.value))} placeholder="Цена" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Калории</span>
        <input type="number" min="0" value={displayNumber(draft.calories)} onChange={(e) => onChange('calories', parseNumber(e.target.value))} placeholder="Калории" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Вес / объем</span>
        <input type="number" min="0" value={displayNumber(draft.weight)} onChange={(e) => onChange('weight', parseNumber(e.target.value))} placeholder="Вес/объем" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Единица</span>
        <select value={draft.measureUnit} onChange={(e) => onChange('measureUnit', e.target.value)}>
          <option value="GRAM">г</option>
          <option value="ML">мл</option>
          <option value="PCS">порц.</option>
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Категория</span>
        <select value={draft.categoryId} onChange={(e) => onChange('categoryId', e.target.value)}>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Часть завтрака</span>
        <select value={draft.breakfastPart} onChange={(e) => onChange('breakfastPart', e.target.value)}>
          <option value="">Не завтрак</option>
          <option value="MAIN">Основная</option>
          <option value="SIDE">Дополнительная</option>
        </select>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={draft.containsPork} onChange={(e) => onChange('containsPork', e.target.checked)} />
        Свинина
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={draft.containsGarlic} onChange={(e) => onChange('containsGarlic', e.target.checked)} />
        Чеснок
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={draft.containsMayonnaise} onChange={(e) => onChange('containsMayonnaise', e.target.checked)} />
        Майонез
      </label>
    </div>
  )

  return (
    <div>
      <h2 className="gp-page-title">Блюда</h2>
      <p className="gp-page-lead">
        Управление меню: добавляй, редактируй, импортируй и массово обновляй блюда.
      </p>

      {message && <div style={{ padding: 12, background: message.includes('❌') ? '#f8d7da' : message.includes('⚠️') ? '#fff3cd' : '#d4edda', marginBottom: 20, borderRadius: 6 }}>{message}</div>}

      {categories.length === 0 && (
        <div style={{ padding: 12, background: '#fff3cd', color: '#856404', marginBottom: 20, borderRadius: 6 }}>
          Нет категорий. Сначала нужно создать категории блюд.
        </div>
      )}

      {/* Импорт — collapsible */}
      <div className="gp-surface-card" style={{ padding: '12px 20px', marginBottom: 12 }}>
        <div
          onClick={() => { setShowImport(!showImport); if (!showImport) setShowCreateForm(false) }}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: '#6f42c1' }}>📥 Импорт из Excel</h3>
          <span style={{ fontSize: 12, color: '#888' }}>{showImport ? '\u25b2' : '\u25bc'}</span>
        </div>
        {showImport && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
              Колонки: <strong>Категория</strong>, <strong>Название</strong>, <strong>Описание</strong>, <strong>Цена</strong>, <strong>Калории</strong>, <strong>Вес/объем</strong>, <strong>Единица</strong>.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="file" accept=".xlsx,.xls" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setImportPreview(null) }} />
              <button onClick={previewImport} disabled={previewLoading || !selectedFile} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                {previewLoading ? 'Анализ...' : 'Предпросмотр'}
              </button>
              {importPreview && (
                <>
                  <button onClick={commitImport} disabled={commitLoading || importPreview.errorRows > 0} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                    {commitLoading ? 'Импортирую...' : 'Подтвердить импорт'}
                  </button>
                  <button onClick={() => { setImportPreview(null); setSelectedFile(null) }} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                    Сбросить
                  </button>
                </>
              )}
            </div>
            {importPreview && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f8f9fa' }}>Всего: <strong>{importPreview.totalRows}</strong></span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: '#d4edda' }}>Создать: <strong>{importPreview.createCount}</strong></span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: '#cfe2ff' }}>Обновить: <strong>{importPreview.updateCount}</strong></span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: importPreview.errorRows > 0 ? '#f8d7da' : '#e9ecef' }}>Ошибки: <strong>{importPreview.errorRows}</strong></span>
                </div>
                {importPreview.rows.map((row) => (
                  <div key={`${row.rowNumber}-${row.name}`} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 10, marginBottom: 8, background: row.errors.length ? '#fff5f5' : '#fcfcfc', fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div>
                        <strong>{row.name || '—'}</strong>
                        <span style={{ color: '#888', marginLeft: 8 }}>{row.categoryName}</span>
                        <span style={{ color: '#aaa', marginLeft: 8, fontSize: 12 }}>стр. {row.rowNumber}</span>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: row.action === 'create' ? '#d4edda' : '#cfe2ff', fontSize: 12, fontWeight: 600 }}>
                        {row.action === 'create' ? 'Создать' : 'Обновить'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
                      <span>{row.price} ₽</span>
                      <span>{row.calories || 0} ккал</span>
                      <span>{row.weight || 0} {measureUnitLabel[row.measureUnit] || row.measureUnit}</span>
                    </div>
                    {row.errors.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 13, color: '#dc3545' }}>
                        {row.errors.map((e, i) => <div key={i}>• {e}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Добавить блюдо — collapsible */}
      <div className="gp-surface-card" style={{ padding: '12px 20px', marginBottom: 12 }}>
        <div
          onClick={() => { setShowCreateForm(!showCreateForm); if (!showCreateForm) setShowImport(false) }}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: '#28a745' }}>+ Добавить блюдо</h3>
          <span style={{ fontSize: 12, color: '#888' }}>{showCreateForm ? '\u25b2' : '\u25bc'}</span>
        </div>
        {showCreateForm && (
          <div style={{ marginTop: 14 }}>
            {renderDishFields(createForm, (field, value) => setCreateForm(prev => ({ ...prev, [field]: value })))}
            <button onClick={createDish} disabled={creating} style={{ marginTop: 12, background: '#28a745', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
              {creating ? 'Добавление...' : 'Добавить блюдо'}
            </button>
          </div>
        )}
      </div>

      {/* Поиск, фильтрация и массовые действия */}
      <div className="gp-surface-card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Поиск и массовые действия</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: '#f8f9fa', fontSize: 13 }}>Всего: {dishes.length}</span>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: '#eef6ff', color: '#0b5ed7', fontSize: 13 }}>Найдено: {filteredDishes.length}</span>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: selectedDishIds.length ? '#e8fff3' : '#f8f9fa', color: selectedDishIds.length ? '#0f7b45' : '#666', fontSize: 13 }}>Выбрано: {selectedDishIds.length}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 2fr) minmax(220px, 1fr)', gap: 12, marginBottom: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13 }}>Поиск по названию и составу</span>
            <input placeholder="Например: плов, курица, суп..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13 }}>Категория</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Все категории</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <button onClick={toggleSelectAllFiltered} disabled={filteredDishes.length === 0} style={{ background: '#0d6efd', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
            {allFilteredSelected ? 'Снять выделение' : 'Выбрать все найденные'}
          </button>
          <button onClick={() => setSelectedDishIds([])} disabled={selectedDishIds.length === 0} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
            Очистить
          </button>
          <button onClick={() => { setSearchTerm(''); setCategoryFilter('') }} disabled={!searchTerm && !categoryFilter} style={{ background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
            Сбросить фильтры
          </button>
        </div>

        {/* Массовое изменение */}
        <div style={{ border: '1px solid #e8eef7', borderRadius: 12, padding: 16, background: '#fbfdff', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <strong style={{ fontSize: 14 }}>Массовое изменение</strong>
            <span style={{ fontSize: 13, color: selectedDishIds.length ? '#0f7b45' : '#888' }}>Выбрано: {selectedDishIds.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <input type="number" placeholder="Цена" value={bulkForm.price} onChange={(e) => setBulkForm(p => ({ ...p, price: e.target.value }))} />
            <input type="number" placeholder="Калории" value={bulkForm.calories} onChange={(e) => setBulkForm(p => ({ ...p, calories: e.target.value }))} />
            <input type="number" placeholder="Вес" value={bulkForm.weight} onChange={(e) => setBulkForm(p => ({ ...p, weight: e.target.value }))} />
            <select value={bulkForm.measureUnit} onChange={(e) => setBulkForm(p => ({ ...p, measureUnit: e.target.value }))}>
              <option value="">—</option>
              <option value="GRAM">г</option>
              <option value="ML">мл</option>
              <option value="PCS">порц.</option>
            </select>
            <select value={bulkForm.categoryId} onChange={(e) => setBulkForm(p => ({ ...p, categoryId: e.target.value }))}>
              <option value="">—</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select value={bulkForm.breakfastPart} onChange={(e) => setBulkForm(p => ({ ...p, breakfastPart: e.target.value as any }))}>
              <option value="__keep__">—</option>
              <option value="">Сбросить</option>
              <option value="MAIN">Осн. часть</option>
              <option value="SIDE">Доп. часть</option>
            </select>
            <select value={bulkForm.containsPork} onChange={(e) => setBulkForm(p => ({ ...p, containsPork: e.target.value as any }))}>
              <option value="keep">—</option>
              <option value="true">Свинина: да</option>
              <option value="false">Свинина: нет</option>
            </select>
            <select value={bulkForm.containsGarlic} onChange={(e) => setBulkForm(p => ({ ...p, containsGarlic: e.target.value as any }))}>
              <option value="keep">—</option>
              <option value="true">Чеснок: да</option>
              <option value="false">Чеснок: нет</option>
            </select>
            <select value={bulkForm.containsMayonnaise} onChange={(e) => setBulkForm(p => ({ ...p, containsMayonnaise: e.target.value as any }))}>
              <option value="keep">—</option>
              <option value="true">Майонез: да</option>
              <option value="false">Майонез: нет</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={applyBulkChanges} disabled={bulkApplying || selectedDishIds.length === 0} style={{ background: '#198754', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
              {bulkApplying ? 'Применяю...' : 'Применить'}
            </button>
            <button onClick={resetBulkForm} style={{ background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
              Очистить
            </button>
            <button onClick={deleteSelectedDishes} disabled={bulkDeleting || selectedDishIds.length === 0} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
              {bulkDeleting ? 'Удаляю...' : 'Удалить выбранные'}
            </button>
          </div>
        </div>
      </div>

      {/* Список блюд */}
      {loading ? (
        <p>Загрузка блюд...</p>
      ) : dishes.length === 0 ? (
        <p>Блюд пока нет</p>
      ) : filteredDishes.length === 0 ? (
        <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <strong>По текущему фильтру блюд не найдено.</strong>
          <div style={{ color: '#666', marginTop: 8 }}>Попробуй очистить поиск или выбрать другую категорию.</div>
        </div>
      ) : (
        filteredDishes.map(dish => {
          const draft = drafts[dish.id]
          if (!draft) return null
          const isExpanded = expandedId === dish.id

          return (
            <div key={dish.id} className="gp-surface-card" style={{ marginBottom: 8, overflow: 'hidden' }}>
              {/* Строка-заголовок */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : dish.id)}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                  background: isExpanded ? '#fafafa' : '#fff',
                  borderBottom: isExpanded ? '1px solid #eee' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  {/* Чекбокс — отдельно от клика на строку */}
                  <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={selectedDishIdSet.has(dish.id)} onChange={() => toggleDishSelection(dish.id)} />
                  </div>
                  {/* Фото-миниатюра */}
                  {dish.photoUrl && (
                    <img src={MEDIA_URL(dish.photoUrl)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dish.name}</div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#888', marginTop: 2, flexWrap: 'wrap' }}>
                      <span>{dish.category?.name}</span>
                      <span>{dish.price} ₽</span>
                      {dish.weight ? <span>{dish.weight} {measureUnitLabel[draft.measureUnit] || ''}</span> : null}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#999' }}>
                  <span style={{ fontSize: 11 }}>{isExpanded ? '\u25b2' : '\u25bc'}</span>
                </div>
              </div>

              {/* Раскрытые поля */}
              {isExpanded && (
                <div style={{ padding: '16px 20px' }}>
                  {/* Фото */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
                    <div style={{ width: 132, height: 132, borderRadius: 16, overflow: 'hidden', background: '#f6f6f6', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {dish.photoUrl
                        ? <img src={MEDIA_URL(dish.photoUrl)} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: '#999', fontSize: 12 }}>Нет фото</span>}
                    </div>
                    <div style={{ display: 'grid', gap: 8, minWidth: 240, flex: 1 }}>
                      <input type="file" accept="image/*" onChange={(e) => uploadDishPhoto(dish.id, e.target.files?.[0] || null)} />
                      <div style={{ color: '#666', fontSize: 13 }}>
                        {uploadingPhotoId === dish.id ? 'Загружаю фото...' : 'Фото автоматически обрезается под квадрат'}
                      </div>
                      {dish.photoUrl && (
                        <button onClick={() => removeDishPhoto(dish.id)} disabled={uploadingPhotoId === dish.id} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, maxWidth: 200 }}>
                          Удалить фото
                        </button>
                      )}
                    </div>
                  </div>

                  {renderDishFields(draft, (field, value) => updateDraft(dish.id, field, value))}

                  <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                    <button onClick={() => saveDish(dish.id)} disabled={savingId === dish.id} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                      {savingId === dish.id ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button onClick={() => cloneDish(dish)} disabled={cloningId === dish.id} style={{ background: '#6f42c1', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                      {cloningId === dish.id ? 'Клонирую...' : 'Клонировать'}
                    </button>
                    <button onClick={() => deleteDish(dish.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14 }}>
                      Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
