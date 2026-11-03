import { z } from 'zod';
import { date, email, number, text } from '../../../utils/zodFields.js';

/* Request bodies for PATCH /api/v1/user/me/profile - one schema per account type.
   Every field is optional (send only what changed). Empty strings clear a field
   (stored as null). Unknown keys are rejected, so typos surface as errors. */

// Missie chat setting, stored on both profile types.
const chatMode = z.enum(['direct', 'stream-response']).optional();

const stringList = (maxItems: number) => z.array(z.string().trim().min(1).max(100)).max(maxItems).optional();

export const patientProfileUpdateSchema = z
  .object({
    // Personal details
    title: text(20),
    firstName: text(60),
    middleName: text(60),
    lastName: text(60),
    preferredName: text(60),
    dateOfBirth: date,
    sexAtBirth: text(20),
    maritalStatus: text(30),
    nationality: text(60),
    preferredLanguage: text(60),
    occupation: text(100),
    idType: text(40),
    idNumber: text(60),

    // Contact and address
    phone: text(30),
    altPhone: text(30),
    contactEmail: email,
    address1: text(),
    address2: text(),
    city: text(100),
    region: text(100),
    postalCode: text(20),
    country: text(60),

    // Next of kin and emergency contact
    kinName: text(120),
    kinRelationship: text(40),
    kinPhone: text(30),
    kinEmail: email,
    kinAddress: text(),
    emergencySameAsKin: z.boolean().optional(),
    emergencyName: text(120),
    emergencyRelationship: text(40),
    emergencyPhone: text(30),

    // Insurance and payment
    paymentType: text(40),
    insuranceProvider: text(120),
    policyNumber: text(60),
    groupNumber: text(60),
    policyHolder: text(120),
    holderRelationship: text(40),
    policyExpiry: date,

    // Health profile
    bloodGroup: text(10),
    genotype: text(10),
    heightCm: number(30, 250),
    weightKg: number(0.5, 400),
    chronicConditions: stringList(30),
    otherConditions: text(500),
    pastSurgeries: text(2000),
    familyHistory: text(2000),
    smoking: text(20),
    alcohol: text(20),
    disability: text(300),
    pregnancy: text(30),

    // Allergies and medications
    noKnownAllergies: z.boolean().optional(),
    allergies: z
      .array(z.object({ allergen: z.string().trim().min(1).max(120), reaction: text(200), severity: text(30) }))
      .max(30)
      .optional(),
    medications: z
      .array(z.object({ name: z.string().trim().min(1).max(160), dose: text(80), frequency: text(80) }))
      .max(40)
      .optional(),

    chatMode
  })
  .strict();

export const hospitalProfileUpdateSchema = z
  .object({
    // Institution details. `institutionName` updates the account's name.
    institutionName: z.string().trim().min(2, 'Institution name is too short.').max(100).optional(),
    institutionType: text(60),
    ownership: text(60),
    licenceNumber: text(80),
    licenceExpiry: date,
    yearEstablished: number(1800, new Date().getFullYear(), true),
    beds: number(0, 100000, true),
    accreditation: text(200),

    // Location and contact
    address1: text(),
    address2: text(),
    city: text(100),
    region: text(100),
    postalCode: text(20),
    country: text(60),
    phone: text(30),
    emergencyPhone: text(30),
    contactEmail: email,
    website: z
      .union([z.string().trim().url('Enter a full web address, starting with https://'), z.literal('')])
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .optional(),

    // Services
    departments: stringList(40),
    otherServices: text(500),
    emrSystem: text(120),

    // Records and data protection contacts
    recordsAdminName: text(120),
    recordsAdminRole: text(120),
    recordsAdminEmail: email,
    recordsAdminPhone: text(30),
    dpoName: text(120),
    dpoEmail: email,
    dpoPhone: text(30),

    chatMode
  })
  .strict();

export type PatientProfileUpdate = z.infer<typeof patientProfileUpdateSchema>;
export type HospitalProfileUpdate = z.infer<typeof hospitalProfileUpdateSchema>;
