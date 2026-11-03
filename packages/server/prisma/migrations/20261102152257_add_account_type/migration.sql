-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('patient', 'hospital');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'patient';
