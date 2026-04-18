CREATE TABLE "ChatInvite" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatInviteGuest" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "ChatInviteGuest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatInvite_token_key" ON "ChatInvite"("token");
CREATE UNIQUE INDEX "ChatInviteGuest_userId_key" ON "ChatInviteGuest"("userId");
CREATE UNIQUE INDEX "ChatInviteGuest_accessToken_key" ON "ChatInviteGuest"("accessToken");
CREATE INDEX "ChatInvite_conversationId_revokedAt_idx" ON "ChatInvite"("conversationId", "revokedAt");
CREATE INDEX "ChatInvite_companyId_revokedAt_idx" ON "ChatInvite"("companyId", "revokedAt");
CREATE INDEX "ChatInviteGuest_inviteId_idx" ON "ChatInviteGuest"("inviteId");

ALTER TABLE "ChatInvite" ADD CONSTRAINT "ChatInvite_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatInvite" ADD CONSTRAINT "ChatInvite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatInvite" ADD CONSTRAINT "ChatInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatInviteGuest" ADD CONSTRAINT "ChatInviteGuest_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "ChatInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatInviteGuest" ADD CONSTRAINT "ChatInviteGuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
