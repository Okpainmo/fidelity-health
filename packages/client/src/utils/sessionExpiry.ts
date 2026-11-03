import type { AxiosError } from 'axios';
import { clearAuthStorage, hasStoredSession } from '@/utils/authStorage';

// Fired on `window` when a protected request proves the session is gone.
// The listener in rtk-base/provider.tsx turns it into `forceLoggedOut()`, and
// the route guard then sends the user to /login.
export const SESSION_EXPIRED_EVENT = 'app:session-expired';

function isPublicAuthRequest(url?: string) {
  return Boolean(url?.includes('/auth/'));
}

/** True when an API error means the stored session is no longer valid. */
export function isSessionExpiryError(error: AxiosError): boolean {
  if (!hasStoredSession() || isPublicAuthRequest(error.config?.url)) return false;
  return error.response?.status === 401;
}

let isHandlingSessionExpiry = false;

export function handleSessionExpiry() {
  if (isHandlingSessionExpiry) return;
  isHandlingSessionExpiry = true;

  clearAuthStorage();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

  // Let the next session expire cleanly too.
  queueMicrotask(() => {
    isHandlingSessionExpiry = false;
  });
}
