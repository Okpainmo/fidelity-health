-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "chatMode" TEXT NOT NULL DEFAULT 'stream-response';

-- AlterTable
ALTER TABLE "HospitalProfile" ADD COLUMN     "chatMode" TEXT NOT NULL DEFAULT 'stream-response';

