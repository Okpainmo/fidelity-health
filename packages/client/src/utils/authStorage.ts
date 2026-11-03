// Single source of truth for the localStorage keys the auth flow reads and
// writes, so axiosBase, sessionExpiry, and authSlice never drift apart.
export const AUTH_STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userProfile: 'userProfile',
} as const;

export type AccountType = 'patient' | 'hospital';

export interface StoredUser {
  id: number;
  name: string | null;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  // Missing on sessions saved before account types existed - treat as patient.
  accountType?: AccountType;
  createdAt: string;
  updatedAt: string;
}

export function readStoredUser(): StoredUser | null {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.userProfile);
    return saved ? (JSON.parse(saved) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function hasStoredSession(): boolean {
  try {
    return Boolean(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken));
  } catch {
    return false;
  }
}

export function persistSession(session: { user: StoredUser; accessToken: string; refreshToken: string }) {
  localStorage.setItem(AUTH_STORAGE_KEYS.userProfile, JSON.stringify(session.user));
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken);
}

// The server issues fresh tokens as sessions are renewed. Call this with any
// response body that may carry them so the next request uses the latest pair.
export function persistRotatedTokens(core: { accessToken?: string | null; refreshToken?: string | null }) {
  if (core.accessToken) localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, core.accessToken);
  if (core.refreshToken) localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, core.refreshToken);
}

// Replaces the saved user (e.g. after a profile change renames the account).
export function updateStoredUser(user: StoredUser) {
  localStorage.setItem(AUTH_STORAGE_KEYS.userProfile, JSON.stringify(user));
}

export function clearAuthStorage() {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
