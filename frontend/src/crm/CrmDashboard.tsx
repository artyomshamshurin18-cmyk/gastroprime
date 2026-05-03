import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, CRM_STAGES } from './types';

interface DashboardOverview {
  totalDeals: number;
  totalAmount: number;
  dealsByStage: { stage: string; count: number; amount: number }[];
  todayTasks: number;
  todayCompletedTasks: number;
  todayRoutes: number;
  recentDeals: any[];
  upcomingTasks: any[];
}

export default function CrmDashboard({ token }: { token: string; userRole?: string }) {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/crm/dashboard/overview`, { headers });
      setOverview(data);
    } catch (e) {
      console.error(e);
      loadManualDashboard();
    }
    finally { setLoading(false); }
  };

  const loadManualDashboard = async () => {
    try {
      const [dealsRes, tasksRes, routesRes] = await Promise.all([
        axios.get(`${API_URL}/crm/deals?limit=500`, { headers }),
        axios.get(`${API_URL}/crm/tasks?status=PENDING`, { headers }),
        axios.get(`${API_URL}/crm/routes?date=${new Date().toISOString().slice(0, 10)}`, { headers }),
      ]);
      const deals = Array.isArray(dealsRes.data) ? dealsRes.data : dealsRes.data.deals || [];
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const routes = Array.isArray(routesRes.data) ? routesRes.data : [];

      const totalAmount = deals.reduce((sum: number, d: any) => sum + (d.estimatedAmount || 0), 0);
      const byStage = CRM_STAGES.map(s => ({
        stage: s.value,
        count: deals.filter((d: any) => d.stage === s.value).length,
        amount: deals.filter((d: any) => d.stage === s.value).reduce((sum: number, d: any) => sum + (d.estimatedAmount || 0), 0),
      }));

      setOverview({
        totalDeals: deals.length,
        totalAmount,
        dealsByStage: byStage,
        todayTasks: tasks.length,
        todayCompletedTasks: 0,
        todayRoutes: routes.length,
        recentDeals: deals.slice(0, 10),
        upcomingTasks: tasks.slice(0, 10),
      });
    } catch (e2) { console.error(e2); }
  };

  const todayStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 14 }}>Загрузка...</div>;
  if (!overview) return <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 14 }}>Нет данных</div>;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>📊 Дашборд CRM</h2>
        <span style={{ fontSize: 13, color: '#888' }}>{todayStr}</span>
      </div>

      {/* KPI Cards — mobile-friendly grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KPICard icon="💼" label="Всего сделок" value={(overview.totalDeals || 0).toString()} />
        <KPICard icon="💰" label="Общая сумма" value={`${(overview.totalAmount || 0).toLocaleString()} ₽`} />
        <KPICard icon="📋" label="Задачи сегодня" value={(overview.todayTasks || 0).toString()} sub={`Вып.: ${overview.todayCompletedTasks || 0}`} />
        <KPICard icon="🚚" label="Маршруты сегодня" value={(overview.todayRoutes || 0).toString()} />
      </div>

      {/* Sales funnel — wrap columns on mobile */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '12px 10px', border: '1px solid #e9ecef', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, margin: '0 0 10px' }}>📈 Воронка продаж</h3>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
          {CRM_STAGES.map((stage) => {
            const stageData = overview.dealsByStage?.find(ds => ds.stage === stage.value) || { count: 0, amount: 0 };
            const maxCount = Math.max(...(overview.dealsByStage?.map(ds => ds.count) || [1]), 1);
            const pct = maxCount > 0 ? (stageData.count / maxCount) * 100 : 5;
            return (
              <div key={stage.value} style={{ flex: '0 0 70px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{stage.icon}</div>
                <div style={{ margin: '4px 0', height: 100, background: '#f5f5f5', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${Math.max(pct, 5)}%`,
                    background: stage.color,
                    borderRadius: 8,
                    transition: 'height 0.3s',
                    opacity: 0.8,
                    minHeight: 20,
                  }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                      {stageData.count}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.2 }}>{stage.label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{(stageData.amount || 0).toLocaleString()} ₽</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent deals + upcoming tasks — stack on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e9ecef' }}>
          <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>🆕 Последние сделки</h3>
          {overview.recentDeals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {overview.recentDeals.slice(0, 6).map((deal: any) => (
                <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{deal.company?.name}</span>
                  <span style={{ color: '#888', flexShrink: 0, marginLeft: 8 }}>
                    {((deal.estimatedAmount || 0)).toLocaleString()} ₽
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#aaa', fontSize: 13 }}>Нет данных</div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e9ecef' }}>
          <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>⏰ Предстоящие задачи</h3>
          {overview.upcomingTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {overview.upcomingTasks.slice(0, 6).map((task: any) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12, gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{task.title}</span>
                    {task.dueDate && (
                      <span style={{ color: new Date(task.dueDate) < new Date() ? '#dc3545' : '#888', marginLeft: 6, fontSize: 11 }}>
                        {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  {task.user?.firstName && <span style={{ color: '#888', flexShrink: 0 }}>{task.user.firstName}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#aaa', fontSize: 13 }}>Нет активных задач</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e9ecef' }}>
      <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}
