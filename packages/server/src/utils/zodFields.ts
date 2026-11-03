import { z } from 'zod';

/* Reusable Zod field validators for request bodies (profiles, records).
   Optional fields accept '' to mean "clear it" and store null. */

// Optional free text: trimmed, '' -> null.
export const text = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional();

// Required free text: trimmed, not empty.
export const requiredText = (label: string, max = 200) =>
  z
    .string({ required_error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const email = z
  .union([z.string().trim().email('Enter a valid email address.'), z.literal('')])
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional();

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const toDate = (value: string) => new Date(`${value}T00:00:00Z`);

// Optional 'YYYY-MM-DD' -> Date (UTC midnight), '' -> null.
export const date = z
  .union([z.string().regex(ISO_DATE, 'Use dates in YYYY-MM-DD format.'), z.literal('')])
  .transform((value) => (value === '' ? null : toDate(value)))
  .nullable()
  .optional();

// Required 'YYYY-MM-DD' -> Date.
export const requiredDate = (label: string) =>
  z
    .string({ required_error: `${label} is required.` })
    .regex(ISO_DATE, `${label}: use the YYYY-MM-DD format.`)
    .transform(toDate);

// Optional number from a number or numeric string; '' -> null.
export const number = (min: number, max: number, int = false) =>
  z.preprocess(
    (value) => (value === '' || value === null ? null : value === undefined ? undefined : Number(value)),
    (int ? z.number().int('Must be a whole number.') : z.number())
      .min(min, `Must be at least ${min}.`)
      .max(max, `Must be at most ${max}.`)
      .nullable()
      .optional()
  );

/** "field: message" for the first issue, for 400 responses. */
export function firstIssue(error: z.ZodError, fallback = 'invalid request') {
  const issue = error.issues[0];
  if (!issue) return fallback;
  const field = issue.path.join('.');
  return field ? `${field}: ${issue.message}` : issue.message;
}
