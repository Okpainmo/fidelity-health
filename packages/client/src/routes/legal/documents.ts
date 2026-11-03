// The legal pages, in the order they appear in navigation.
export const LEGAL_LAST_UPDATED = '3 November 2026';

export const legalDocuments = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    summary: 'What information Fidelity Health and Missie collect, how it is used, and your choices.',
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    shortTitle: 'Terms',
    summary: 'The rules for using Fidelity Health and Missie, and what you can expect.',
  },
  {
    slug: 'medical-disclaimer',
    title: 'Medical Disclaimer',
    shortTitle: 'Medical disclaimer',
    summary: "Why Fidelity Health and Missie don't give medical advice, and what to do in an emergency.",
  },
  {
    slug: 'ai-use-policy',
    title: 'AI Use Policy',
    shortTitle: 'AI use',
    summary: 'How Missie uses AI, its limits, how it will handle your records, and acceptable use.',
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie & Storage Policy',
    shortTitle: 'Cookies',
    summary: 'The cookie and browser storage Fidelity Health uses to keep you signed in.',
  },
] as const;

export type LegalSlug = (typeof legalDocuments)[number]['slug'];
