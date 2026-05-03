import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL, TASK_PRIORITIES, BOARD_STATUSES, parseLabels, serializeLabel } from './types';

interface CrmTask {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  userId?: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  priority?: string;
  dueDate?: string;
  boardStatus?: string;
  status?: string;
  createdAt: string;
  labels?: any;
  _count?: { comments?: number; attachments?: number; subtasks?: number };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface CrmTaskAttachment {
  id: string;
  taskId?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface CrmTaskComment {
  id: string;
  taskId: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  text: string;
  mention?: string[];
  createdAt: string;
  attachments?: CrmTaskAttachment[];
}

interface CrmTaskChecklist {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  sortOrder: number;
  items: CrmTaskChecklistItem[];
}

interface CrmTaskChecklistItem {
  id: string;
  checklistId: string;
  text: string;
  completed: boolean;
  assignedTo?: string;
  sortOrder: number;
}

const LABEL_PRESETS = [
  { name: 'Баг', color: '#dc3545' },
  { name: 'Фича', color: '#0d6efd' },
  { name: 'Улучшение', color: '#28a745' },
  { name: 'Дизайн', color: '#6f42c1' },
  { name: 'Документация', color: '#17a2b8' },
  { name: 'Срочно', color: '#fd7e14' },
];

const COLOR_PALETTE = ['#ed3915', '#0d6efd', '#28a745', '#fd7e14', '#6f42c1', '#e83e8c', '#20c997', '#17a2b8'];

export default function CrmTaskCard({ token, task, projectId, allUsers, employees, onClose, onUpdate }: {
  token: string;
  task: CrmTask;
  projectId?: string;
  allUsers: User[];
  employees: User[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [detail, setDetail] = useState<any>(task);
  const [comments, setComments] = useState<CrmTaskComment[]>([]);
  const [attachments, setAttachments] = useState<CrmTaskAttachment[]>([]);
  const [checklists, setChecklists] = useState<CrmTaskChecklist[]>([]);
  const [subtasks, setSubtasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#0d6efd');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadDetail();
    loadComments();
    loadAttachments();
    loadChecklists();
    loadSubtasks();
  }, [task.id]);

  const loadDetail = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/tasks/${task.id}`, { headers });
      setDetail(data);
    } catch (e) {
      setDetail(task);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/tasks/${task.id}/comments`, { headers });
      setComments(Array.isArray(data) ? data : data.comments || []);
    } catch (e) { /* skip */ }
  };

  const loadAttachments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/tasks/${task.id}/attachments`, { headers });
      setAttachments(Array.isArray(data) ? data : data.attachments || []);
    } catch (e) { /* skip */ }
  };

  const loadChecklists = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/tasks/${task.id}/checklists`, { headers });
      setChecklists(Array.isArray(data) ? data : data.checklists || []);
    } catch (e) { /* skip */ }
  };

  const loadSubtasks = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/tasks/${task.id}/subtasks`, { headers });
      const subs = Array.isArray(data) ? data : data.subtasks || [];
      setSubtasks(subs.map((s: any) => ({ id: s.id, text: s.title || s.text, completed: s.completed || s.status === 'COMPLETED' })));
    } catch (e) { /* skip */ }
  };

  const handleUpdate = async (field: string, value: any) => {
    try {
      await axios.patch(`${API_URL}/crm/tasks/${task.id}`, { [field]: value }, { headers });
      setDetail((prev: any) => ({ ...prev, [field]: value }));
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`${API_URL}/crm/tasks/${task.id}/comments`, { text: commentText }, { headers });
      setCommentText('');
      loadComments();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API_URL}/crm/tasks/${task.id}/attachments`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      loadAttachments();
      onUpdate();
    } catch (e) { console.error(e); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/crm/tasks/${task.id}/checklists`, { title: newChecklistTitle }, { headers });
      setNewChecklistTitle('');
      setShowChecklistForm(false);
      loadChecklists();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleAddChecklistItem = async (checklistId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API_URL}/crm/tasks/${task.id}/checklists/${checklistId}/items`, { text }, { headers });
      loadChecklists();
    } catch (e) { console.error(e); }
  };

  const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
    try {
      const listId = checklists.find(cl => cl.items.some(i => i.id === itemId))?.id;
      if (!listId) return;
      await axios.patch(`${API_URL}/crm/tasks/${task.id}/checklists/${listId}/items/${itemId}`, { completed }, { headers });
      loadChecklists();
    } catch (e) { console.error(e); }
  };

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      await axios.post(`${API_URL}/crm/tasks/${task.id}/labels`, { name: newLabelName, color: newLabelColor }, { headers });
      setNewLabelName('');
      setNewLabelColor('#0d6efd');
      setShowLabelForm(false);
      loadDetail();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleRemoveLabel = async (labelId: string) => {
    try {
      await axios.delete(`${API_URL}/crm/tasks/${task.id}/labels/${encodeURIComponent(labelId)}`, { headers });
      loadDetail();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim()) return;
    try {
      await axios.post(`${API_URL}/crm/tasks/${task.id}/subtasks`, { title: newSubtaskText }, { headers });
      setNewSubtaskText('');
      setShowSubtaskForm(false);
      loadSubtasks();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await axios.patch(`${API_URL}/crm/tasks/${task.id}/subtasks/${subtaskId}`, { completed }, { headers });
      loadSubtasks();
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await axios.delete(`${API_URL}/crm/tasks/${task.id}/attachments/${attachmentId}`, { headers });
      loadAttachments();
    } catch (e) { console.error(e); }
  };

  const parsedLabels = parseLabels(detail.labels);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px 0' }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 520, maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {BOARD_STATUSES.map(bs => (
                <button key={bs.value} onClick={() => handleUpdate('boardStatus', bs.value)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: `1px solid ${bs.color}`, fontSize: 11,
                    background: (detail.boardStatus || 'TODO') === bs.value ? bs.color : 'transparent',
                    color: (detail.boardStatus || 'TODO') === bs.value ? '#fff' : bs.color,
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                  {bs.icon} {bs.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999', padding: '0 4px' }}>×</button>
        </div>

        {loading ? <div style={{ padding: 30, textAlign: 'center', color: '#999' }}>Загрузка...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title & Description */}
            <div>
              <input value={detail.title || ''} onChange={e => setDetail((p: any) => ({ ...p, title: e.target.value }))}
                onBlur={e => handleUpdate('title', e.target.value)}
                style={{ fontSize: 18, fontWeight: 700, border: 'none', outline: 'none', width: '100%', padding: '4px 0' }} />
              <textarea value={detail.description || ''} onChange={e => setDetail((p: any) => ({ ...p, description: e.target.value }))}
                onBlur={e => handleUpdate('description', e.target.value)}
                placeholder="Добавьте описание..."
                style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', minHeight: 50, fontSize: 13, color: '#555', marginTop: 6, fontFamily: 'inherit' }} />
            </div>

            {/* Fields row */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Приоритет</div>
                <select value={detail.priority || 'NORMAL'} onChange={e => handleUpdate('priority', e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }}>
                  {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Исполнитель</div>
                <select value={detail.userId || ''} onChange={e => handleUpdate('userId', e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }}>
                  <option value="">Не назначен</option>
                  {employees.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Дедлайн</div>
                <input type="date" value={detail.dueDate?.slice(0, 10) || ''}
                  onChange={e => handleUpdate('dueDate', e.target.value || null)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
              </div>
            </div>

            {/* Labels */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>🏷️ Метки</span>
                <button onClick={() => setShowLabelForm(!showLabelForm)}
                  style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: 12 }}>
                  + добавить
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {parsedLabels.map((l: any) => (
                  <span key={l.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, padding: '2px 8px', borderRadius: 6,
                    background: (l.color || '#6c757d') + '22', color: l.color || '#6c757d', border: `1px solid ${(l.color || '#6c757d') + '44'}`,
                  }}>
                    {l.name}
                    <span onClick={() => handleRemoveLabel(l.id)} style={{ cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</span>
                  </span>
                ))}
                {parsedLabels.length === 0 && <span style={{ fontSize: 12, color: '#aaa' }}>Нет меток</span>}
              </div>
              {showLabelForm && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input placeholder="Название метки" value={newLabelName} onChange={e => setNewLabelName(e.target.value)}
                    style={{ flex: 1, minWidth: 120, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                  <select value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }}>
                    {COLOR_PALETTE.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {LABEL_PRESETS.map(lp => (
                      <button key={lp.name} onClick={() => { setNewLabelName(lp.name); setNewLabelColor(lp.color); }}
                        style={{ padding: '2px 6px', fontSize: 10, border: '1px solid #ddd', borderRadius: 4, background: 'white', cursor: 'pointer' }}>
                        {lp.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleAddLabel}
                    style={{ padding: '6px 12px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                    Добавить
                  </button>
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>📋 Подзадачи</span>
                <span style={{ fontSize: 12, color: '#888' }}>{subtasks.filter(s => s.completed).length}/{subtasks.length}</span>
                <button onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                  style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: 12 }}>
                  + добавить
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {subtasks.map(st => (
                  <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '3px 0' }}>
                    <input type="checkbox" checked={st.completed} onChange={e => handleToggleSubtask(st.id, e.target.checked)} />
                    <span style={{ fontSize: 13, textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? '#888' : '#333' }}>
                      {st.text}
                    </span>
                  </label>
                ))}
                {subtasks.length === 0 && <span style={{ fontSize: 12, color: '#aaa' }}>Нет подзадач</span>}
              </div>
              {showSubtaskForm && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <input placeholder="Название подзадачи" value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                  <button onClick={handleAddSubtask}
                    style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                    Добавить
                  </button>
                </div>
              )}
            </div>

            {/* Checklists */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>✅ Чек-листы</span>
                <button onClick={() => setShowChecklistForm(!showChecklistForm)}
                  style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: 12 }}>
                  + добавить
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checklists.map(cl => {
                  const doneCount = cl.items?.filter(i => i.completed).length || 0;
                  const totalCount = cl.items?.length || 0;
                  return (
                    <div key={cl.id} style={{ background: '#f8f9fa', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cl.title}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>{doneCount}/{totalCount}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {(cl.items || []).sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '2px 0' }}>
                            <input type="checkbox" checked={item.completed} onChange={e => handleToggleChecklistItem(item.id, e.target.checked)} />
                            <span style={{ fontSize: 13, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#888' : '#333' }}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                      <ChecklistItemInput checklistId={cl.id} onAdd={handleAddChecklistItem} />
                    </div>
                  );
                })}
              </div>
              {showChecklistForm && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <input placeholder="Название чек-листа" value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddChecklist(); }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                  <button onClick={handleAddChecklist}
                    style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                    Создать
                  </button>
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>📎 Вложения</span>
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: 12 }}>
                  + загрузить
                </button>
                <input ref={fileInputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {attachments.map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                    background: '#f8f9fa', borderRadius: 8, fontSize: 12, border: '1px solid #e9ecef',
                  }}>
                    <span>{a.fileName}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>
                      {(a.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'none', fontSize: 11 }}>⬇️</a>
                    <span onClick={() => handleDeleteAttachment(a.id)} style={{ cursor: 'pointer', color: '#dc3545', fontSize: 14 }}>×</span>
                  </div>
                ))}
                {attachments.length === 0 && <span style={{ fontSize: 12, color: '#aaa' }}>Нет вложений</span>}
              </div>
            </div>

            {/* Comments */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>💬 Комментарии ({comments.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, maxHeight: 240, overflowY: 'auto' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ padding: '10px 12px', background: '#f8f9fa', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#888' }}>
                      <span style={{ fontWeight: 600, color: '#555' }}>
                        {c.user?.firstName || '?'} {c.user?.lastName || ''}
                      </span>
                      <span>{new Date(c.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{c.text}</div>
                    {c.attachments && c.attachments.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {c.attachments.map(att => (
                          <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: '#0056b3', padding: '2px 6px', background: '#fff', borderRadius: 4, border: '1px solid #e9ecef' }}>
                            📎 {att.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && <span style={{ fontSize: 12, color: '#aaa' }}>Нет комментариев</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Напишите комментарий..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, minHeight: 36, resize: 'vertical', fontFamily: 'inherit' }} />
                <button onClick={handleAddComment}
                  style={{ padding: '8px 14px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-end' }}>
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItemInput({ checklistId, onAdd }: { checklistId: string; onAdd: (checklistId: string, text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <input placeholder="+ пункт" value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { onAdd(checklistId, text); setText(''); } }}
        style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
      <button onClick={() => { if (text.trim()) { onAdd(checklistId, text); setText(''); } }}
        style={{ padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
        +
      </button>
    </div>
  );
}
