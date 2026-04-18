import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from '../common/prisma.service'

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  path: '/api/socket.io',
  cors: {
    origin: ['https://app.gastroprime.ru', 'http://localhost:5173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server

  private readonly logger = new Logger(ChatGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        (client.handshake.auth?.token as string | undefined) ||
        (typeof client.handshake.query?.token === 'string' ? client.handshake.query.token : undefined) ||
        (typeof client.handshake.headers?.authorization === 'string' ? client.handshake.headers.authorization.replace(/^Bearer\s+/i, '') : undefined)

      if (!rawToken) {
        client.disconnect(true)
        return
      }

      const payload = this.jwtService.verify(rawToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as { sub: string }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, status: true },
      })

      if (!user || user.status === 'DISMISSED') {
        client.disconnect(true)
        return
      }

      client.data.userId = user.id
      await client.join(this.getUserRoom(user.id))
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${error instanceof Error ? error.message : String(error)}`)
      client.disconnect(true)
    }
  }

  emitConversationUpdated(userIds: string[], payload: { companyId: string, conversationId: string }) {
    const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)))
    uniqueUserIds.forEach((userId) => {
      this.server.to(this.getUserRoom(userId)).emit('chat:updated', payload)
    })
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`
  }
}
