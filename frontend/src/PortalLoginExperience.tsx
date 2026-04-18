const showcaseCards = [
  {
    title: 'Сотрудник выбирает питание за минуту',
    text: 'Плановое меню и отдельный список заявок убирают хаос в чатах и ручных таблицах.',
    image: '/landing/screenshots/02-employee-planning-desktop.png',
    tone: 'warm',
  },
  {
    title: 'Координатор видит компанию целиком',
    text: 'Сотрудники, лимиты, статусы, аналитика и документы по своей компании в одном окне.',
    image: '/landing/screenshots/06-coordinator-dashboard-desktop.png',
    tone: 'light',
  },
  {
    title: 'Админ управляет пользователями и компаниями',
    text: 'Статусы, удаления, лимиты, роли и контроль доступа без ручной рутины.',
    image: '/landing/screenshots/07-admin-users-desktop.png',
    tone: 'dark',
  },
]

const foodVisuals = [
  { name: 'Борщ', image: '/landing/food/borscht.png' },
  { name: 'Солянка', image: '/landing/food/solyanka.png' },
  { name: 'Котлеты домашние', image: '/landing/food/cutlets.png' },
  { name: 'Плов', image: '/landing/food/plov.png' },
  { name: 'Греческий салат', image: '/landing/food/greek-salad.png' },
  { name: 'Говядина тушеная', image: '/landing/food/braised-beef.png' },
]

const audienceCards = [
  {
    title: 'Для HR',
    text: 'Быстрое подключение сотрудников, понятные статусы и меньше ручной координации.',
  },
  {
    title: 'Для office / admin',
    text: 'Меньше чатов, сверок и уточнений. Все заявки, лимиты и счета уже собраны в системе.',
  },
  {
    title: 'Для руководителя',
    text: 'Видно, сколько людей питается, какие блюда востребованы и как расходуется бюджет.',
  },
]

const processSteps = [
  'Компания подключается и получает доступ по роли.',
  'Сотрудники выбирают питание, а координатор видит заявки и статус компании.',
  'Администратор управляет лимитами, аналитикой, сверкой и жизненным циклом клиента.',
]

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
  return (
    <div className="gp-landing">
      <section className="gp-landing-hero">
        <div className="gp-landing-hero__bg" />
        <div className="gp-landing-topbar">
          <div className="gp-brand">
            <img src={brandLogoUrl} alt="Gastroprime" />
            <div className="gp-brand-subtitle gp-brand-subtitle--hero">Портал корпоративного питания</div>
          </div>
          <div className="gp-landing-topbar__badges">
            <span className="gp-top-pill">Для HR, office и admin</span>
          </div>
        </div>

        <div className="gp-landing-grid">
          <div className="gp-landing-copy">
            <div className="gp-landing-kicker">Корпоративное питание без чатов, Excel и потерь</div>
            <h1 className="gp-landing-title">Сильный B2B-портал, где сотрудники быстро выбирают питание, а компания полностью контролирует заявки, бюджет и доступ.</h1>
            <p className="gp-landing-lead">
              Один кабинет для сотрудников, координатора и администратора. Меньше ручной координации, меньше ошибок,
              больше прозрачности по лимитам, счетам, статусам и ежедневному спросу.
            </p>
            <div className="gp-landing-actions">
              <button className="gp-btn gp-btn--primary" onClick={onLogin}>Открыть кабинет</button>
              <a className="gp-btn gp-btn--ghost" href="#showcase">Посмотреть возможности</a>
            </div>
            <div className="gp-landing-proof">
              <div className="gp-landing-proof__item"><strong>Минус хаос</strong><span>заявки и выборы блюд больше не теряются в чатах и таблицах</span></div>
              <div className="gp-landing-proof__item"><strong>Контроль доступа</strong><span>статусы компаний и пользователей сразу управляют доступным функционалом</span></div>
              <div className="gp-landing-proof__item"><strong>Финансы под контролем</strong><span>лимиты, счета, сверка и аналитика собраны в одном интерфейсе</span></div>
            </div>
          </div>

          <div className="gp-landing-login-shell">
            <div className="gp-card gp-login-card gp-login-card--landing">
              <div className="gp-login-card__badge">Вход в систему</div>
              <h2 className="gp-login-title">Единый кабинет корпоративного питания</h2>
              <p className="gp-login-subtitle">Для сотрудников, координаторов и администраторов компании.</p>
              {error && <div className="gp-login-error">{error}</div>}
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Пароль</label>
                  <input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
                </div>
                <button className="gp-btn gp-btn--primary gp-btn--full" onClick={onLogin} disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </div>
              <div className="gp-login-mini-features">
                <div>• Плановое меню и заявки</div>
                <div>• Аналитика по компании</div>
                <div>• Счета, лимиты и сверка</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gp-landing-section gp-landing-section--tight">
        <div className="gp-landing-section__head">
          <div className="gp-landing-kicker">Для кого это</div>
          <h2 className="gp-landing-section__title">Не просто форма заказа, а рабочий контур для всей компании.</h2>
        </div>
        <div className="gp-landing-audience">
          {audienceCards.map((item) => (
            <div key={item.title} className="gp-landing-audience__card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gp-landing-section" id="showcase">
        <div className="gp-landing-section__head">
          <div className="gp-landing-kicker">Как это выглядит</div>
          <h2 className="gp-landing-section__title">Интерфейс, который понятен сотруднику и полезен бизнесу.</h2>
        </div>
        <div className="gp-landing-showcase">
          {showcaseCards.map((card) => (
            <article key={card.title} className={`gp-landing-showcase__card gp-landing-showcase__card--${card.tone}`}>
              <div className="gp-landing-showcase__meta">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
              <div className="gp-landing-showcase__image-wrap">
                <img src={card.image} alt={card.title} className="gp-landing-showcase__image" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gp-landing-section gp-landing-section--accent">
        <div className="gp-landing-section__head">
          <div className="gp-landing-kicker">Ассортимент</div>
          <h2 className="gp-landing-section__title">Питание, которое хочется выбрать, а не просто отметить галочкой.</h2>
        </div>
        <div className="gp-landing-food-grid">
          {foodVisuals.map((item) => (
            <div key={item.name} className="gp-landing-food-card">
              <img src={item.image} alt={item.name} />
              <div>{item.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="gp-landing-section">
        <div className="gp-landing-section__head">
          <div className="gp-landing-kicker">Как работает</div>
          <h2 className="gp-landing-section__title">От подключения компании до ежедневного выбора блюд.</h2>
        </div>
        <div className="gp-landing-steps">
          {processSteps.map((step, index) => (
            <div key={step} className="gp-landing-step">
              <div className="gp-landing-step__index">0{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
