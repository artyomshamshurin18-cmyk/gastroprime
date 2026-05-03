import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import * as https from 'https'

@Injectable()
export class TelegramService {
  private readonly botToken: string
  private readonly adminChatId: string

  constructor(private config: ConfigService) {
    this.botToken = this.config.get('TELEGRAM_BOT_TOKEN') || ''
    this.adminChatId = this.config.get('TELEGRAM_ADMIN_CHAT_ID') || ''
  }

  async sendMessage(text: string) {
    if (!this.botToken || !this.adminChatId) return

    return new Promise<void>((resolve) => {
      const body = JSON.stringify({
        chat_id: this.adminChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      })

      const req = https.request({
        hostname: 'api.telegram.org',
        path: '/bot' + this.botToken + '/sendMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 8000,
      }, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (!json.ok) console.error('Telegram send error:', JSON.stringify(json))
          } catch {}
          resolve()
        })
      })

      req.on('error', (err) => {
        console.error('Telegram send failed:', err.message)
        resolve()
      })

      req.on('timeout', () => {
        req.destroy()
        console.error('Telegram send timeout')
        resolve()
      })

      req.write(body)
      req.end()
    })
  }

  async notifyNewCompany(email: string, companyName: string, accountNumber: string) {
    const text = [
      '<b>\u{1F195} Новая регистрация компании!</b>',
      '',
      '<b>Компания:</b> ' + (companyName || '\u2014'),
      '<b>\u0423\u0447\u0451\u0442\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440:</b> ' + (accountNumber || '\u2014'),
      '<b>Email \u0432\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u0430:</b> ' + email,
      '',
      '\u0417\u0430\u0439\u0434\u0438 \u0432 \u0430\u0434\u043c\u0438\u043d\u043a\u0443 \u2014 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0432 \u0441\u0442\u0430\u0442\u0443\u0441\u0435 ONBOARDING.',
    ].join('\n')

    await this.sendMessage(text)
  }
}
