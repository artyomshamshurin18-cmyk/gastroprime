content = """import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'

export default function PortalRegisterForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !companyName) {
      setError('Email, пароль и название компании обязательны')
      return
    }
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(API_URL + '/auth/register', {
        email,
        password,
        companyName,
        firstName: firstName || undefined,
        phone: phone || undefined,
      })
      const token = response.data.access_token || response.data.token
      const user = response.data.user
      if (!token || !user) {
        setError('\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438: \u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445')
        return
      }
      localStorage.setItem('gp-auth-token', token)
      localStorage.setItem('gp-auth-user', JSON.stringify(user))
      setSuccess(true)
      if (onSuccess) onSuccess()
      window.location.reload()
    } catch (err: any) {
      setError(err.response?.data?.message || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#2e7d32', fontWeight: 600 }}>\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0443\u0441\u043f\u0435\u0448\u043d\u0430! \u041f\u0435\u0440\u0435\u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c...</div>
  }

  return (
    <div className="gp-card gp-login-card gp-login-card--landing" style={{ minHeight: 420 }}>
      <div className="gp-login-card__badge">\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
      <h2 className="gp-login-title">\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e</h2>
      <p className="gp-login-subtitle">\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e \u0438 \u0441\u0442\u0430\u043d\u044c\u0442\u0435 \u0435\u0451 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u043e\u043c.</p>
      {error && <div className="gp-login-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u041f\u0430\u0440\u043e\u043b\u044c *</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 *</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u0412\u0430\u0448\u0435 \u0438\u043c\u044f</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u0422\u0435\u043b\u0435\u0444\u043e\u043d</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="gp-btn gp-btn--primary gp-btn--full" disabled={loading}>
          {loading ? '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f...' : '\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e'}
        </button>
      </form>
      <div className="gp-login-mini-features" style={{ marginTop: 12 }}>
        <div>\u2022 \u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
        <div>\u2022 \u0420\u043e\u043b\u044c \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u0430 \u0441 \u043f\u043e\u043b\u043d\u044b\u043c \u0434\u043e\u0441\u0442\u0443\u043f\u043e\u043c</div>
        <div>\u2022 \u041c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432</div>
      </div>
    </div>
  )
}
"""

import pathlib
pathlib.Path('/root/gastroprime/frontend/src/PortalRegisterForm.tsx').write_text(content)
print('Written')
