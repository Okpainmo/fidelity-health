import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '@/utils/axiosBase';
import type { ApiEnvelope } from '@/utils/axiosBase';
import { clearAuthStorage, hasStoredSession, persistSession, readStoredUser, updateStoredUser } from '@/utils/authStorage';
import type { AccountType, StoredUser } from '@/utils/authStorage';

// ----------------------------------------------------------------
// Types based on the `server` package's auth controllers
// (src/domains/auth/controllers/auth.logIn / auth.registerUser)
// ----------------------------------------------------------------
export type AuthUser = StoredUser;
export type { AccountType };

interface AuthResponseCore {
  userProfile: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  accountType: AccountType;
  // Patient's full name, or the institution's name for hospitals.
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// A Vite SPA has no server render to match, so the saved session can be read
// straight away (unlike the Next.js apps, which need a hydration step).
const initialState: AuthState = {
  user: readStoredUser(),
  isAuthenticated: hasStoredSession(),
  isLoading: false,
  error: null,
};

// ----------------------------------------------------------------
// Async Thunks
// ----------------------------------------------------------------

function saveSession(core: AuthResponseCore) {
  persistSession({ user: core.userProfile, accessToken: core.accessToken, refreshToken: core.refreshToken });
}

export const handleLogin = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiEnvelope<AuthResponseCore>>('/auth/log-in', credentials);
      const data = response.data;

      if (data.error || !data.response) {
        return rejectWithValue(data.error || data.responseMessage || 'Login failed');
      }

      saveSession(data.response);
      return data.response.userProfile;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'An error occurred during login'));
    }
  },
);

export const handleSignup = createAsyncThunk<AuthUser, SignupPayload, { rejectValue: string }>(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiEnvelope<AuthResponseCore>>('/auth/register', payload);
      const data = response.data;

      if (data.error || !data.response) {
        return rejectWithValue(data.error || data.responseMessage || 'Sign-up failed');
      }

      saveSession(data.response);
      return data.response.userProfile;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'An error occurred during sign-up'));
    }
  },
);

// ----------------------------------------------------------------
// Slice Definition
// ----------------------------------------------------------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // The server has no log-out endpoint yet, so logging out only clears the
    // local session. Also used when a request finds the session has expired.
    logout: (state) => {
      clearAuthStorage();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    // The server returned an updated account (e.g. a profile save changed the name).
    userUpdated: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      updateStoredUser(action.payload);
    },
    forceLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleLogin.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(handleSignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleSignup.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(handleSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Sign-up failed';
      });
  },
});

export const { clearAuthError, logout, forceLoggedOut, userUpdated } = authSlice.actions;

// The signed-in account's type. Sessions from before account types existed
// count as patients.
export const selectAccountType = (state: { auth: AuthState }): AccountType => state.auth.user?.accountType ?? 'patient';

export default authSlice.reducer;
