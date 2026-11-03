import type { ProfileData } from '@/rtk-base/slices/profileSlice';

// Read saved profile values safely as form defaults.
export type ProfileValues = ProfileData | null | undefined;

export function str(values: ProfileValues, key: string): string {
  const value = values?.[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export function list(values: ProfileValues, key: string): string[] {
  const value = values?.[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function bool(values: ProfileValues, key: string, fallback: boolean): boolean {
  const value = values?.[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function rows<T extends Record<string, unknown>>(values: ProfileValues, key: string): T[] {
  const value = values?.[key];
  return Array.isArray(value) ? value.filter((item): item is T => typeof item === 'object' && item !== null) : [];
}
