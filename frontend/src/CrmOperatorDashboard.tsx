import { useState } from 'react'
import CrmMain from './crm/CrmMain'

const BRAND_LOGO_URL = 'https://static.tildacdn.com/tild6666-3335-4136-b866-376266373637/Group.svg'

function CrmOperatorDashboard({ user, token, onLogout }: { user: any, token: string, onLogout: () => void }) {
  const [activeTab] = useState<'crm'>('crm')

  return (
    <div className="gp-shell">
      <div className="gp-header">
        <div className="gp-brand">
          <img src={BRAND_LOGO_URL} alt="Gastroprime" />
          <div>
            <div className="gp-brand-subtitle">CRM-оператор</div>
          </div>
        </div>
        <div className="gp-header-right">
          <span className="gp-top-pill">{user?.email}</span>
          <button onClick={onLogout} style={{ padding: '10px 16px', background: '#1c1a18', color: 'white', border: 'none', borderRadius: 12 }}>Выйти</button>
        </div>
      </div>
      <div className="gp-content">
        {activeTab === 'crm' && <CrmMain token={token} userRole={user.role} />}
      </div>
    </div>
  )
}

export default CrmOperatorDashboard
