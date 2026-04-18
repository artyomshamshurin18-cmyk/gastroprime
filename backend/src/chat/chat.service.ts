import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { ChatGateway } from './chat.gateway'
import * as fs from 'fs'
import * as path from 'path'
import { randomBytes } from 'crypto'

const INTERNAL_ROLES = ['ADMIN', 'SUPERADMIN', 'MANAGER']
const INTERNAL_COMPANY_NAME = 'Gastroprime'
type UploadedChatFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

type GuestSession = {
  id: string
  userId: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  accessToken: string
  invite: {
    id: string
    label: string | null
    expiresAt: Date | null
    revokedAt: Date | null
    token: string
    conversationId: string
    companyId: string
    company: {
      id: string
      name: string
      status: string
    }
  }
}

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  private isInternalRole(role?: string | null) {
    return Boolean(role && INTERNAL_ROLES.includes(role))
  }

  private isInternalTeamUser(user?: { role?: string | null, company?: { name?: string | null } | null }) {
    return this.isInternalRole(user?.role) || user?.company?.name === INTERNAL_COMPANY_NAME
  }

  private normalizeText(value?: string | null) {
    return typeof value === 'string' ? value.trim() : ''
  }

  private generateToken(size = 24) {
    return randomBytes(size).toString('hex')
  }

  private buildGuestEmail() {
    return `chat-guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@guest.gastroprime.local`
  }

  private splitGuestName(name: string) {
    const normalized = this.normalizeText(name)
    const parts = normalized.split(/\s+/).filter(Boolean)

    return {
      firstName: parts[0] || normalized,
      lastName: parts.slice(1).join(' ') || null,
    }
  }

  private isInviteActive(invite?: { revokedAt?: Date | null, expiresAt?: Date | null } | null) {
    if (!invite) return false
    if (invite.revokedAt) return false
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) return false
    return true
  }

  private getAttachmentKind(mimeType?: string) {
    if (!mimeType) return 'FILE'
    if (mimeType.startsWith('image/')) return 'IMAGE'
    return 'FILE'
  }

  private saveUpload(file: UploadedChatFile, folderName = 'chat') {
    const uploadsDir = path.join(process.cwd(), 'uploads', folderName)
    fs.mkdirSync(uploadsDir, { recursive: true })

    const extension = path.extname(file.originalname || '') || ''
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`
    const filePath = path.join(uploadsDir, fileName)

    fs.writeFileSync(filePath, file.buffer)
    return `/uploads/${folderName}/${fileName}`
  }

  private async getUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        companyId: true,
        company: {
          select: {
            name: true,
          }
        },
      }
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user
  }

  private async getCompanyOrThrow(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, status: true }
    })

    if (!company) {
      throw new NotFoundException('Компания не найдена')
    }

    return company
  }

  private async getInviteByTokenOrThrow(token: string) {
    const invite = await this.prisma.chatInvite.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      }
    })

    if (!invite) {
      throw new NotFoundException('Ссылка-приглашение не найдена')
    }

    if (!this.isInviteActive(invite)) {
      throw new BadRequestException('Ссылка-приглашение больше не действует')
    }

    return invite
  }

  private async getGuestSessionOrThrow(accessToken: string): Promise<GuestSession> {
    const session = await this.prisma.chatInviteGuest.findUnique({
      where: { accessToken },
      include: {
        invite: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    })

    if (!session) {
      throw new NotFoundException('Гостевая сессия не найдена')
    }

    if (!this.isInviteActive(session.invite)) {
      throw new BadRequestException('Ссылка-приглашение больше не действует')
    }

    return session as GuestSession
  }

  private async ensureConversation(companyId: string) {
    const company = await this.getCompanyOrThrow(companyId)
    let conversation = await this.prisma.chatConversation.findUnique({
      where: {
        companyId_type: {
          companyId,
          type: 'COMPANY_SUPPORT',
        }
      },
      select: { id: true, companyId: true },
    })

    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: {
          companyId,
          type: 'COMPANY_SUPPORT',
          title: `Чат ${company.name}`,
        },
        select: { id: true, companyId: true },
      })
    }
    return conversation
  }

  private async ensureParticipant(conversationId: string, userId: string, canManageParticipants = false) {
    const existing = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { id: true, canManageParticipants: true },
    })

    if (existing) {
      if (canManageParticipants && !existing.canManageParticipants) {
        await this.prisma.chatParticipant.update({
          where: { conversationId_userId: { conversationId, userId } },
          data: { canManageParticipants: true },
        })
      }
      return
    }

    await this.prisma.chatParticipant.create({
      data: {
        conversationId,
        userId,
        canManageParticipants,
      }
    })
  }

  private async ensureAccess(userId: string, companyId: string) {
    const user = await this.getUserOrThrow(userId)
    if (user.status === 'DISMISSED') {
      throw new ForbiddenException('Уволенный сотрудник не может пользоваться чатом')
    }

    const conversation = await this.ensureConversation(companyId)
    const existingParticipant = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      select: { id: true },
    })

    if (!this.isInternalRole(user.role) && user.companyId !== companyId && !existingParticipant) {
      throw new ForbiddenException('Нет доступа к этому чату')
    }

    await this.ensureParticipant(conversation.id, userId, this.isInternalRole(user.role))

    return { user, conversation }
  }

  private async emitConversationUpdated(conversationId: string, companyId: string) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    })

    this.chatGateway.emitConversationUpdated(
      participants.map((participant) => participant.userId),
      { conversationId, companyId },
    )
  }

  private async canManageParticipants(userId: string, conversationId: string) {
    const user = await this.getUserOrThrow(userId)
    if (this.isInternalRole(user.role)) return true

    const participant = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { canManageParticipants: true },
    })

    return Boolean(participant?.canManageParticipants)
  }

  private async buildConversationResponse(conversationId: string, currentUserId: string, markRead = true) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
              }
            }
          },
          orderBy: { joinedAt: 'asc' },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              }
            },
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 200,
        }
      }
    })

    if (!conversation) {
      throw new NotFoundException('Чат не найден')
    }

    const currentParticipant = conversation.participants.find((participant) => participant.userId === currentUserId)
    const currentLastReadAt = currentParticipant?.lastReadAt || null
    const unreadCount = conversation.messages.filter((message) => message.senderId !== currentUserId && (!currentLastReadAt || message.createdAt > currentLastReadAt)).length

    if (markRead && currentParticipant) {
      await this.prisma.chatParticipant.update({
        where: { conversationId_userId: { conversationId, userId: currentUserId } },
        data: { lastReadAt: new Date() },
      })

      if (unreadCount > 0) {
        this.chatGateway.emitConversationUpdated([currentUserId], {
          conversationId,
          companyId: conversation.companyId,
        })
      }
    }

    const canManage = await this.canManageParticipants(currentUserId, conversationId)
    const participantIds = new Set(conversation.participants.map((participant) => participant.userId))
    const availableCandidates = canManage
      ? await this.prisma.user.findMany({
          where: {
            id: { notIn: Array.from(participantIds) },
            status: { not: 'DISMISSED' },
            OR: [
              { companyId: conversation.companyId },
              { role: { in: INTERNAL_ROLES } },
              { company: { name: INTERNAL_COMPANY_NAME } },
            ],
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
          orderBy: [{ role: 'asc' }, { email: 'asc' }],
        })
      : []

    const invites = canManage
      ? await this.prisma.chatInvite.findMany({
          where: {
            conversationId,
            revokedAt: null,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          include: {
            guests: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : []

    return {
      company: conversation.company,
      conversation: {
        id: conversation.id,
        companyId: conversation.companyId,
        unreadCount: markRead ? 0 : unreadCount,
        participants: conversation.participants.map((participant) => ({
          id: participant.user.id,
          role: participant.user.role,
          email: participant.user.email,
          name: [participant.user.firstName, participant.user.lastName].filter(Boolean).join(' ') || participant.user.email,
          canManageParticipants: participant.canManageParticipants,
          companyId: participant.user.companyId,
        })),
        availableCandidates: availableCandidates.map((candidate) => ({
          id: candidate.id,
          role: candidate.role,
          email: candidate.email,
          name: [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || candidate.email,
        })),
        invites: invites.map((invite) => ({
          id: invite.id,
          token: invite.token,
          label: invite.label,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
          guestCount: invite.guests.length,
        })),
        messages: conversation.messages.map((message) => ({
          id: message.id,
          text: message.text || '',
          createdAt: message.createdAt,
          user: {
            id: message.sender.id,
            role: message.sender.role,
            email: message.sender.email,
            name: [message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ') || message.sender.email,
          },
          attachments: message.attachments.map((attachment) => ({
            id: attachment.id,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
            kind: attachment.kind,
          })),
        })),
      }
    }
  }

  private async buildGuestConversationResponse(accessToken: string, markRead = true) {
    const session = await this.getGuestSessionOrThrow(accessToken)
    const base = await this.buildConversationResponse(session.invite.conversationId, session.userId, markRead)

    return {
      company: base.company,
      invite: {
        id: session.invite.id,
        token: session.invite.token,
        label: session.invite.label,
        expiresAt: session.invite.expiresAt,
      },
      guest: {
        userId: session.userId,
        name: session.guestName,
        email: session.guestEmail,
        phone: session.guestPhone,
      },
      conversation: {
        ...base.conversation,
        availableCandidates: [],
        invites: [],
      }
    }
  }

  async getMyCompanyChat(userId: string) {
    const user = await this.getUserOrThrow(userId)
    if (!user.companyId) {
      throw new ForbiddenException('Чат доступен только пользователям компании')
    }

    const { conversation } = await this.ensureAccess(userId, user.companyId)
    return this.buildConversationResponse(conversation.id, userId, true)
  }

  async getCompanyChat(userId: string, companyId: string) {
    const { conversation } = await this.ensureAccess(userId, companyId)
    return this.buildConversationResponse(conversation.id, userId, true)
  }

  async sendMessageToMyCompany(userId: string, text: string, files: UploadedChatFile[] = []) {
    const user = await this.getUserOrThrow(userId)
    if (!user.companyId) {
      throw new ForbiddenException('Чат доступен только пользователям компании')
    }
    return this.sendMessage(userId, user.companyId, text, files)
  }

  async sendMessage(userId: string, companyId: string, text: string, files: UploadedChatFile[] = []) {
    const normalizedText = this.normalizeText(text)
    if (!normalizedText && !files.length) {
      throw new BadRequestException('Нужно добавить текст или вложение')
    }

    const { conversation } = await this.ensureAccess(userId, companyId)

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        text: normalizedText || null,
      },
      select: { id: true },
    })

    if (files.length) {
      const attachments = files.map((file) => ({
        messageId: message.id,
        fileName: file.originalname,
        fileUrl: this.saveUpload(file, 'chat-files'),
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size || 0,
        kind: this.getAttachmentKind(file.mimetype),
      }))

      await this.prisma.chatAttachment.createMany({ data: attachments })
    }

    await this.prisma.chatParticipant.update({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      data: { lastReadAt: new Date() },
    })

    await this.emitConversationUpdated(conversation.id, companyId)

    return this.buildConversationResponse(conversation.id, userId, false)
  }

  async addParticipant(actorUserId: string, companyId: string, participantUserId: string) {
    const { conversation } = await this.ensureAccess(actorUserId, companyId)
    const canManage = await this.canManageParticipants(actorUserId, conversation.id)

    if (!canManage) {
      throw new ForbiddenException('Нет прав на управление участниками чата')
    }

    const participantUser = await this.getUserOrThrow(participantUserId)
    if (!this.isInternalTeamUser(participantUser) && participantUser.companyId !== companyId) {
      throw new BadRequestException('Можно добавлять только сотрудников этой компании или команды GastroPrime')
    }

    await this.ensureParticipant(conversation.id, participantUserId, this.isInternalRole(participantUser.role))
    await this.emitConversationUpdated(conversation.id, companyId)
    return this.buildConversationResponse(conversation.id, actorUserId, false)
  }

  async removeParticipant(actorUserId: string, companyId: string, participantUserId: string) {
    const { conversation } = await this.ensureAccess(actorUserId, companyId)
    const canManage = await this.canManageParticipants(actorUserId, conversation.id)

    if (!canManage) {
      throw new ForbiddenException('Нет прав на управление участниками чата')
    }

    const deleted = await this.prisma.chatParticipant.deleteMany({
      where: {
        conversationId: conversation.id,
        userId: participantUserId,
      }
    })

    if (!deleted.count) {
      throw new NotFoundException('Участник не найден в этом чате')
    }

    await this.emitConversationUpdated(conversation.id, companyId)
    return this.buildConversationResponse(conversation.id, actorUserId, false)
  }

  async createInvite(actorUserId: string, companyId: string, data: { label?: string, expiresInDays?: number }) {
    const { conversation } = await this.ensureAccess(actorUserId, companyId)
    const canManage = await this.canManageParticipants(actorUserId, conversation.id)

    if (!canManage) {
      throw new ForbiddenException('Нет прав на создание invite-ссылок')
    }

    const expiresInDays = Number(data?.expiresInDays) > 0 ? Number(data.expiresInDays) : 14
    await this.prisma.chatInvite.create({
      data: {
        conversationId: conversation.id,
        companyId,
        createdByUserId: actorUserId,
        token: this.generateToken(),
        label: this.normalizeText(data?.label) || null,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      }
    })

    await this.emitConversationUpdated(conversation.id, companyId)
    return this.buildConversationResponse(conversation.id, actorUserId, false)
  }

  async revokeInvite(actorUserId: string, companyId: string, inviteId: string) {
    const { conversation } = await this.ensureAccess(actorUserId, companyId)
    const canManage = await this.canManageParticipants(actorUserId, conversation.id)

    if (!canManage) {
      throw new ForbiddenException('Нет прав на отзыв invite-ссылок')
    }

    await this.prisma.chatInvite.updateMany({
      where: {
        id: inviteId,
        conversationId: conversation.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      }
    })

    await this.emitConversationUpdated(conversation.id, companyId)
    return this.buildConversationResponse(conversation.id, actorUserId, false)
  }

  async getInvite(token: string) {
    const invite = await this.getInviteByTokenOrThrow(token)
    return {
      invite: {
        token: invite.token,
        label: invite.label,
        expiresAt: invite.expiresAt,
      },
      company: invite.company,
    }
  }

  async joinInvite(token: string, data: { name?: string, email?: string, phone?: string }) {
    const invite = await this.getInviteByTokenOrThrow(token)
    const guestName = this.normalizeText(data?.name)

    if (!guestName) {
      throw new BadRequestException('Нужно указать имя гостя')
    }

    const splitName = this.splitGuestName(guestName)
    const guestUser = await this.prisma.user.create({
      data: {
        email: this.buildGuestEmail(),
        password: this.generateToken(16),
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        phone: this.normalizeText(data?.phone) || null,
        role: 'CHAT_GUEST',
        status: 'ACTIVE',
      },
      select: { id: true },
    })

    await this.ensureParticipant(invite.conversationId, guestUser.id, false)

    const session = await this.prisma.chatInviteGuest.create({
      data: {
        inviteId: invite.id,
        userId: guestUser.id,
        accessToken: this.generateToken(),
        guestName,
        guestEmail: this.normalizeText(data?.email) || null,
        guestPhone: this.normalizeText(data?.phone) || null,
      },
      select: { accessToken: true },
    })

    await this.emitConversationUpdated(invite.conversationId, invite.companyId)
    return {
      sessionToken: session.accessToken,
      ...(await this.buildGuestConversationResponse(session.accessToken, true)),
    }
  }

  async getGuestConversation(accessToken: string) {
    const session = await this.getGuestSessionOrThrow(accessToken)
    await this.prisma.chatInviteGuest.update({
      where: { accessToken },
      data: { lastSeenAt: new Date() },
    })

    return this.buildGuestConversationResponse(session.accessToken, true)
  }

  async sendGuestMessage(accessToken: string, text: string, files: UploadedChatFile[] = []) {
    const normalizedText = this.normalizeText(text)
    if (!normalizedText && !files.length) {
      throw new BadRequestException('Нужно добавить текст или вложение')
    }

    const session = await this.getGuestSessionOrThrow(accessToken)

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: session.invite.conversationId,
        senderId: session.userId,
        text: normalizedText || null,
      },
      select: { id: true },
    })

    if (files.length) {
      await this.prisma.chatAttachment.createMany({
        data: files.map((file) => ({
          messageId: message.id,
          fileName: file.originalname,
          fileUrl: this.saveUpload(file, 'chat-files'),
          mimeType: file.mimetype || 'application/octet-stream',
          sizeBytes: file.size || 0,
          kind: this.getAttachmentKind(file.mimetype),
        }))
      })
    }

    await this.prisma.chatParticipant.updateMany({
      where: {
        conversationId: session.invite.conversationId,
        userId: session.userId,
      },
      data: { lastReadAt: new Date() },
    })

    await this.prisma.chatInviteGuest.update({
      where: { accessToken },
      data: { lastSeenAt: new Date() },
    })

    await this.emitConversationUpdated(session.invite.conversationId, session.invite.companyId)
    return this.buildGuestConversationResponse(accessToken, false)
  }

  async getSummary(userId: string) {
    const user = await this.getUserOrThrow(userId)

    const participants = await this.prisma.chatParticipant.findMany({
      where: {
        userId,
        conversation: {
          type: 'COMPANY_SUPPORT',
        }
      },
      include: {
        conversation: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              }
            },
            messages: {
              include: {
                sender: {
                  select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        }
      }
    })

    return Promise.all(participants.map(async (participant) => {
      const unreadCount = await this.prisma.chatMessage.count({
        where: {
          conversationId: participant.conversationId,
          senderId: { not: userId },
          ...(participant.lastReadAt ? { createdAt: { gt: participant.lastReadAt } } : {}),
        }
      })

      const latestMessage = participant.conversation.messages[0]
      return {
        companyId: participant.conversation.company.id,
        companyName: participant.conversation.company.name,
        unreadCount,
        latestMessage: latestMessage ? {
          id: latestMessage.id,
          text: latestMessage.text || '',
          createdAt: latestMessage.createdAt,
          senderName: [latestMessage.sender.firstName, latestMessage.sender.lastName].filter(Boolean).join(' ') || latestMessage.sender.email,
          senderRole: latestMessage.sender.role,
        } : null,
      }
    }))
  }
}
