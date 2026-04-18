import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const mediaUrl = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`

interface ChatAttachment {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  sizeBytes: number
  kind: string
}

interface ChatMessage {
  id: string
  text: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  attachments: ChatAttachment[]
}

interface GuestChatResponse {
  sessionToken?: string
  company: {
    id: string
    name: string
    status: string
  }
  invite: {
    token: string
    label?: string | null
    expiresAt?: string | null
  }
  guest?: {
    userId?: string
    name: string
    email?: string | null
    phone?: string | null
  }
  conversation: {
    messages: ChatMessage[]
  }
}

const QUICK_EMOJI = ['👍', '🙂', '🔥', '🙏', '✅', '❤️']

export default function GuestInviteChat({ inviteToken }: { inviteToken: string }) {
  const storageKey = useMemo(() => `chat-invite-session:${inviteToken}`, [inviteToken])
  const [sessionToken, setSessionToken] = useState<string | null>(() => localStorage.getItem(`chat-invite-session:${inviteToken}`))
  const [meta, setMeta] = useState<GuestChatResponse | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [joinForm, setJoinForm] = useState({ name: '', email: '', phone: '' })

  const applyResponse = (response: GuestChatResponse) => {
    setMeta(response)
    setMessages(response.conversation?.messages || [])
    if (response.guest?.name) {
      setJoinForm(prev => ({ ...prev, name: prev.name || response.guest?.name || '', email: prev.email || response.guest?.email || '', phone: prev.phone || response.guest?.phone || '' }))
    }
    if (response.sessionToken) {
      localStorage.setItem(storageKey, response.sessionToken)
      setSessionToken(response.sessionToken)
    }
  }

  const loadInviteMeta = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/chat/invite/${inviteToken}`)
      setMeta(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ссылка-приглашение недоступна')
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async (tokenToLoad = sessionToken) => {
    if (!tokenToLoad) {
      await loadInviteMeta()
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/chat/invite/session/${tokenToLoad}`)
      applyResponse(response.data)
    } catch (err: any) {
      localStorage.removeItem(storageKey)
      setSessionToken(null)
      setError(err.response?.data?.message || 'Не удалось открыть гостевой чат')
      await loadInviteMeta()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
    const interval = window.setInterval(() => loadSession(), 20000)
    return () => window.clearInterval(interval)
  }, [inviteToken, sessionToken])

  const joinInvite = async () => {
    if (!joinForm.name.trim()) {
      setError('Укажите имя, чтобы войти в чат')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_URL}/chat/invite/${inviteToken}/join`, {
        name: joinForm.name,
        email: joinForm.email,
        phone: joinForm.phone,
      })
      applyResponse(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось присоединиться к чату')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!sessionToken) return
    const normalized = text.trim()
    if (!normalized && !files.length) return

    setSending(true)
    setError('')
    try {
      const formData = new FormData()
      if (normalized) formData.append('text', normalized)
      files.forEach((file) => formData.append('files', file))
      const response = await axios.post(`${API_URL}/chat/invite/session/${sessionToken}/messages`, formData)
      applyResponse(response.data)
      setText('')
      setFiles([])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="gp-shell" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <div className="gp-content" style={{ width: 'min(960px, 100%)', margin: '0 auto', paddingTop: 24 }}>
        <div className="gp-chat-page-card" style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(38, 23, 14, 0.08)', border: '1px solid rgba(237,57,21,0.10)' }}>
          <h1 style={{ marginTop: 0 }}>Гостевой чат GastroPrime</h1>
          <p style={{ color: '#666', marginTop: -4 }}>
            {meta?.company?.name ? `Приглашение в чат компании ${meta.company.name}.` : 'Приглашение в рабочий чат.'}
            {meta?.invite?.label ? ` ${meta.invite.label}.` : ''}
          </p>

          {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

          {!sessionToken ? (
            <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <input value={joinForm.name} onChange={(e) => setJoinForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ваше имя" />
              <input value={joinForm.email} onChange={(e) => setJoinForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email, если нужен" />
              <input value={joinForm.phone} onChange={(e) => setJoinForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Телефон, если нужен" />
              <button onClick={joinInvite} disabled={loading} style={{ background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', width: 'fit-content' }}>
                {loading ? 'Подключаю...' : 'Войти в чат'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ color: '#666' }}>Вы вошли как <strong>{meta?.guest?.name || 'гость'}</strong></div>

              <div className="gp-chat-page-messages" style={{ padding: 16, display: 'grid', gap: 12, minHeight: 320, maxHeight: 520, overflowY: 'auto', background: '#fffdfb', borderRadius: 18, border: '1px solid #f1e5db' }}>
                {loading && messages.length === 0 ? (
                  <div style={{ color: '#666' }}>Загрузка переписки...</div>
                ) : messages.length === 0 ? (
                  <div style={{ color: '#666' }}>Сообщений пока нет. Можно написать первым.</div>
                ) : (
                  messages.map((message) => {
                    const isMine = meta?.guest?.userId ? message.user.id === meta.guest.userId : false
                    return (
                      <div key={message.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div className="gp-chat-message-bubble" style={{ maxWidth: '78%', padding: '12px 14px', borderRadius: 16, background: isMine ? 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)' : '#fff', color: isMine ? '#fff' : '#1f1a17', border: isMine ? 'none' : '1px solid #f1e5db' }}>
                          <div style={{ fontSize: 12, opacity: isMine ? 0.85 : 0.6, marginBottom: 6 }}>{isMine ? 'Вы' : message.user.name}</div>
                          {message.text && <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{message.text}</div>}
                          {message.attachments.length > 0 && (
                            <div style={{ display: 'grid', gap: 8, marginTop: message.text ? 10 : 0 }}>
                              {message.attachments.map((attachment) => (
                                <a key={attachment.id} href={mediaUrl(attachment.fileUrl)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 12, background: isMine ? 'rgba(255,255,255,0.16)' : '#fff7f1', color: isMine ? '#fff' : '#b53b1f', textDecoration: 'none' }}>
                                  <span>{attachment.kind === 'IMAGE' ? '🖼️' : '📎'}</span>
                                  <span>{attachment.fileName}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: 12, opacity: isMine ? 0.85 : 0.6, marginTop: 8 }}>{new Date(message.createdAt).toLocaleString('ru-RU')}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {QUICK_EMOJI.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => setText(prev => `${prev}${emoji}`)} style={{ background: '#fff7f1', color: '#b53b1f', border: '1px solid #f1d5c3', borderRadius: 12, padding: '6px 10px' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишите сообщение..." rows={4} />
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
                {files.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{files.map((file) => <span key={`${file.name}-${file.size}`} style={{ padding: '6px 10px', borderRadius: 999, background: '#fff7f1', color: '#b53b1f', fontSize: 13 }}>{file.name}</span>)}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={sendMessage} disabled={sending || (!text.trim() && !files.length)} style={{ background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', minWidth: 180 }}>
                    {sending ? 'Отправляю...' : 'Отправить'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
