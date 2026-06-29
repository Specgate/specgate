-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workflow";

-- CreateEnum
CREATE TYPE "workflow"."OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "workflow"."OutboxEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "eventType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" "workflow"."OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedBy" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."DomainEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."IdempotencyKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "actionKey" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "requestHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "responseJson" TEXT,
    "responseStatus" INTEGER,
    "statusCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_availableAt_idx" ON "workflow"."OutboxEvent"("tenantId", "status", "availableAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_availableAt_lockedUntil_createdAt_idx" ON "workflow"."OutboxEvent"("status", "availableAt", "lockedUntil", "createdAt");

-- CreateIndex
CREATE INDEX "DomainEvent_tenantId_eventType_idx" ON "workflow"."DomainEvent"("tenantId", "eventType");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entity_entityId_idx" ON "workflow"."AuditLog"("tenantId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "workflow"."AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "IdempotencyKey_tenantId_actionKey_idx" ON "workflow"."IdempotencyKey"("tenantId", "actionKey");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_tenantId_actionKey_key_key" ON "workflow"."IdempotencyKey"("tenantId", "actionKey", "key");
