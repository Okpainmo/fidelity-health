-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fhId" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "preferredName" TEXT,
    "dateOfBirth" DATE,
    "sexAtBirth" TEXT,
    "maritalStatus" TEXT,
    "nationality" TEXT,
    "preferredLanguage" TEXT,
    "occupation" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "contactEmail" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "kinName" TEXT,
    "kinRelationship" TEXT,
    "kinPhone" TEXT,
    "kinEmail" TEXT,
    "kinAddress" TEXT,
    "emergencySameAsKin" BOOLEAN NOT NULL DEFAULT true,
    "emergencyName" TEXT,
    "emergencyRelationship" TEXT,
    "emergencyPhone" TEXT,
    "paymentType" TEXT,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "groupNumber" TEXT,
    "policyHolder" TEXT,
    "holderRelationship" TEXT,
    "policyExpiry" DATE,
    "bloodGroup" TEXT,
    "genotype" TEXT,
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "chronicConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "otherConditions" TEXT,
    "pastSurgeries" TEXT,
    "familyHistory" TEXT,
    "smoking" TEXT,
    "alcohol" TEXT,
    "disability" TEXT,
    "pregnancy" TEXT,
    "noKnownAllergies" BOOLEAN NOT NULL DEFAULT false,
    "allergies" JSONB NOT NULL DEFAULT '[]',
    "medications" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "institutionId" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "institutionType" TEXT,
    "ownership" TEXT,
    "licenceNumber" TEXT,
    "licenceExpiry" DATE,
    "yearEstablished" INTEGER,
    "beds" INTEGER,
    "accreditation" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "emergencyPhone" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "departments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "otherServices" TEXT,
    "emrSystem" TEXT,
    "recordsAdminName" TEXT,
    "recordsAdminRole" TEXT,
    "recordsAdminEmail" TEXT,
    "recordsAdminPhone" TEXT,
    "dpoName" TEXT,
    "dpoEmail" TEXT,
    "dpoPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_fhId_key" ON "PatientProfile"("fhId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalProfile_userId_key" ON "HospitalProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalProfile_institutionId_key" ON "HospitalProfile"("institutionId");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalProfile" ADD CONSTRAINT "HospitalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
