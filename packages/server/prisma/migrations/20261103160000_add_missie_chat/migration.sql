-- CreateEnum
CREATE TYPE "MissieMessageRole" AS ENUM ('user', 'missie');

-- CreateTable
CREATE TABLE "MissieConversation" (
    "id" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissieConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissieMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "MissieMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissieMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissieConversation_userId_updatedAt_idx" ON "MissieConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "MissieMessage_conversationId_createdAt_idx" ON "MissieMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "MissieConversation" ADD CONSTRAINT "MissieConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissieMessage" ADD CONSTRAINT "MissieMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "MissieConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

