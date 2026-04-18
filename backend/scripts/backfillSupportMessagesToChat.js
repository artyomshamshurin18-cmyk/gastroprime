const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const INTERNAL_ROLES = ['ADMIN', 'SUPERADMIN', 'MANAGER']

async function main() {
  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      company: { select: { id: true, name: true } },
      user: { select: { id: true, role: true, status: true } },
    },
  })

  if (!messages.length) {
    console.log('No support messages to backfill')
    return
  }

  const internalUsers = await prisma.user.findMany({
    where: {
      role: { in: INTERNAL_ROLES },
      status: { not: 'DISMISSED' },
    },
    select: { id: true },
  })
  const internalUserIds = new Set(internalUsers.map((user) => user.id))

  const conversationIds = new Map()
  for (const message of messages) {
    if (!conversationIds.has(message.companyId)) {
      const conversation = await prisma.chatConversation.upsert({
        where: {
          companyId_type: {
            companyId: message.companyId,
            type: 'COMPANY_SUPPORT',
          },
        },
        update: {},
        create: {
          companyId: message.companyId,
          type: 'COMPANY_SUPPORT',
          title: `Чат ${message.company?.name || message.companyId}`,
        },
        select: { id: true },
      })
      conversationIds.set(message.companyId, conversation.id)

      if (internalUsers.length) {
        await prisma.chatParticipant.createMany({
          data: internalUsers.map((user) => ({
            conversationId: conversation.id,
            userId: user.id,
            canManageParticipants: true,
          })),
          skipDuplicates: true,
        })
      }
    }

    const conversationId = conversationIds.get(message.companyId)
    await prisma.chatParticipant.createMany({
      data: [{
        conversationId,
        userId: message.userId,
        canManageParticipants: internalUserIds.has(message.userId),
      }],
      skipDuplicates: true,
    })

    await prisma.chatMessage.upsert({
      where: { id: message.id },
      update: {},
      create: {
        id: message.id,
        conversationId,
        senderId: message.userId,
        text: message.text,
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
      },
    })
  }

  console.log(`Backfilled ${messages.length} support messages into chat v2`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
