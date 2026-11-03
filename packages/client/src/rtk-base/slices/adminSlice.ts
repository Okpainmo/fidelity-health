import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '@/utils/axiosBase';
import type { ApiEnvelope } from '@/utils/axiosBase';
import type { AccountType } from '@/utils/authStorage';
import { forceLoggedOut, logout } from './authSlice';
import type { RecordStatus, RecordSummary } from './recordsSlice';

// ----------------------------------------------------------------
// Admin dashboard (server: /api/v1/admin, admins only).
// ----------------------------------------------------------------
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface AdminHospital {
  userId: number;
  institutionId: string;
  name: string;
  email: string;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  institutionType: string | null;
  city: string | null;
  region: string | null;
  licenceNumber: string | null;
  recordCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  accountType: AccountType;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publicId: string | null;
  verificationStatus: VerificationStatus | null;
  recordCount: number;
}

export interface AdminOverview {
  users: { patients: number; hospitals: number; admins: number; inactive: number; total: number; signupsLast30Days: number };
  hospitals: Record<VerificationStatus, number>;
  records: Record<RecordStatus, number> & { total: number; lastThirtyDays: number };
  pendingHospitals: AdminHospital[];
  recentRecords: RecordSummary[];
}

type Account = Omit<AdminUser, 'publicId' | 'verificationStatus' | 'recordCount'>;

// One account with its full profile (patient or hospital fields, serialized as on /profile).
export interface AdminAccountDetail {
  user: Account;
  recordCount: number;
  profile: Record<string, unknown> | null;
}

interface AdminState {
  overview: AdminOverview | null;
  hospitals: AdminHospital[];
  users: AdminUser[];
  records: RecordSummary[];
  // Opened institutions / users, by user id.
  hospitalDetails: Record<number, AdminAccountDetail>;
  userDetails: Record<number, AdminAccountDetail>;
  loading: Partial<Record<'overview' | 'hospitals' | 'users' | 'records' | 'detail', boolean>>;
  error: string | null;
  actionPending: boolean;
  actionError: string | null;
}

const initialState: AdminState = {
  overview: null,
  hospitals: [],
  users: [],
  records: [],
  hospitalDetails: {},
  userDetails: {},
  loading: {},
  error: null,
  actionPending: false,
  actionError: null,
};

type Filters = Record<string, string | undefined>;
const clean = (filters: Filters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

async function getResponse<T>(url: string, params?: Filters): Promise<T> {
  const { data } = await axiosInstance.get<ApiEnvelope<T>>(url, { params: params ? clean(params) : undefined });
  if (!data.response) throw new Error(data.responseMessage || 'Request failed');
  return data.response;
}

export const fetchAdminOverview = createAsyncThunk<AdminOverview, void, { rejectValue: string }>('admin/overview', async (_, { rejectWithValue }) => {
  try {
    return (await getResponse<{ overview: AdminOverview }>('/admin/overview')).overview;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not load the overview'));
  }
});

export const fetchAdminHospitals = createAsyncThunk<AdminHospital[], { status?: string; q?: string }, { rejectValue: string }>(
  'admin/hospitals',
  async (filters, { rejectWithValue }) => {
    try {
      return (await getResponse<{ hospitals: AdminHospital[] }>('/admin/hospitals', filters)).hospitals;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not load institutions'));
    }
  },
);

export const fetchAdminHospital = createAsyncThunk<AdminAccountDetail, number, { rejectValue: string }>('admin/hospital', async (userId, { rejectWithValue }) => {
  try {
    return (await getResponse<{ hospital: AdminAccountDetail }>(`/admin/hospitals/${userId}`)).hospital;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not load this institution'));
  }
});

export const setHospitalVerification = createAsyncThunk<AdminAccountDetail, { userId: number; status: VerificationStatus; note?: string }, { rejectValue: string }>(
  'admin/setVerification',
  async ({ userId, status, note }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<ApiEnvelope<{ hospital: AdminAccountDetail }>>(`/admin/hospitals/${userId}/verification`, note ? { status, note } : { status });
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not update verification');
      return data.response.hospital;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not update verification'));
    }
  },
);

export const fetchAdminUsers = createAsyncThunk<AdminUser[], { type?: string; status?: string; q?: string }, { rejectValue: string }>(
  'admin/users',
  async (filters, { rejectWithValue }) => {
    try {
      return (await getResponse<{ users: AdminUser[] }>('/admin/users', filters)).users;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not load users'));
    }
  },
);

export const fetchAdminUser = createAsyncThunk<AdminAccountDetail, number, { rejectValue: string }>('admin/user', async (userId, { rejectWithValue }) => {
  try {
    return await getResponse<AdminAccountDetail>(`/admin/users/${userId}`);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not load this user'));
  }
});

export const setUserActive = createAsyncThunk<AdminAccountDetail, { userId: number; isActive: boolean }, { rejectValue: string }>(
  'admin/setUserActive',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<ApiEnvelope<AdminAccountDetail>>(`/admin/users/${userId}/status`, { isActive });
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not update this account');
      return data.response;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not update this account'));
    }
  },
);

export const fetchAdminRecords = createAsyncThunk<RecordSummary[], { status?: string; q?: string }, { rejectValue: string }>(
  'admin/records',
  async (filters, { rejectWithValue }) => {
    try {
      return (await getResponse<{ records: RecordSummary[] }>('/admin/records', filters)).records;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not load records'));
    }
  },
);

const LOADERS = [
  [fetchAdminOverview, 'overview'],
  [fetchAdminHospitals, 'hospitals'],
  [fetchAdminUsers, 'users'],
  [fetchAdminRecords, 'records'],
  [fetchAdminHospital, 'detail'],
  [fetchAdminUser, 'detail'],
] as const;

// Keeps list rows in step after an action on one account.
function syncAccount(state: AdminState, detail: AdminAccountDetail) {
  const { user, profile } = detail;
  const verificationStatus = (profile?.verificationStatus as VerificationStatus | undefined) ?? null;

  const hospital = state.hospitals.find((row) => row.userId === user.id);
  if (hospital) {
    hospital.isActive = user.isActive;
    if (verificationStatus) hospital.verificationStatus = verificationStatus;
  }
  const account = state.users.find((row) => row.id === user.id);
  if (account) {
    account.isActive = user.isActive;
    if (verificationStatus) account.verificationStatus = verificationStatus;
  }
  if (user.accountType === 'hospital') state.hospitalDetails[user.id] = detail;
  state.userDetails[user.id] = detail;
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOverview.fulfilled, (state, { payload }) => {
        state.overview = payload;
      })
      .addCase(fetchAdminHospitals.fulfilled, (state, { payload }) => {
        state.hospitals = payload;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.users = payload;
      })
      .addCase(fetchAdminRecords.fulfilled, (state, { payload }) => {
        state.records = payload;
      })
      .addCase(fetchAdminHospital.fulfilled, (state, { payload }) => {
        state.hospitalDetails[payload.user.id] = payload;
      })
      .addCase(fetchAdminUser.fulfilled, (state, { payload }) => {
        state.userDetails[payload.user.id] = payload;
      })
      .addCase(setHospitalVerification.fulfilled, (state, { payload }) => syncAccount(state, payload))
      .addCase(setUserActive.fulfilled, (state, { payload }) => syncAccount(state, payload))
      .addCase(logout, () => initialState)
      .addCase(forceLoggedOut, () => initialState);

    // Loading flags and errors for the fetches.
    for (const [thunk, key] of LOADERS) {
      builder
        .addMatcher(isPending(thunk), (state) => {
          state.loading[key] = true;
          state.error = null;
        })
        .addMatcher(isFulfilled(thunk), (state) => {
          state.loading[key] = false;
        })
        .addMatcher(isRejected(thunk), (state, action) => {
          state.loading[key] = false;
          state.error = (action.payload as string | undefined) ?? 'Something went wrong';
        });
    }

    // Pending / error state for the two actions.
    builder
      .addMatcher(isPending(setHospitalVerification, setUserActive), (state) => {
        state.actionPending = true;
        state.actionError = null;
      })
      .addMatcher(isFulfilled(setHospitalVerification, setUserActive), (state) => {
        state.actionPending = false;
      })
      .addMatcher(isRejected(setHospitalVerification, setUserActive), (state, action) => {
        state.actionPending = false;
        state.actionError = (action.payload as string | undefined) ?? 'Something went wrong';
      });
  },
});

export const { clearAdminActionError } = adminSlice.actions;

export default adminSlice.reducer;
