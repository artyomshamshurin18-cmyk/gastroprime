import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, CRM_STAGES, DEAL_SOURCES } from './types';

interface Deal {
  id: string;
  company: { id: string; name: string; contactPerson: string | null; address: string | null; status: string; workEmail?: string; peopleCount?: number };
  manager: { id: string; email: string; firstName: string; lastName: string };
  stage: string;
  probability: number;
  estimatedAmount: number;
  nextContactDate: string | null;
  minPrice?: number;
  maxPrice?: number;
  workDays?: number;
  source: string;
  notes: string | null;
  _count: { logs: number };
  createdAt: string;
  updatedAt: string;
}

interface DealLog {
  id: string;
  action: string;
  comment: string | null;
  oldValue: string | null;
  newValue: string | null;
  user: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export default function CrmDealsKanban({ token, userRole: _userRole }: { token: string; userRole: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealLogs, setDealLogs] = useState<DealLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; firstName: string; lastName: string; role: string }[]>([]);
  const [createForm, setCreateForm] = useState<{companyId: string; source: string; notes: string; estimatedAmount: number; minPrice: number; maxPrice: number; workDays: number; managerId: string}>({ companyId: '', source: 'COLD', notes: '', estimatedAmount: 0, minPrice: 0, maxPrice: 0, workDays: 5, managerId: '' });
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null);
  const [detailLogs, setDetailLogs] = useState<DealLog[]>([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadDeals(); loadCompanies(); loadManagers(); }, []);

  const loadDeals = async () => {
    try {
      const res = await axios.get(`${API_URL}/crm/deals?limit=200`, { headers });
      setDeals(Array.isArray(res.data) ? res.data : res.data.deals || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadCompanies = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/companies?limit=500`, { headers });
      setCompanies(res.data.companies?.map((c: any) => ({ id: c.id, name: c.name })) || []);
    } catch (e) { /* skip */ }
  };

  const loadManagers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/users`, { headers });
      const users = (data.users || data || []).filter((u: any) =>
        u.role !== 'CLIENT'
      ).map((u: any) => ({ id: u.id, firstName: u.firstName || '', lastName: u.lastName || '', role: u.role }));
      setManagers(users);
    } catch (e) { /* skip */ }
  };

  const loadDealDetail = async (deal: Deal) => {
    try {
      const [detailRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/crm/deals/${deal.id}`, { headers }),
        axios.get(`${API_URL}/crm/deals/${deal.id}/logs`, { headers }),
      ]);
      setDetailDeal(detailRes.data);
      setDetailLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (e) {
      setDetailDeal(deal);
      setDetailLogs([]);
    }
  };

  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      await axios.patch(`${API_URL}/crm/deals/${dealId}`, { stage: newStage }, { headers });
      loadDeals();
      if (detailDeal?.id === dealId) {
        setDetailDeal({ ...detailDeal, stage: newStage } as any);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!createForm.companyId) return;
    try {
      const payload: any = { ...createForm };
      if (!payload.managerId) delete payload.managerId;
      await axios.post(`${API_URL}/crm/deals`, payload, { headers });
      setShowCreateModal(false);
      setCreateForm({ companyId: '', source: 'COLD', notes: '', estimatedAmount: 0, minPrice: 0, maxPrice: 0, workDays: 5, managerId: '' });
      loadDeals();
    } catch (e) { console.error(e); }
  };

  const handleUpdateCompanyField = async (dealId: string, field: string, value: any) => {
    try {
      await axios.patch(`${API_URL}/crm/deals/${dealId}/company`, { [field]: value }, { headers });
    } catch (e) { console.error(e); }
  };

  const handleUpdateField = async (dealId: string, field: string, value: any) => {
    try {
      await axios.patch(`${API_URL}/crm/deals/${dealId}`, { [field]: value }, { headers });
      loadDeals();
      if (detailDeal?.id === dealId) {
        setDetailDeal({ ...detailDeal, [field]: value } as any);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (dealId: string, companyName: string) => {
    if (!confirm(`Удалить сделку "${companyName}"? Это действие необратимо.`)) return;
    try {
      await axios.delete(`${API_URL}/crm/deals/${dealId}`, { headers });
      loadDeals();
      if (showDetailModal && detailDeal?.id === dealId) setShowDetailModal(false);
    } catch (e) { alert('Ошибка при удалении'); console.error(e); }
  };

  const handleDragStart = (dealId: string) => setDraggedDeal(dealId);
  const handleDrop = async (stage: string) => {
    if (draggedDeal && stage) {
      await handleStageChange(draggedDeal, stage);
      setDraggedDeal(null);
    }
  };

  const getSourceLabel = (s: string) => DEAL_SOURCES.find(ds => ds.value === s)?.label || s;
  const getStageColor = (s: string) => CRM_STAGES.find(cs => cs.value === s)?.color || '#6c757d';
  const getStageIcon = (s: string) => CRM_STAGES.find(cs => cs.value === s)?.icon || '📋';

  const filteredDeals = deals.filter(d =>
    d.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.company?.contactPerson?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const grouped = CRM_STAGES.map(s => ({
    ...s,
    deals: filteredDeals.filter(d => d.stage === s.value),
  }));

  // Deal Detail Modal
  const openDetail = async (deal: Deal) => {
    setSelectedDeal(deal);
    await loadDealDetail(deal);
    setShowDetailModal(true);
  };

  const stageOrder = CRM_STAGES.map(s => s.value);

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>📊 Воронка продаж</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            placeholder="Поиск компании или контакта..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: 220 }}
          />
          <button onClick={() => setShowCreateModal(true)} style={{
            padding: '8px 16px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600
          }}>+ Создать сделку</button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Загрузка...</div> : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20, minHeight: '70vh' }}>
          {grouped.map(col => (
            <div key={col.value} style={{ minWidth: 260, maxWidth: 300, flex: 1 }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.value)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{col.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{col.label}</span>
                <span style={{ background: '#f0f0f0', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#666' }}>{col.deals.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.deals.map(deal => (
                  <div key={deal.id} draggable onDragStart={() => handleDragStart(deal.id)}
                    onClick={() => openDetail(deal)}
                    style={{
                      background: '#fff', borderRadius: 10, padding: 12, cursor: 'pointer',
                      border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      borderLeft: `3px solid ${col.color}`,
                      opacity: draggedDeal === deal.id ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{deal.company?.name}</div>
                    {deal.company?.contactPerson && (
                      <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>👤</span> {deal.company.contactPerson}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#888' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>{deal.estimatedAmount.toLocaleString()} ₽</span>
                      <span style={{ background: '#f0f8ff', padding: '1px 6px', borderRadius: 4, fontSize: 11, color: '#0056b3' }}>
                        {deal.probability}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
                      <span style={{ color: '#888' }}>{getSourceLabel(deal.source)}</span>
                      {deal.nextContactDate && (
                        <span style={{ color: '#fd7e14' }}>📅 {new Date(deal.nextContactDate).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                      👤 {deal.manager.firstName} {deal.manager.lastName}
                    </div>
                  </div>
                ))}
                {col.deals.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#ccc', fontSize: 12, border: '1px dashed #e0e0e0', borderRadius: 10 }}>
                    Перетащите сюда
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowCreateModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, minWidth: 380, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px' }}>➕ Новая сделка</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Компания</label>
                <select value={createForm.companyId} onChange={e => setCreateForm(f => ({ ...f, companyId: e.target.value }))} style={inputStyle}>
                  <option value="">Выберите компанию...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Источник</label>
                <select value={createForm.source} onChange={e => setCreateForm(f => ({ ...f, source: e.target.value }))} style={inputStyle}>
                  {DEAL_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Ответственный</label>
                <select value={createForm.managerId} onChange={e => setCreateForm(f => ({ ...f, managerId: e.target.value }))} style={inputStyle}>
                  <option value="">Текущий пользователь</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Предполагаемая сумма (₽)</label>
                <input placeholder="0" type="number" value={createForm.estimatedAmount} onChange={e => setCreateForm(f => ({ ...f, estimatedAmount: parseInt(e.target.value) || 0 }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Комментарий</label>
                <textarea placeholder="Дополнительная информация..." value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
              </div>
              <button onClick={handleCreate} style={{ padding: '10px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                Создать сделку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Detail Modal */}
      {showDetailModal && detailDeal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px 0' }}
          onClick={() => setShowDetailModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, minWidth: 480, maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                {getStageIcon(detailDeal.stage)} {detailDeal.company?.name}
              </h3>
              <button onClick={() => { if (confirm(`Удалить сделку "${detailDeal.company?.name}"?`)) { handleDelete(detailDeal.id, detailDeal.company?.name); } }} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, marginRight: 8 }}>🗑️ Удалить</button>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>×</button>
            </div>

            {/* Stage selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Этап воронки</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {CRM_STAGES.map(s => {
                  const currentIdx = stageOrder.indexOf(detailDeal.stage);
                  const sIdx = stageOrder.indexOf(s.value);
                  const isActive = s.value === detailDeal.stage;
                  const isPast = sIdx <= currentIdx;
                  return (
                    <button key={s.value} onClick={() => handleUpdateField(detailDeal.id, 'stage', s.value)}
                      style={{
                        padding: '4px 10px', border: `1px solid ${s.color}`, borderRadius: 6,
                        background: isActive ? s.color : isPast ? s.color + '15' : '#fff',
                        color: isActive ? '#fff' : s.color, fontSize: 11, cursor: 'pointer',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deal Info */}
            {/* Company info - editable */}
            <div style={{ marginBottom: 16, background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>🏢 Данные компании</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Контактное лицо</div>
                  <input value={detailDeal.company?.contactPerson || ''} onChange={e => setDetailDeal({ ...detailDeal, company: { ...detailDeal.company, contactPerson: e.target.value } } as any)}
                    onBlur={(e) => handleUpdateCompanyField(detailDeal.id, 'contactPerson', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Телефон</div>
                  <input value={(detailDeal as any).company?.phone || ''} onChange={e => setDetailDeal({ ...detailDeal, company: { ...detailDeal.company, phone: e.target.value } } as any)}
                    onBlur={(e) => handleUpdateCompanyField(detailDeal.id, 'phone', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Email</div>
                  <input value={detailDeal.company?.workEmail || ''} onChange={e => setDetailDeal({ ...detailDeal, company: { ...detailDeal.company, workEmail: e.target.value } } as any)}
                    onBlur={(e) => handleUpdateCompanyField(detailDeal.id, 'workEmail', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Сотрудников</div>
                  <input type="number" value={detailDeal.company?.peopleCount || ''} onChange={e => setDetailDeal({ ...detailDeal, company: { ...detailDeal.company, peopleCount: parseInt(e.target.value) || 0 } } as any)}
                    onBlur={(e) => handleUpdateCompanyField(detailDeal.id, 'peopleCount', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Адрес</div>
                  <input value={detailDeal.company?.address || ''} onChange={e => setDetailDeal({ ...detailDeal, company: { ...detailDeal.company, address: e.target.value } } as any)}
                    onBlur={(e) => handleUpdateCompanyField(detailDeal.id, 'address', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* Deal info fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <InfoField label="Сумма" value={`${detailDeal.estimatedAmount.toLocaleString()} ₽`} />
              <InfoField label="Вероятность" value={`${detailDeal.probability}%`} />
              <InfoField label="Источник" value={getSourceLabel(detailDeal.source)} />
              <InfoField label="Менеджер" value={`${detailDeal.manager.firstName} ${detailDeal.manager.lastName}`} />
              <InfoField label="Дата создания" value={new Date(detailDeal.createdAt).toLocaleDateString('ru-RU')} />
              <InfoField label="Обновлено" value={new Date(detailDeal.updatedAt).toLocaleDateString('ru-RU')} />
              {detailDeal.nextContactDate && (
                <InfoField label="След. контакт" value={new Date(detailDeal.nextContactDate).toLocaleDateString('ru-RU')} />
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Заметки</label>
              <div style={{ marginBottom: 8 }}><InfoField label="Мин. цена" value={`${detailDeal.estimatedAmount.toLocaleString()} ₽`} /></div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: "#666" }}>Мин. цена (₽): </label>
                <input type="number" value={detailDeal.minPrice || ''} onChange={e => handleUpdateField(detailDeal.id, 'minPrice', parseInt(e.target.value) || 0)} style={{ width: 100, fontSize: 12 }} />
                <label style={{ fontSize: 11, color: "#666", marginLeft: 8 }}>Макс. цена (₽): </label>
                <input type="number" value={detailDeal.maxPrice || ''} onChange={e => handleUpdateField(detailDeal.id, 'maxPrice', parseInt(e.target.value) || 0)} style={{ width: 100, fontSize: 12 }} />
                <label style={{ fontSize: 11, color: "#666", marginLeft: 8 }}>Раб. дней: </label>
                <input type="number" min="1" max="7" value={detailDeal.workDays || 5} onChange={e => handleUpdateField(detailDeal.id, 'workDays', parseInt(e.target.value) || 5)} style={{ width: 60, fontSize: 12 }} />
              </div>
              <textarea value={detailDeal.notes || ''} onChange={e => {
                setDetailDeal({ ...detailDeal, notes: e.target.value } as any);
              }}
                onBlur={(e) => {
                  if (e.target.value !== (selectedDeal?.notes || '')) {
                    handleUpdateField(detailDeal.id, 'notes', e.target.value);
                  }
                }}
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
            </div>

            {/* Next Contact Date */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Дата следующего контакта</label>
              <input type="date" value={detailDeal.nextContactDate?.slice(0, 10) || ''}
                onChange={e => {
                  const val = e.target.value || null;
                  handleUpdateField(detailDeal.id, 'nextContactDate', val);
                  setDetailDeal({ ...detailDeal, nextContactDate: val } as any);
                }}
                style={inputStyle} />
            </div>

            {/* Logs */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>📜 История изменений ({detailLogs.length})</label>
              {detailLogs.length === 0 ? (
                <div style={{ fontSize: 13, color: '#aaa', padding: 8 }}>Нет записей</div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detailLogs.map(log => (
                    <div key={log.id} style={{ padding: '8px 10px', background: '#f8f9fa', borderRadius: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 4 }}>
                        <span>{log.user?.firstName} {log.user?.lastName}</span>
                        <span>{new Date(log.createdAt).toLocaleString('ru-RU')}</span>
                      </div>
                      {log.comment && <div style={{ color: '#333' }}>{log.comment}</div>}
                      {log.oldValue && log.newValue && (
                        <div style={{ color: '#666', marginTop: 2 }}>
                          <span style={{ color: '#dc3545', textDecoration: 'line-through' }}>{log.oldValue}</span>
                          {' → '}
                          <span style={{ color: '#28a745' }}>{log.newValue}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit',
};
