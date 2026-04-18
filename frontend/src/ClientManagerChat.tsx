import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru'
const SOCKET_URL = API_URL.replace(/\/api$/, '')
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

const QUICK_EMOJI = ['👍', '🙂', '🔥', '🙏', '✅', '❤️']

export default function ClientManagerChat({ token, user }: { token: string, user: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const lastIncomingMessageIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const playNotificationTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.value = 0.03
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.14)
      oscillator.onended = () => context.close()
    } catch {
      // ignore audio errors
    }
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  const latestIncomingMessage = useMemo(() => [...messages].reverse().find(message => message.user.id !== user?.id), [messages, user?.id])

  const loadChat = async (silent = false) => {
    if (!silent) setLoading(true)
    if (!silent) setError('')
    try {
      const response = await axios.get(`${API_URL}/chat/my-company`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const nextMessages = response.data?.conversation?.messages || []
      setMessages(nextMessages)
      setCompanyName(response.data?.company?.name || '')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось загрузить чат с менеджером')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadChat()
    const interval = window.setInterval(() => loadChat(true), 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      path: '/socket.io',
    })

    socket.on('chat:updated', () => {
      loadChat(true)
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  useEffect(() => {
    if (!latestIncomingMessage) return
    const previous = lastIncomingMessageIdRef.current
    lastIncomingMessageIdRef.current = latestIncomingMessage.id

    if (!previous || previous === latestIncomingMessage.id) return
    playNotificationTone()
    if (!('Notification' in window)) return
    if (document.visibilityState === 'visible') return
    if (Notification.permission === 'granted') {
      new Notification(`Новое сообщение от менеджера`, {
        body: latestIncomingMessage.text || 'В чат пришло новое вложение',
      })
    }
  }, [latestIncomingMessage])

  useEffect(() => {
    if (!messages.length) return
    scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth')
  }, [messages.length])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const sendMessage = async () => {
    const normalized = text.trim()
    if (!normalized && !files.length) return

    setSending(true)
    setError('')
    try {
      const formData = new FormData()
      if (normalized) formData.append('text', normalized)
      files.forEach((file) => formData.append('files', file))

      const response = await axios.post(`${API_URL}/chat/my-company/messages`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data?.conversation?.messages || [])
      setText('')
      setFiles([])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h2>Чат с менеджером</h2>
      <p style={{ color: '#666', marginTop: -5, marginBottom: 18 }}>
        Быстрый рабочий чат по заявкам, меню и вопросам{companyName ? ` для ${companyName}` : ''}. Можно отправлять текст, фото и файлы.
      </p>

      {error && <div style={{ padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div className="gp-chat-page-card" style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(237,57,21,0.10)', boxShadow: '0 14px 32px rgba(38, 23, 14, 0.06)', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f1e5db', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <strong>{companyName || 'Диалог с менеджером'}</strong>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={requestNotificationPermission} style={{ background: '#fff7f1', color: '#b53b1f', border: '1px solid #f1d5c3', borderRadius: 12, padding: '8px 12px' }}>
              Включить уведомления
            </button>
            <button onClick={() => loadChat()} disabled={loading} style={{ background: '#fff7f1', color: '#b53b1f', border: '1px solid #f1d5c3', borderRadius: 12, padding: '8px 12px' }}>
              {loading ? 'Обновляю...' : 'Обновить'}
            </button>
          </div>
        </div>

        <div className="gp-chat-page-messages" style={{ padding: 16, display: 'grid', gap: 12, minHeight: 320, maxHeight: 520, overflowY: 'auto', background: '#fffdfb' }}>
          {loading && messages.length === 0 ? (
            <div style={{ color: '#666' }}>Загрузка переписки...</div>
          ) : messages.length === 0 ? (
            <div style={{ color: '#666' }}>Сообщений пока нет. Можно начать диалог первым.</div>
          ) : (
            messages.map((message) => {
              const isMine = message.user.id === user?.id
              const isManager = ['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(message.user.role)

              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div className="gp-chat-message-bubble" style={{ maxWidth: '78%', padding: '12px 14px', borderRadius: 16, background: isMine ? 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)' : '#fff', color: isMine ? '#fff' : '#1f1a17', border: isMine ? 'none' : '1px solid #f1e5db', boxShadow: isMine ? '0 10px 24px rgba(237,57,21,0.16)' : '0 6px 16px rgba(38, 23, 14, 0.05)' }}>
                    <div style={{ fontSize: 12, opacity: isMine ? 0.85 : 0.6, marginBottom: 6 }}>
                      {isMine ? 'Вы' : isManager ? 'Менеджер' : message.user.name}
                    </div>
                    {message.text && <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{message.text}</div>}
                    {message.attachments.length > 0 && (
                      <div style={{ display: 'grid', gap: 8, marginTop: message.text ? 10 : 0 }}>
                        {message.attachments.map((attachment) => (
                          <a key={attachment.id} href={mediaUrl(attachment.fileUrl)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 12, background: isMine ? 'rgba(255,255,255,0.16)' : '#fff7f1', color: isMine ? '#fff' : '#b53b1f', textDecoration: 'none', maxWidth: '100%' }}>
                            <span>{attachment.kind === 'IMAGE' ? '🖼️' : '📎'}</span>
                            <span style={{ wordBreak: 'break-word' }}>{attachment.fileName}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 12, opacity: isMine ? 0.85 : 0.6, marginTop: 8 }}>
                      {new Date(message.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="gp-chat-page-composer" style={{ padding: 16, borderTop: '1px solid #f1e5db', display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_EMOJI.map((emoji) => (
              <button key={emoji} type="button" onClick={() => setText(prev => `${prev}${emoji}`)} style={{ background: '#fff7f1', color: '#b53b1f', border: '1px solid #f1d5c3', borderRadius: 12, padding: '6px 10px' }}>
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите сообщение менеджеру..."
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
          {files.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {files.map((file) => <span key={`${file.name}-${file.size}`} style={{ padding: '6px 10px', borderRadius: 999, background: '#fff7f1', color: '#b53b1f', fontSize: 13 }}>{file.name}</span>)}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={sendMessage} disabled={sending || (!text.trim() && !files.length)} style={{ background: 'linear-gradient(135deg, #ed3915 0%, #ff6a3d 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', minWidth: 180 }}>
              {sending ? 'Отправляю...' : 'Отправить сообщение'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
