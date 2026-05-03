import './theme.css'

export default function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className='gp-shell'>
      <div className='gp-header'>
        <div className='gp-brand'>
          <img src='https://static.tildacdn.com/tild6666-3335-4136-b866-376266373637/Group.svg' alt='' />
          <div>
            <div className='gp-brand-subtitle' style={{ fontSize: 13 }}>Политика обработки персональных данных</div>
          </div>
        </div>
        <div className='gp-header-right'>
          <button onClick={onBack} style={{ padding: '10px 16px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 12, cursor: 'pointer' }}>&larr; Назад</button>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px', fontSize: 14, lineHeight: 1.6, color: '#1c1a18' }}>
        <h1>Политика в отношении обработки персональных данных</h1>
        <p><strong>Дата вступления:</strong> 1 июня 2026 г.</p>
        <h2>1. Общие положения</h2>
        <p>Настоящая политика составлена в соответствии с ФЗ от 27.07.2006 № 152-ФЗ &laquo;О персональных данных&raquo; (далее — Закон).</p>
        <h2>2. Цели и объем обработки</h2>
        <p>Ведение учета клиентов, заключение и исполнение договоров, кейтеринг, выставление счетов.</p>
        <h2>3. Порядок обработки</h2>
        <p>Оператор принимает все меры для защиты ПД. ПД не передаются третьим лицам, кроме случаев, предусмотренных законом.</p>
        <h2>4. Контакты</h2>
        <p>Вопросы: <a href='mailto:privacy@gastroprime.ru' style={{color: "#ed3915"}}>privacy@gastroprime.ru</a></p>
      </div>
    </div>
  )
}
