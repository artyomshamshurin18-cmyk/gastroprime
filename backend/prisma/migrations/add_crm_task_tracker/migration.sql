-- Add new fields to CrmTask
ALTER TABLE "CrmTask" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "CrmTask" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrmTask" ADD COLUMN IF NOT EXISTS "boardStatus" TEXT NOT NULL DEFAULT 'TODO';
ALTER TABLE "CrmTask" ADD COLUMN IF NOT EXISTS "labels" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "CrmTask" ADD COLUMN IF NOT EXISTS "parentTaskId" TEXT;

CREATE INDEX IF NOT EXISTS "CrmTask_projectId_idx" ON "CrmTask"("projectId");

-- New tables
CREATE TABLE "CrmProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT,
    "dealId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "mentions" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTaskComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTaskAttachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "commentId" TEXT,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmTaskAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTaskChecklist" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTaskChecklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTaskChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTaskChecklistItem_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE SET NULL;
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "CrmTask"("id") ON DELETE SET NULL;

ALTER TABLE "CrmProject" ADD CONSTRAINT "CrmProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE;
ALTER TABLE "CrmProject" ADD CONSTRAINT "CrmProject_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal"("id") ON DELETE SET NULL;

ALTER TABLE "CrmProjectMember" ADD CONSTRAINT "CrmProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE CASCADE;
ALTER TABLE "CrmProjectMember" ADD CONSTRAINT "CrmProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "CrmTaskComment" ADD CONSTRAINT "CrmTaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CrmTask"("id") ON DELETE CASCADE;
ALTER TABLE "CrmTaskComment" ADD CONSTRAINT "CrmTaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");

ALTER TABLE "CrmTaskAttachment" ADD CONSTRAINT "CrmTaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CrmTask"("id") ON DELETE CASCADE;
ALTER TABLE "CrmTaskAttachment" ADD CONSTRAINT "CrmTaskAttachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CrmTaskComment"("id") ON DELETE CASCADE;
ALTER TABLE "CrmTaskAttachment" ADD CONSTRAINT "CrmTaskAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");

ALTER TABLE "CrmTaskChecklist" ADD CONSTRAINT "CrmTaskChecklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CrmTask"("id") ON DELETE CASCADE;
ALTER TABLE "CrmTaskChecklistItem" ADD CONSTRAINT "CrmTaskChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "CrmTaskChecklist"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "CrmProject_companyId_idx" ON "CrmProject"("companyId");
CREATE INDEX IF NOT EXISTS "CrmProject_dealId_idx" ON "CrmProject"("dealId");

CREATE UNIQUE INDEX IF NOT EXISTS "CrmProjectMember_projectId_userId_key" ON "CrmProjectMember"("projectId", "userId");
CREATE INDEX IF NOT EXISTS "CrmProjectMember_userId_idx" ON "CrmProjectMember"("userId");

CREATE INDEX IF NOT EXISTS "CrmTaskComment_taskId_createdAt_idx" ON "CrmTaskComment"("taskId", "createdAt");
CREATE INDEX IF NOT EXISTS "CrmTaskComment_userId_idx" ON "CrmTaskComment"("userId");

CREATE INDEX IF NOT EXISTS "CrmTaskAttachment_taskId_idx" ON "CrmTaskAttachment"("taskId");
CREATE INDEX IF NOT EXISTS "CrmTaskAttachment_commentId_idx" ON "CrmTaskAttachment"("commentId");

CREATE INDEX IF NOT EXISTS "CrmTaskChecklist_taskId_idx" ON "CrmTaskChecklist"("taskId");
CREATE INDEX IF NOT EXISTS "CrmTaskChecklistItem_checklistId_idx" ON "CrmTaskChecklistItem"("checklistId");
