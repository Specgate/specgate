CREATE TYPE "BillingProviderKind" AS ENUM ('STRIPE');
CREATE TYPE "BillingSubscriptionStatus" AS ENUM (
  'FREE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'INCOMPLETE',
  'UNPAID'
);
CREATE TYPE "BillingTrialStatus" AS ENUM (
  'ACTIVE',
  'EXPIRED',
  'SUPERSEDED_BY_SUBSCRIPTION'
);
CREATE TYPE "BillingProviderEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

CREATE TABLE "BillingAccount" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "provider" "BillingProviderKind",
  "providerCustomerRef" TEXT,
  "billingCurrency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
  "email" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingSubscription" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "productKey" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "planCode" TEXT NOT NULL,
  "provider" "BillingProviderKind",
  "providerSubscriptionRef" TEXT,
  "providerPriceRef" TEXT,
  "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'FREE',
  "currentPeriodStart" TIMESTAMPTZ(6),
  "currentPeriodEnd" TIMESTAMPTZ(6),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMPTZ(6),
  "trialEndsAt" TIMESTAMPTZ(6),
  "rawSnapshotJson" JSONB,
  "lastSyncedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingTrial" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "productKey" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "planCode" TEXT NOT NULL,
  "status" "BillingTrialStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMPTZ(6) NOT NULL,
  "endsAt" TIMESTAMPTZ(6) NOT NULL,
  "expiredAt" TIMESTAMPTZ(6),
  "supersededAt" TIMESTAMPTZ(6),
  "activatedByUserId" TEXT,
  "source" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "BillingTrial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingUsageCounter" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "productKey" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "periodStart" TIMESTAMPTZ(6) NOT NULL,
  "periodEnd" TIMESTAMPTZ(6) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "BillingUsageCounter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingProviderEvent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountId" TEXT,
  "provider" "BillingProviderKind" NOT NULL,
  "externalEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "status" "BillingProviderEventStatus" NOT NULL DEFAULT 'RECEIVED',
  "errorMessage" TEXT,
  "processedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "BillingProviderEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingAccount_tenantId_key" ON "BillingAccount"("tenantId");
CREATE INDEX "BillingAccount_provider_providerCustomerRef_idx" ON "BillingAccount"("provider", "providerCustomerRef");
CREATE INDEX "BillingSubscription_accountId_idx" ON "BillingSubscription"("accountId");
CREATE INDEX "BillingSubscription_tenantId_productKey_status_idx" ON "BillingSubscription"("tenantId", "productKey", "status");
CREATE UNIQUE INDEX "BillingSubscription_tenantId_productKey_key" ON "BillingSubscription"("tenantId", "productKey");
CREATE UNIQUE INDEX "BillingSubscription_provider_providerSubscriptionRef_key" ON "BillingSubscription"("provider", "providerSubscriptionRef");
CREATE INDEX "BillingTrial_status_endsAt_idx" ON "BillingTrial"("status", "endsAt");
CREATE INDEX "BillingTrial_accountId_idx" ON "BillingTrial"("accountId");
CREATE UNIQUE INDEX "BillingTrial_tenantId_productKey_key" ON "BillingTrial"("tenantId", "productKey");
CREATE INDEX "BillingUsageCounter_tenantId_productKey_metricKey_idx" ON "BillingUsageCounter"("tenantId", "productKey", "metricKey");
CREATE UNIQUE INDEX "BillingUsageCounter_tenantId_productKey_metricKey_periodStart_periodEnd_key" ON "BillingUsageCounter"("tenantId", "productKey", "metricKey", "periodStart", "periodEnd");
CREATE INDEX "BillingProviderEvent_tenantId_createdAt_idx" ON "BillingProviderEvent"("tenantId", "createdAt");
CREATE INDEX "BillingProviderEvent_accountId_idx" ON "BillingProviderEvent"("accountId");
CREATE UNIQUE INDEX "BillingProviderEvent_provider_externalEventId_key" ON "BillingProviderEvent"("provider", "externalEventId");

ALTER TABLE "BillingAccount"
ADD CONSTRAINT "BillingAccount_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingSubscription"
ADD CONSTRAINT "BillingSubscription_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingSubscription"
ADD CONSTRAINT "BillingSubscription_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingTrial"
ADD CONSTRAINT "BillingTrial_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingTrial"
ADD CONSTRAINT "BillingTrial_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingUsageCounter"
ADD CONSTRAINT "BillingUsageCounter_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingProviderEvent"
ADD CONSTRAINT "BillingProviderEvent_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingProviderEvent"
ADD CONSTRAINT "BillingProviderEvent_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "BillingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
