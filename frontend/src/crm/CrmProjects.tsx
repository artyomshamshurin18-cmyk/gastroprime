import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, PROJECT_STATUSES, BOARD_STATUSES } from './types';
import CrmProjectDetail from './CrmProjectDetail';

interface CrmProject {
  id: string;
  name: string;
  description?: string;
  companyId?: string;
  dealId?: string;
  status: string;
  color?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; name: string };
  members?: { id: string; userId: string; user?: { id: string; firstName: string; lastName: string; email: string } }[];
  tasks?: any[];
  _count?: { tasks: number; members: number };
}

interface Company { id: string; name: string; }
interface Deal { id: string; company?: { name: string }; }

const COLORS = ['#ed3915', '#0d6efd', '#28a745', '#fd7e14', '#6f42c1', '#e83e8c', '#20c997', '#ffc107'];

const FILTER_TABS = [
  { value: '', label: 'Все', icon: '📋' },
  { value: 'ACTIVE', label: 'Активные', icon: '🟢' },
  { value: 'COMPLETED', label: 'Завершённые', icon: '🏁' },
  { value: 'ARCHIVED', label: 'Архив', icon: '📦' },
];

export default function CrmProjects({ token }: { token: string; userRole?: string }) {
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CrmProject | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', companyId: '', dealId: '', color: COLORS[0], endDate: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadCompanies(); loadDeals(); }, []);

  const loadProjects = async (status?: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (status && status !== '') {
        params.status = status;
      }
      const { data } = await axios.get(`${API_URL}/crm/projects`, { headers, params });
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadProjects(statusTab);
  }, [statusTab]);

  const loadCompanies = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/companies?limit=500`, { headers });
      setCompanies(res.data.companies?.map((c: any) => ({ id: c.id, name: c.name })) || []);
    } catch (e) { /* skip */ }
  };

  const loadDeals = async () => {
    try {
      const res = await axios.get(`${API_URL}/crm/deals?limit=500`, { headers });
      const d = Array.isArray(res.data) ? res.data : res.data.deals || [];
      setDeals(d.map((deal: any) => ({ id: deal.id, company: { name: deal.company?.name || '?' } })));
    } catch (e) { /* skip */ }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      const payload: any = { name: form.name };
      if (form.description) payload.description = form.description;
      if (form.companyId) payload.companyId = form.companyId;
      if (form.dealId) payload.dealId = form.dealId;
      if (form.color) payload.color = form.color;
      if (form.endDate) payload.endDate = form.endDate;
      await axios.post(`${API_URL}/crm/projects`, payload, { headers });
      setShowCreate(false);
      setForm({ name: '', description: '', companyId: '', dealId: '', color: COLORS[0], endDate: '' });
      loadProjects(statusTab);
    } catch (e) { console.error(e); }
  };

  const getStatusInfo = (s: string) => PROJECT_STATUSES.find(p => p.value === s) || { value: s, label: s, color: '#6c757d', icon: '📋' };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  ).slice(0, 20);

  const filteredProjects = projects.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEndDateInfo = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;
    return { diffDays, isOverdue, endDateStr: end.toLocaleDateString('ru-RU') };
  };

  if (selectedProject) {
    return (
      <CrmProjectDetail
        token={token}
        projectId={selectedProject.id}
        onBack={() => setSelectedProject(null)}
        onUpdate={() => loadProjects(statusTab)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>📁 Проекты</h2>
        <button onClick={() => setShowCreate(true)}
          style={{ padding: '6px 14px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Создать проект
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="🔍 Поиск проектов..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13,
            width: '100%', maxWidth: 360, boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.value} onClick={() => setStatusTab(tab.value)}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13,
              fontWeight: statusTab === tab.value ? 600 : 400,
              background: statusTab === tab.value ? '#0056b3' : '#f0f0f0',
              color: statusTab === tab.value ? '#fff' : '#555',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            <span>{tab.icon}</span> {tab.label}
            {tab.value === '' && <span style={{ background: statusTab === '' ? 'rgba(255,255,255,0.2)' : '#ddd', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 2 }}>{projects.length}</span>}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Загрузка...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredProjects.map(proj => {
            const st = getStatusInfo(proj.status);
            const endInfo = getEndDateInfo(proj.endDate);
            const isArchivedOrCompleted = proj.status === 'ARCHIVED' || proj.status === 'COMPLETED';
            return (
              <div key={proj.id} onClick={() => setSelectedProject(proj)}
                style={{
                  background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e9ecef',
                  borderLeft: `4px solid ${proj.color || '#0d6efd'}`, cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                  opacity: isArchivedOrCompleted ? 0.65 : 1,
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{proj.name}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                      background: st.color + '18', color: st.color, border: `1px solid ${st.color}40`,
                    }}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 500 }}>
                      {proj.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#aaa', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>👥 {proj._count?.members ?? 0} участников</span>
                    <span>✅ {proj._count?.tasks ?? 0} задач</span>
                    <span>📅 {new Date(proj.createdAt).toLocaleDateString('ru-RU')}</span>
                    {proj.company && (
                      <span style={{ color: '#0d6efd' }}>🏢 {proj.company.name}</span>
                    )}
                    {endInfo && (
                      <span style={{
                        color: endInfo.isOverdue ? '#dc3545' : '#888',
                        fontWeight: endInfo.isOverdue ? 600 : 400,
                      }}>
                        📅 Дедлайн: {endInfo.endDateStr}
                        {endInfo.isOverdue ? ` (просрочено на ${Math.abs(endInfo.diffDays)} дн.)` : ` (осталось ${endInfo.diffDays} дн.)`}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: '#ccc', fontSize: 18 }}>›</span>
              </div>
            );
          })}
          {filteredProjects.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 14 }}>
              {searchQuery ? 'Ничего не найдено' : 'Нет проектов. Создайте первый проект!'}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowCreate(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, minWidth: 440, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>➕ Создать проект</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Название *</label>
                <input placeholder="Название проекта" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputS} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Описание</label>
                <textarea placeholder="Описание проекта" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputS, minHeight: 60, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Дата завершения (опционально)</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputS} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Компания (опционально)</label>
                <input placeholder="Поиск компании..." value={companySearch} onChange={e => {
                  setCompanySearch(e.target.value);
                  setForm(f => ({ ...f, companyId: '', dealId: '' }));
                }} style={inputS} />
                {companySearch && (
                  <div style={{ marginTop: 4, maxHeight: 140, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
                    {filteredCompanies.map(c => (
                      <div key={c.id} onClick={() => { setForm(f => ({ ...f, companyId: c.id })); setCompanySearch(c.name); }}
                        style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 13, background: form.companyId === c.id ? '#f0f7ff' : 'transparent' }}>
                        {c.name}
                      </div>
                    ))}
                    {filteredCompanies.length === 0 && <div style={{ padding: 8, fontSize: 12, color: '#999' }}>Не найдено</div>}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Сделка (опционально)</label>
                <select value={form.dealId} onChange={e => setForm(f => ({ ...f, dealId: e.target.value }))} style={inputS}>
                  <option value="">Не привязана</option>
                  {deals.filter(d => !form.companyId || d.id === form.dealId).map(d => (
                    <option key={d.id} value={d.id}>{d.company?.name || '?'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Цвет</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: form.color === c ? '3px solid #333' : '3px solid transparent',
                      }} />
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} style={{ padding: '10px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 4 }}>
                Создать проект
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputS: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit',
};
