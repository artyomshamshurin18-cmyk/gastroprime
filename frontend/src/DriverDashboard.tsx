import { useState } from 'react'
import AdminKitchenSummary from './AdminKitchenSummary'
import DriverRouteManagement from './DriverRouteManagement'
import DriverChat from './DriverChat'

const BRAND_LOGO_URL = 'https://static.tildacdn.com/tild6666-3335-4136-b866-376266373637/Group.svg'

export default function DriverDashboard({ user, token, onLogout }: { user: any, token: string, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'route' | 'chat'>('summary')

  return (
    <div className="gp-shell">
      <div className="gp-header">
        <div className="gp-brand">
          <img src={BRAND_LOGO_URL} alt="Gastroprime" />
          <div>
            <div className="gp-brand-subtitle">Кабинет водителя</div>
          </div>
        </div>
        <div className="gp-header-right">
          <span className="gp-top-pill">{user?.email}</span>
          <button onClick={onLogout} style={{ padding: '10px 16px', background: '#1c1a18', color: 'white', border: 'none', borderRadius: 12 }}>Выйти</button>
        </div>
      </div>
      <div className="gp-tabs">
        <div onClick={() => setActiveTab('summary')} className={`gp-tab ${activeTab === 'summary' ? 'gp-tab--active' : ''}`}>🍲 Сводка</div>
        <div onClick={() => setActiveTab('route')} className={`gp-tab ${activeTab === 'route' ? 'gp-tab--active' : ''}`}>📍 Маршрут</div>
        <div onClick={() => setActiveTab('chat')} className={`gp-tab ${activeTab === 'chat' ? 'gp-tab--active' : ''}`}>💬 Чат</div>
      </div>
      <div className="gp-content">
        {activeTab === 'summary' && <AdminKitchenSummary token={token} />}
        {activeTab === 'route' && <DriverRouteManagement token={token} />}
        {activeTab === 'chat' && <DriverChat token={token} user={user} />}
      </div>
    </div>
  )
}
