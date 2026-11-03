import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AUTH_STORAGE_KEYS, persistRotatedTokens, readStoredUser } from '@/utils/authStorage';
import { handleSessionExpiry, isSessionExpiryError } from '@/utils/sessionExpiry';

const DEFAULT_API_URL_BASE = 'http://localhost:5000/api/v1';

// Shared response envelope used by every `server` endpoint.
export interface ApiEnvelope<T> {
  responseMessage: string;
  response?: T | null;
  error?: string | null;
}

// Every API instance shares the same session handling, just pointed at a
// different base URL - add more instances here as the server grows.
export function createApiInstance(baseURL: string) {
  // `withCredentials` sends the server's http-only auth cookie on every request.
  const instance = axios.create({ baseURL, withCredentials: true });

  // ── Request interceptor ──────────────────────────────────────────────────
  // The server's sessions middleware needs `email` and `Authorization` headers
  // on protected routes (on top of the auth cookie). Public routes
  // (log-in/register) simply have nothing in storage yet.
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
      const email = readStoredUser()?.email;

      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      if (email) config.headers.email = email;

      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // ── Response interceptor ─────────────────────────────────────────────────
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const core = response.data?.response;
      if (core && typeof core === 'object') persistRotatedTokens(core);
      return response;
    },
    (error: AxiosError) => {
      if (isSessionExpiryError(error)) handleSessionExpiry();
      return Promise.reject(error);
    },
  );

  return instance;
}

// The server's validateData middleware answers bad input with
// `{ error: 'ZodError(...)', responseMessage: <ZodError object> }`.
interface ZodErrorBody {
  issues?: { message?: string }[];
}

/** Turns any thrown request error into a readable message. */
export function extractErrorMessage(err: unknown, fallback: string): string {
  const error = err as AxiosError<{ responseMessage?: string | ZodErrorBody; error?: string | null }>;
  const data = error.response?.data;

  if (!error.response) {
    return `Can't reach the server at ${error.config?.baseURL ?? 'the API'}. Is it running?`;
  }

  // Validation failure: show the first field-level reason, not the label.
  if (data && typeof data.responseMessage === 'object') {
    const issue = data.responseMessage.issues?.find((item) => item.message)?.message;
    if (issue) return issue;
  }

  // The server puts the readable message in `responseMessage` and a code
  // (e.g. FORBIDDEN, NOT_FOUND) or raw detail in `error`, so prefer the message.
  return (typeof data?.responseMessage === 'string' ? data.responseMessage : '') || data?.error || fallback;
}

export const API_URL_BASE = import.meta.env.VITE_API_URL_BASE || DEFAULT_API_URL_BASE;

const axiosInstance = createApiInstance(API_URL_BASE);

export default axiosInstance;
