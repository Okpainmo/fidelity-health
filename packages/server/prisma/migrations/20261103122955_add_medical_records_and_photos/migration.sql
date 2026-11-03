-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('outpatient', 'admission', 'discharge', 'lab', 'imaging', 'prescription', 'immunization', 'surgery', 'referral', 'other');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('pending', 'verified', 'rejected');

-- AlterTable
ALTER TABLE "HospitalProfile" ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "photoKey" TEXT;

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "patientProfileId" INTEGER NOT NULL,
    "hospitalProfileId" INTEGER NOT NULL,
    "recordType" "RecordType" NOT NULL,
    "department" TEXT NOT NULL,
    "officerName" TEXT NOT NULL,
    "officerStaffId" TEXT NOT NULL,
    "submittedOn" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "encounterDate" DATE NOT NULL,
    "clinician" TEXT NOT NULL,
    "clinicianLicence" TEXT,
    "reason" TEXT NOT NULL,
    "diagnosis" TEXT,
    "icd10" TEXT,
    "notes" TEXT NOT NULL,
    "prescribed" TEXT,
    "newAllergies" TEXT,
    "followUpDate" DATE,
    "followUpNotes" TEXT,
    "bpSystolic" INTEGER,
    "bpDiastolic" INTEGER,
    "pulse" INTEGER,
    "temperatureC" DOUBLE PRECISION,
    "spo2" INTEGER,
    "respRate" INTEGER,
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "consentMethod" TEXT NOT NULL,
    "visibleToPatient" BOOLEAN NOT NULL DEFAULT true,
    "signature" TEXT NOT NULL,
    "signedOn" DATE NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'pending',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordAttachment" (
    "id" UUID NOT NULL,
    "recordId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_number_key" ON "MedicalRecord"("number");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientProfileId_idx" ON "MedicalRecord"("patientProfileId");

-- CreateIndex
CREATE INDEX "MedicalRecord_hospitalProfileId_idx" ON "MedicalRecord"("hospitalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordAttachment_storageKey_key" ON "RecordAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "RecordAttachment_recordId_idx" ON "RecordAttachment"("recordId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_hospitalProfileId_fkey" FOREIGN KEY ("hospitalProfileId") REFERENCES "HospitalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordAttachment" ADD CONSTRAINT "RecordAttachment_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
