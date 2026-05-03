import pathlib

content = pathlib.Path('/root/gastroprime/frontend/src/PortalLoginExperience.tsx').read_text()

# Replace function signature to add useState import and showRegister state
old_func = '''export default function PortalLoginExperience({
  brandLogoUrl,
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: {
  brandLogoUrl: string
  email: string
  password: string
  error: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
}) {'''

new_func = '''import { useState } from 'react'

export default function PortalLoginExperience({
  brandLogoUrl,
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: {
  brandLogoUrl: string
  email: string
  password: string
  error: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
}) {
  const [showRegister, setShowRegister] = useState(false)'''

content = content.replace(old_func, new_func)

# Replace the login shell
old_shell = '''          <div className="gp-landing-login-shell">
            <div className="gp-card gp-login-card gp-login-card--landing">
              <div className="gp-login-card__badge">\u0412\u0445\u043e\u0434 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443</div>
              <h2 className="gp-login-title">\u0415\u0434\u0438\u043d\u044b\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442 \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u043f\u0438\u0442\u0430\u043d\u0438\u044f</h2>
              <p className="gp-login-subtitle">\u0414\u043b\u044f \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432, \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u043e\u0432 \u0438 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u043e\u0432 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438.</p>
              {error && <div className="gp-login-error">{error}</div>}
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>\u041f\u0430\u0440\u043e\u043b\u044c</label>
                  <input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
                </div>
                <button className="gp-btn gp-btn--primary gp-btn--full" onClick={onLogin} disabled={loading}>
                  {loading ? '\u0412\u0445\u043e\u0434...' : '\u0412\u043e\u0439\u0442\u0438'}
                </button>
              </div>
              <div className="gp-login-mini-features">
                <div>\u2022 \u041f\u043b\u0430\u043d\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e \u0438 \u0437\u0430\u044f\u0432\u043a\u0438</div>
                <div>\u2022 \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u043f\u043e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
                <div>\u2022 \u0421\u0447\u0435\u0442\u0430, \u043b\u0438\u043c\u0438\u0442\u044b \u0438 \u0441\u0432\u0435\u0440\u043a\u0430</div>
              </div>
            </div>
          </div>'''

new_shell = '''          <div className="gp-landing-login-shell">
            {showRegister ? (
              <div className="gp-card gp-login-card gp-login-card--landing" style={{ minHeight: 420 }}>
                <div style={{ textAlign: 'right', marginBottom: 4 }}>
                  <button
                    onClick={() => setShowRegister(false)}
                    style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  >
                    \u2190 \u0412\u0445\u043e\u0434
                  </button>
                </div>
                <div className="gp-login-card__badge">\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
                <h2 className="gp-login-title">\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e</h2>
                <p className="gp-login-subtitle">\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e \u0438 \u0441\u0442\u0430\u043d\u044c\u0442\u0435 \u0435\u0451 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u043e\u043c.</p>
                {error && <div className="gp-login-error">{error}</div>}
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Email *</label>
                    <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u041f\u0430\u0440\u043e\u043b\u044c *</label>
                    <input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} required minLength={6} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 *</label>
                    <input type="text" required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u0412\u0430\u0448\u0435 \u0438\u043c\u044f</label>
                    <input type="text" />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>\u0422\u0435\u043b\u0435\u0444\u043e\u043d</label>
                    <input type="tel" />
                  </div>
                  <button className="gp-btn gp-btn--primary gp-btn--full" onClick={() => {}}>
                    \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e
                  </button>
                </div>
                <div className="gp-login-mini-features" style={{ marginTop: 12 }}>
                  <div>\u2022 \u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
                  <div>\u2022 \u0420\u043e\u043b\u044c \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u0430 \u0441 \u043f\u043e\u043b\u043d\u044b\u043c \u0434\u043e\u0441\u0442\u0443\u043f\u043e\u043c</div>
                  <div>\u2022 \u041c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432</div>
                </div>
              </div>
            ) : (
              <div className="gp-card gp-login-card gp-login-card--landing">
                <div className="gp-login-card__badge">\u0412\u0445\u043e\u0434 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443</div>
                <h2 className="gp-login-title">\u0415\u0434\u0438\u043d\u044b\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442 \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u043f\u0438\u0442\u0430\u043d\u0438\u044f</h2>
                <p className="gp-login-subtitle">\u0414\u043b\u044f \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432, \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u043e\u0432 \u0438 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u043e\u0432 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438.</p>
                {error && <div className="gp-login-error">{error}</div>}
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                    <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>\u041f\u0430\u0440\u043e\u043b\u044c</label>
                    <input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
                  </div>
                  <button className="gp-btn gp-btn--primary gp-btn--full" onClick={onLogin} disabled={loading}>
                    {loading ? '\u0412\u0445\u043e\u0434...' : '\u0412\u043e\u0439\u0442\u0438'}
                  </button>
                </div>
                <div className="gp-login-mini-features">
                  <div>\u2022 \u041f\u043b\u0430\u043d\u043e\u0432\u043e\u0435 \u043c\u0435\u043d\u044e \u0438 \u0437\u0430\u044f\u0432\u043a\u0438</div>
                  <div>\u2022 \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u043f\u043e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</div>
                  <div>\u2022 \u0421\u0447\u0435\u0442\u0430, \u043b\u0438\u043c\u0438\u0442\u044b \u0438 \u0441\u0432\u0435\u0440\u043a\u0430</div>
                </div>
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              {showRegister ? (
                <button
                  onClick={() => setShowRegister(false)}
                  style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  \u041d\u0430\u0437\u0430\u0434 \u043a\u043e \u0432\u0445\u043e\u0434\u0443
                </button>
              ) : (
                <button
                  onClick={() => { setShowRegister(true); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e
                </button>
              )}
            </div>
          </div>'''

content = content.replace(old_shell, new_shell)

pathlib.Path('/root/gastroprime/frontend/src/PortalLoginExperience.tsx').write_text(content)
print('Done')
