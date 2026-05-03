import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, ROUTE_STATUSES } from './types';

interface RouteStop {
  id: string;
  orderId: string | null;
  company: { id: string; name: string; address: string | null };
  sequence: number;
  status: string;
  estimatedArrival: string | null;
  deliveredAt: string | null;
  notes: string | null;
}

interface Route {
  id: string;
  date: string;
  driverName: string;
  driverPhone: string | null;
  status: string;
  stops: RouteStop[];
  createdAt: string;
}

export default function CrmRoutes({ token }: Readonly<{ token: string; userRole?: string }>) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ driverName: '', driverPhone: '' });
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadRoutes(); }, [selectedDate]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/crm/routes?date=${selectedDate}`, { headers });
      setRoutes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newRoute.driverName) return;
    try {
      await axios.post(`${API_URL}/crm/routes`, {
        date: selectedDate,
        driverName: newRoute.driverName,
        driverPhone: newRoute.driverPhone || undefined,
      }, { headers });
      setShowCreateForm(false);
      setNewRoute({ driverName: '', driverPhone: '' });
      loadRoutes();
    } catch (e) { console.error(e); }
  };

  const handleGenerateToday = async (routeId: string) => {
    try {
      await axios.post(`${API_URL}/crm/routes/${routeId}/generate-today`, {}, { headers });
      loadRoutes();
    } catch (e) { console.error(e); }
  };

  const handleMarkDelivered = async (stopId: string) => {
    try {
      await axios.post(`${API_URL}/crm/routes/stops/${stopId}/deliver`, { deliveredAt: new Date().toISOString() }, { headers });
      loadRoutes();
    } catch (e) { console.error(e); }
  };

  const handleComplete = async (routeId: string) => {
    try {
      await axios.post(`${API_URL}/crm/routes/${routeId}/complete`, {}, { headers });
      loadRoutes();
    } catch (e) { console.error(e); }
  };

  const getStatusStyle = (s: string) => {
    const rs = ROUTE_STATUSES.find(rs => rs.value === s);
    return rs ? { color: rs.color, borderColor: rs.color } : {};
  };
  const getStatusLabel = (s: string) => ROUTE_STATUSES.find(rs => rs.value === s)?.label || s;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>🚚 Маршруты доставки</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
          <button onClick={() => setShowCreateForm(true)} style={{ padding: '6px 14px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            + Маршрут
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e9ecef' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Новый маршрут на {selectedDate}</h4>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="Имя водителя *" value={newRoute.driverName} onChange={e => setNewRoute(f => ({ ...f, driverName: e.target.value }))}
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
            <input placeholder="Телефон водителя" value={newRoute.driverPhone} onChange={e => setNewRoute(f => ({ ...f, driverPhone: e.target.value }))}
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
            <button onClick={handleCreate} style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Создать
            </button>
            <button onClick={() => setShowCreateForm(false)} style={{ padding: '8px 16px', background: '#f0f0f0', color: '#666', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Routes list */}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Загрузка...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routes.map(route => (
            <div key={route.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9ecef', overflow: 'hidden' }}>
              {/* Route header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8f9fa', cursor: 'pointer' }}
                onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{route.driverName}</span>
                  {route.driverPhone && <span style={{ fontSize: 13, color: '#888' }}>📞 {route.driverPhone}</span>}
                  <span style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: '1px solid', ...getStatusStyle(route.status) as any,
                    background: (getStatusStyle(route.status) as any).color + '15',
                  }}>
                    {getStatusLabel(route.status)}
                  </span>
                  <span style={{ fontSize: 13, color: '#888' }}>📍 {route.stops.length} точек</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {route.stops.length === 0 && (
                    <button onClick={(e) => { e.stopPropagation(); handleGenerateToday(route.id); }}
                      style={{ padding: '4px 10px', background: '#ffc107', color: '#333', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                      🚀 Сгенерировать из заказов
                    </button>
                  )}
                  {route.status !== 'COMPLETED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleComplete(route.id); }}
                      style={{ padding: '4px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                      ✅ Завершить
                    </button>
                  )}
                  <span style={{ color: '#999', fontSize: 13 }}>{expandedRoute === route.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Stops */}
              {expandedRoute === route.id && (
                <div style={{ padding: '8px 16px 16px' }}>
                  {route.stops.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                      Нет точек маршрута. Нажмите "Сгенерировать из заказов" для автозаполнения.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {route.stops.sort((a, b) => a.sequence - b.sequence).map(stop => (
                        <div key={stop.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: 8, background: stop.status === 'DELIVERED' ? '#f0fff4' : '#fff',
                          border: '1px solid', borderColor: stop.status === 'DELIVERED' ? '#b7eb8f' : '#e9ecef',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: stop.status === 'DELIVERED' ? '#28a745' : '#0d6efd',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                              {stop.sequence}
                            </span>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 14 }}>{stop.company.name}</div>
                              {stop.company.address && <div style={{ fontSize: 12, color: '#888' }}>📍 {stop.company.address}</div>}
                              {stop.estimatedArrival && (
                                <div style={{ fontSize: 12, color: '#888' }}>
                                  ⏰ {new Date(stop.estimatedArrival).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                              {stop.deliveredAt && (
                                <div style={{ fontSize: 12, color: '#28a745', fontWeight: 500 }}>
                                  ✅ Доставлено {new Date(stop.deliveredAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          </div>
                          {stop.status !== 'DELIVERED' && (
                            <button onClick={() => handleMarkDelivered(stop.id)}
                              style={{ padding: '6px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                              ✅ Доставлено
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regenerate button */}
                  {route.stops.length > 0 && (
                    <button onClick={() => handleGenerateToday(route.id)}
                      style={{ marginTop: 10, padding: '6px 12px', background: '#ffc107', color: '#333', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                      🔄 Перегенерировать
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {routes.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 14 }}>
              Нет маршрутов на {new Date(selectedDate).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
