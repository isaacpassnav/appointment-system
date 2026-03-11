-- Extend UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RESELLER';

-- Create new enums
CREATE TYPE "TenantRole" AS ENUM ('BUSINESS_ADMIN', 'STAFF', 'CLIENT');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "TenantMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- Create Tenant table
CREATE TABLE "Tenant" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
  "resellerId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE INDEX "Tenant_resellerId_idx" ON "Tenant"("resellerId");

-- Create TenantMember table
CREATE TABLE "TenantMember" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" "TenantRole" NOT NULL,
  "status" "TenantMemberStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TenantMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantMember_tenantId_userId_key" ON "TenantMember"("tenantId", "userId");
CREATE INDEX "TenantMember_userId_tenantId_idx" ON "TenantMember"("userId", "tenantId");
CREATE INDEX "TenantMember_tenantId_role_idx" ON "TenantMember"("tenantId", "role");

-- Add tenantId to Appointment and NotificationLog
ALTER TABLE "Appointment" ADD COLUMN "tenantId" UUID;
ALTER TABLE "NotificationLog" ADD COLUMN "tenantId" UUID;

-- Insert default tenant for existing data
INSERT INTO "Tenant" ("id", "name", "slug", "status", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default-tenant', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Appointment"
SET "tenantId" = '00000000-0000-0000-0000-000000000001'
WHERE "tenantId" IS NULL;

UPDATE "NotificationLog"
SET "tenantId" = '00000000-0000-0000-0000-000000000001'
WHERE "tenantId" IS NULL;

ALTER TABLE "Appointment" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "NotificationLog" ALTER COLUMN "tenantId" SET NOT NULL;

-- Foreign keys
ALTER TABLE "Tenant"
  ADD CONSTRAINT "Tenant_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TenantMember"
  ADD CONSTRAINT "TenantMember_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantMember"
  ADD CONSTRAINT "TenantMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationLog"
  ADD CONSTRAINT "NotificationLog_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for tenant scoping
CREATE INDEX "Appointment_tenantId_startsAt_idx" ON "Appointment"("tenantId", "startsAt");
CREATE INDEX "Appointment_tenantId_status_idx" ON "Appointment"("tenantId", "status");
CREATE INDEX "NotificationLog_tenantId_status_idx" ON "NotificationLog"("tenantId", "status");
