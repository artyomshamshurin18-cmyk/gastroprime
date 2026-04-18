import { Body, Controller, Delete, Get, Param, Post, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ChatService } from './chat.service'

type UploadedChatFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('summary')
  @UseGuards(AuthGuard('jwt'))
  async getSummary(@Request() req) {
    return this.chatService.getSummary(req.user.userId)
  }

  @Get('my-company')
  @UseGuards(AuthGuard('jwt'))
  async getMyCompanyChat(@Request() req) {
    return this.chatService.getMyCompanyChat(req.user.userId)
  }

  @Post('my-company/messages')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 5))
  async sendMessageToMyCompany(@Request() req, @Body() body: { text?: string }, @UploadedFiles() files: UploadedChatFile[] = []) {
    return this.chatService.sendMessageToMyCompany(req.user.userId, body.text || '', files)
  }

  @Get('company/:companyId')
  @UseGuards(AuthGuard('jwt'))
  async getCompanyChat(@Request() req, @Param('companyId') companyId: string) {
    return this.chatService.getCompanyChat(req.user.userId, companyId)
  }

  @Post('company/:companyId/messages')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 5))
  async sendMessage(@Request() req, @Param('companyId') companyId: string, @Body() body: { text?: string }, @UploadedFiles() files: UploadedChatFile[] = []) {
    return this.chatService.sendMessage(req.user.userId, companyId, body.text || '', files)
  }

  @Post('company/:companyId/participants')
  @UseGuards(AuthGuard('jwt'))
  async addParticipant(@Request() req, @Param('companyId') companyId: string, @Body() body: { userId: string }) {
    return this.chatService.addParticipant(req.user.userId, companyId, body.userId)
  }

  @Delete('company/:companyId/participants/:participantUserId')
  @UseGuards(AuthGuard('jwt'))
  async removeParticipant(@Request() req, @Param('companyId') companyId: string, @Param('participantUserId') participantUserId: string) {
    return this.chatService.removeParticipant(req.user.userId, companyId, participantUserId)
  }

  @Post('company/:companyId/invites')
  @UseGuards(AuthGuard('jwt'))
  async createInvite(@Request() req, @Param('companyId') companyId: string, @Body() body: { label?: string, expiresInDays?: number }) {
    return this.chatService.createInvite(req.user.userId, companyId, body || {})
  }

  @Delete('company/:companyId/invites/:inviteId')
  @UseGuards(AuthGuard('jwt'))
  async revokeInvite(@Request() req, @Param('companyId') companyId: string, @Param('inviteId') inviteId: string) {
    return this.chatService.revokeInvite(req.user.userId, companyId, inviteId)
  }

  @Get('invite/:token')
  async getInvite(@Param('token') token: string) {
    return this.chatService.getInvite(token)
  }

  @Post('invite/:token/join')
  async joinInvite(@Param('token') token: string, @Body() body: { name?: string, email?: string, phone?: string }) {
    return this.chatService.joinInvite(token, body || {})
  }

  @Get('invite/session/:sessionToken')
  async getGuestConversation(@Param('sessionToken') sessionToken: string) {
    return this.chatService.getGuestConversation(sessionToken)
  }

  @Post('invite/session/:sessionToken/messages')
  @UseInterceptors(FilesInterceptor('files', 5))
  async sendGuestMessage(@Param('sessionToken') sessionToken: string, @Body() body: { text?: string }, @UploadedFiles() files: UploadedChatFile[] = []) {
    return this.chatService.sendGuestMessage(sessionToken, body.text || '', files)
  }
}
