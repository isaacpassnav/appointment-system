-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CLIENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "refreshTokenHash" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';

