-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENCY_MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AgencyPlan" AS ENUM ('STARTER', 'GROWTH', 'SCALE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('PENDING', 'QR_READY', 'CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "FlowStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'PAUSED');

-- CreateEnum
CREATE TYPE "BotProvider" AS ENUM ('EVOLUTION_BOT', 'TYPEBOT');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "BotSessionStatus" AS ENUM ('OPEN', 'CLOSED', 'ERROR');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('EVOLUTION', 'EVOLUTION_BOT', 'TYPEBOT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AGENCY_ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "agencyId" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "AgencyPlan" NOT NULL DEFAULT 'STARTER',
    "maxClients" INTEGER NOT NULL DEFAULT 10,
    "maxInstances" INTEGER NOT NULL DEFAULT 10,
    "billingEmail" TEXT,
    "brandName" TEXT,
    "brandLogoUrl" TEXT,
    "primaryColor" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "whatsappNumber" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyIntegration" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "name" TEXT,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolutionInstance" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'PENDING',
    "lastQrCode" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvolutionInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypebotFlow" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "FlowStatus" NOT NULL DEFAULT 'DRAFT',
    "provider" "BotProvider" NOT NULL DEFAULT 'TYPEBOT',
    "typebotId" TEXT,
    "typebotWorkspaceId" TEXT,
    "editorUrl" TEXT,
    "publishedUrl" TEXT,
    "evolutionBotId" TEXT,
    "evolutionBotApiUrl" TEXT,
    "evolutionBotApiKey" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'all',
    "triggerOperator" TEXT,
    "triggerValue" TEXT,
    "keepOpen" BOOLEAN NOT NULL DEFAULT false,
    "stopBotFromMe" BOOLEAN NOT NULL DEFAULT true,
    "listeningFromMe" BOOLEAN NOT NULL DEFAULT false,
    "debounceTime" INTEGER NOT NULL DEFAULT 1,
    "delayMessage" INTEGER NOT NULL DEFAULT 1000,
    "unknownMessage" TEXT NOT NULL DEFAULT 'Nao entendi. Pode reformular?',
    "keywordFinish" TEXT NOT NULL DEFAULT '#sair',
    "expire" INTEGER NOT NULL DEFAULT 300,
    "splitMessages" BOOLEAN NOT NULL DEFAULT true,
    "timePerChar" INTEGER NOT NULL DEFAULT 35,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypebotFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFlowLink" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFlowLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotSession" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "linkId" TEXT,
    "remoteJid" TEXT,
    "pushName" TEXT,
    "status" "BotSessionStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "Agency_ownerId_idx" ON "Agency"("ownerId");

-- CreateIndex
CREATE INDEX "Client_agencyId_idx" ON "Client"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_agencyId_whatsappNumber_key" ON "Client"("agencyId", "whatsappNumber");

-- CreateIndex
CREATE INDEX "AgencyIntegration_agencyId_idx" ON "AgencyIntegration"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyIntegration_agencyId_type_key" ON "AgencyIntegration"("agencyId", "type");

-- CreateIndex
CREATE INDEX "EvolutionInstance_clientId_idx" ON "EvolutionInstance"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionInstance_agencyId_instanceName_key" ON "EvolutionInstance"("agencyId", "instanceName");

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionInstance_clientId_key" ON "EvolutionInstance"("clientId");

-- CreateIndex
CREATE INDEX "TypebotFlow_agencyId_idx" ON "TypebotFlow"("agencyId");

-- CreateIndex
CREATE INDEX "ClientFlowLink_instanceId_idx" ON "ClientFlowLink"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientFlowLink_clientId_flowId_key" ON "ClientFlowLink"("clientId", "flowId");

-- CreateIndex
CREATE INDEX "BotSession_agencyId_idx" ON "BotSession"("agencyId");

-- CreateIndex
CREATE INDEX "BotSession_clientId_idx" ON "BotSession"("clientId");

-- CreateIndex
CREATE INDEX "BotSession_linkId_idx" ON "BotSession"("linkId");

-- CreateIndex
CREATE INDEX "BotSession_remoteJid_idx" ON "BotSession"("remoteJid");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");

-- CreateIndex
CREATE INDEX "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyIntegration" ADD CONSTRAINT "AgencyIntegration_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionInstance" ADD CONSTRAINT "EvolutionInstance_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolutionInstance" ADD CONSTRAINT "EvolutionInstance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotFlow" ADD CONSTRAINT "TypebotFlow_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFlowLink" ADD CONSTRAINT "ClientFlowLink_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFlowLink" ADD CONSTRAINT "ClientFlowLink_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "TypebotFlow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFlowLink" ADD CONSTRAINT "ClientFlowLink_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "EvolutionInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotSession" ADD CONSTRAINT "BotSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotSession" ADD CONSTRAINT "BotSession_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ClientFlowLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

