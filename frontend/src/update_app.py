import re

with open('/root/gastroprime/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Add import for PortalRegisterForm
if 'import PortalRegisterForm' not in content:
    imp_line = "import PortalLoginExperience from './PortalLoginExperience'"
    imp_pos = content.find(imp_line)
    imp_eol = content.find('\n', imp_pos) + 1
    content = content[:imp_eol] + "import PortalRegisterForm from './PortalRegisterForm'\n" + content[imp_eol:]

# Find Login function
idx_start = content.find('function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {')
idx_end = content.find('\nfunction ClientDashboard(', idx_start)

old_login = content[idx_start:idx_end]

new_login = """function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleLogin = async () => {
    console.log('Login clicked', email)
    if (!email || !password) {
      setError('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email \u0438 \u043f\u0430\u0440\u043e\u043b\u044c')
      return
    }
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(\x60${API_URL}/auth/login\x60, { email, password })
      console.log('Response:', response.data)
      const token = response.data.access_token || response.data.token
      const user = response.data.user
      if (!token || !user) {
        setError('\u041e\u0448\u0438\u0431\u043a\u0430: \u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f')
        return
      }
      onLogin(token, user)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.response?.data?.message || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u0445\u043e\u0434\u0430')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gp-landing">
      <section className="gp-landing-hero">
        <div className="gp-landing-hero__bg" />
        <div className="gp-landing-topbar">
          <div className="gp-brand">
            <img src={BRAND_LOGO_URL} alt="Gastroprime" />
            <div className="gp-brand-subtitle gp-brand-subtitle--hero">\u041f\u043e\u0440\u0442\u0430\u043b \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u043f\u0438\u0442\u0430\u043d\u0438\u044f</div>
          </div>
          <div className="gp-landing-topbar__badges">
            <span className="gp-top-pill">\u0414\u043b\u044f HR, office \u0438 admin</span>
          </div>
        </div>

        <div className="gp-landing-grid">
          <div className="gp-landing-copy">
            <div className="gp-landing-kicker">\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0435 \u043f\u0438\u0442\u0430\u043d\u0438\u0435 \u0431\u0435\u0437 \u0447\u0430\u0442\u043e\u0432, Excel \u0438 \u043f\u043e\u0442\u0435\u0440\u044c</div>
            <h1 className="gp-landing-title">\u0421\u0438\u043b\u044c\u043d\u044b\u0439 B2B-\u043f\u043e\u0440\u0442\u0430\u043b, \u0433\u0434\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438 \u0431\u044b\u0441\u0442\u0440\u043e \u0432\u044b\u0431\u0438\u0440\u0430\u044e\u0442 \u043f\u0438\u0442\u0430\u043d\u0438\u0435, \u0430 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0438\u0440\u0443\u0435\u0442 \u0437\u0430\u044f\u0432\u043a\u0438, \u0431\u044e\u0434\u0436\u0435\u0442 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f.</h1>
            <p className="gp-landing-lead">
              \u041e\u0434\u0438\u043d \u043a\u0430\u0431\u0438\u043d\u0435\u0442 \u0434\u043b\u044f \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432, \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u043e\u0440\u0430 \u0438 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430. \u041c\u0435\u043d\u044c\u0448\u0435 \u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0446\u0438\u0438, \u043c\u0435\u043d\u044c\u0448\u0435 \u043e\u0448\u0438\u0431\u043e\u043a, \u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u043e\u0441\u0442\u0438 \u043f\u043e \u043b\u0438\u043c\u0438\u0442\u0430\u043c, \u0441\u0447\u0435\u0442\u0430\u043c, \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u043c \u0438 \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u043e\u043c\u0443 \u0441\u043f\u0440\u043e\u0441\u0443.
            </p>
            <div className="gp-landing-actions">
              <button className="gp-btn gp-btn--primary" onClick={handleLogin}>[\u0432\u0445\u043e\u0434]</button>
              <button className="gp-btn gp-btn--ghost" onClick={() => setShowRegister(true)}>\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e</button>
            </div>
          </div>

          <div className="gp-landing-login-shell">
            {showRegister ? (
              <div>
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <button
                    onClick={() => setShowRegister(false)}
                    style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                  >
                    \u2190 \u041d\u0430\u0437\u0430\u0434 \u043a\u043e \u0432\u0445\u043e\u0434\u0443
                  </button>
                </div>
                <PortalRegisterForm onSuccess={() => {}} />
              </div>
            ) : (
              <PortalLoginExperience
                brandLogoUrl={BRAND_LOGO_URL}
                email={email}
                password={password}
                error={error}
                loading={loading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onLogin={handleLogin}
              />
            )}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              {showRegister ? null : (
                <button
                  onClick={() => setShowRegister(true)}
                  style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044e
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}"""

content = content[:idx_start] + new_login + content[idx_end:]

with open('/root/gastroprime/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print('Done')
