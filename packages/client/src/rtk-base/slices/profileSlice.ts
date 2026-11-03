import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '@/utils/axiosBase';
import type { ApiEnvelope } from '@/utils/axiosBase';
import type { AccountType, StoredUser } from '@/utils/authStorage';
import { forceLoggedOut, logout } from './authSlice';

// ----------------------------------------------------------------
// The signed-in account's own patient or hospital profile
// (server: GET / PATCH /api/v1/user/me/profile). Field names match the
// server's PatientProfile / HospitalProfile models; dates are YYYY-MM-DD.
// ----------------------------------------------------------------
export type ProfileData = Record<string, unknown>;

interface ProfileResponseCore {
  accountType: AccountType;
  profile: ProfileData;
}

interface SaveProfileResponseCore extends ProfileResponseCore {
  userProfile: StoredUser;
}

interface ProfileState {
  accountType: AccountType | null;
  data: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  saveError: string | null;
  savedAt: string | null;
}

const initialState: ProfileState = {
  accountType: null,
  data: null,
  isLoading: false,
  error: null,
  isSaving: false,
  saveError: null,
  savedAt: null,
};

export const fetchProfile = createAsyncThunk<ProfileResponseCore, void, { rejectValue: string }>('profile/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiEnvelope<ProfileResponseCore>>('/user/me/profile');
    const data = response.data;
    if (!data.response) return rejectWithValue(data.responseMessage || 'Could not load your profile');
    return data.response;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'An error occurred while loading your profile'));
  }
});

// Resolves with the updated account so the caller can refresh the signed-in user.
export const saveProfile = createAsyncThunk<SaveProfileResponseCore, ProfileData, { rejectValue: string }>(
  'profile/save',
  async (changes, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<ApiEnvelope<SaveProfileResponseCore>>('/user/me/profile', changes);
      const data = response.data;
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not save your profile');
      return data.response;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'An error occurred while saving your profile'));
    }
  },
);

// Patient passport photo (server: PUT / DELETE /user/me/profile/photo). Resolves with the new signed URL (or null).
export const uploadProfilePhoto = createAsyncThunk<string | null, File, { rejectValue: string }>('profile/uploadPhoto', async (file, { rejectWithValue }) => {
  try {
    const body = new FormData();
    body.append('photo', file, file.name);
    const { data } = await axiosInstance.put<ApiEnvelope<{ photoUrl: string | null }>>('/user/me/profile/photo', body);
    return data.response?.photoUrl ?? null;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not upload your photo'));
  }
});

export const removeProfilePhoto = createAsyncThunk<null, void, { rejectValue: string }>('profile/removePhoto', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete('/user/me/profile/photo');
    return null;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not remove your photo'));
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileSaveStatus: (state) => {
      state.saveError = null;
      state.savedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accountType = action.payload.accountType;
        state.data = action.payload.profile;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Could not load your profile';
      })
      .addCase(saveProfile.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
        state.savedAt = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.data = action.payload.profile;
        state.savedAt = new Date().toISOString();
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload || 'Could not save your profile';
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        if (state.data) state.data.photoUrl = action.payload;
      })
      .addCase(removeProfilePhoto.fulfilled, (state) => {
        if (state.data) state.data.photoUrl = null;
      })
      // Profiles belong to the signed-in account.
      .addCase(logout, () => initialState)
      .addCase(forceLoggedOut, () => initialState);
  },
});

export const { clearProfileSaveStatus } = profileSlice.actions;

export default profileSlice.reducer;
