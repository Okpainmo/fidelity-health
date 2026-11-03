import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RecordTypeValue } from '@/data/records';
import axiosInstance, { extractErrorMessage } from '@/utils/axiosBase';
import type { ApiEnvelope } from '@/utils/axiosBase';
import { forceLoggedOut, logout } from './authSlice';

// ----------------------------------------------------------------
// Medical records (server: /api/v1/records). Hospitals upload and review
// records for registered patients; patients see their own. Attachments are
// stored in S3 and come back as short-lived links on the record detail.
// ----------------------------------------------------------------
export type RecordStatus = 'pending' | 'verified' | 'rejected';

export interface RecordSummary {
  id: string;
  reference: string;
  recordType: RecordTypeValue;
  title: string;
  department: string;
  clinician: string;
  encounterDate: string;
  submittedOn: string;
  status: RecordStatus;
  createdAt: string;
  attachmentCount: number;
  patient: { fhId: string; name: string };
  hospital: { institutionId: string; name: string };
}

export interface RecordAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  category: string;
  // Short-lived signed links; null when file storage isn't configured.
  url: string | null;
  downloadUrl: string | null;
}

export interface RecordDetail extends Omit<RecordSummary, 'patient' | 'hospital'> {
  officerName: string;
  officerStaffId: string | null;
  clinicianLicence: string | null;
  reason: string;
  diagnosis: string | null;
  icd10: string | null;
  notes: string;
  prescribed: string | null;
  newAllergies: string | null;
  followUpDate: string | null;
  followUpNotes: string | null;
  vitals: {
    bpSystolic: number | null;
    bpDiastolic: number | null;
    pulse: number | null;
    temperatureC: number | null;
    spo2: number | null;
    respRate: number | null;
    heightCm: number | null;
    weightKg: number | null;
  };
  consentMethod: string;
  visibleToPatient: boolean;
  signature: string | null;
  signedOn: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  attachments: RecordAttachment[];
  patient: {
    fhId: string;
    name: string;
    dateOfBirth: string | null;
    sexAtBirth: string | null;
    phone: string | null;
    bloodGroup: string | null;
    genotype: string | null;
    allergies: string[];
    noKnownAllergies: boolean;
    photoUrl: string | null;
  };
  hospital: { institutionId: string; name: string; city: string | null; phone: string | null; contactEmail: string | null };
}

// How the signed-in user sees a record (decides which actions they get).
export type RecordView = 'patient' | 'hospital' | 'admin';

// A registered patient found by search (upload form).
export interface PatientMatch {
  fhId: string;
  name: string;
  dateOfBirth: string | null;
  sexAtBirth: string | null;
  phone: string | null;
  city: string | null;
  bloodGroup: string | null;
  genotype: string | null;
  allergies: string[];
  noKnownAllergies: boolean;
  photoUrl: string | null;
}

interface RecordsState {
  list: RecordSummary[];
  listLoaded: boolean;
  isLoadingList: boolean;
  listError: string | null;
  // Opened records, by id, with the viewer's role for each.
  details: Record<string, { record: RecordDetail; view: RecordView }>;
  isLoadingDetail: boolean;
  detailError: string | null;
  reviewingId: string | null;
  reviewError: string | null;
}

const initialState: RecordsState = {
  list: [],
  listLoaded: false,
  isLoadingList: false,
  listError: null,
  details: {},
  isLoadingDetail: false,
  detailError: null,
  reviewingId: null,
  reviewError: null,
};

export const fetchRecords = createAsyncThunk<RecordSummary[], void, { rejectValue: string }>('records/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ApiEnvelope<{ records: RecordSummary[] }>>('/records');
    return data.response?.records ?? [];
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not load records'));
  }
});

export const fetchRecord = createAsyncThunk<{ record: RecordDetail; view: RecordView }, string, { rejectValue: string }>(
  'records/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiEnvelope<{ record: RecordDetail; view: RecordView }>>(`/records/${id}`);
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not open this record');
      return { record: data.response.record, view: data.response.view };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not open this record'));
    }
  },
);

// `data` is the record (matching the server's createRecordSchema); `files[i]` is described by data.attachments[i].
export const createRecord = createAsyncThunk<RecordDetail, { data: Record<string, unknown>; files: File[] }, { rejectValue: string }>(
  'records/create',
  async ({ data, files }, { rejectWithValue }) => {
    try {
      const body = new FormData();
      body.append('data', JSON.stringify(data));
      files.forEach((file) => body.append('files', file, file.name));
      const response = await axiosInstance.post<ApiEnvelope<{ record: RecordDetail }>>('/records', body);
      if (!response.data.response) return rejectWithValue(response.data.responseMessage || 'Could not submit this record');
      return response.data.response.record;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not submit this record'));
    }
  },
);

export const reviewRecord = createAsyncThunk<RecordDetail, { id: string; status: 'verified' | 'rejected'; note?: string }, { rejectValue: string }>(
  'records/review',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<ApiEnvelope<{ record: RecordDetail }>>(`/records/${id}/review`, note ? { status, note } : { status });
      if (!data.response) return rejectWithValue(data.responseMessage || 'Could not update this record');
      return data.response.record;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Could not update this record'));
    }
  },
);

// Results aren't kept in the store; the upload form holds them.
export const searchPatients = createAsyncThunk<PatientMatch[], string, { rejectValue: string }>('records/searchPatients', async (q, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ApiEnvelope<{ patients: PatientMatch[] }>>('/records/patients/search', { params: { q } });
    return data.response?.patients ?? [];
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Could not search patients'));
  }
});

function toSummary(record: RecordDetail): RecordSummary {
  return {
    id: record.id,
    reference: record.reference,
    recordType: record.recordType,
    title: record.title,
    department: record.department,
    clinician: record.clinician,
    encounterDate: record.encounterDate,
    submittedOn: record.submittedOn,
    status: record.status,
    createdAt: record.createdAt,
    attachmentCount: record.attachments.length,
    patient: { fhId: record.patient.fhId, name: record.patient.name },
    hospital: { institutionId: record.hospital.institutionId, name: record.hospital.name },
  };
}

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.isLoadingList = true;
        state.listError = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.listLoaded = true;
        state.list = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.isLoadingList = false;
        state.listError = action.payload || 'Could not load records';
      })
      .addCase(fetchRecord.pending, (state) => {
        state.isLoadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchRecord.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.details[action.payload.record.id] = action.payload;
      })
      .addCase(fetchRecord.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.detailError = action.payload || 'Could not open this record';
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.details[action.payload.id] = { record: action.payload, view: 'hospital' };
        state.list.unshift(toSummary(action.payload));
      })
      .addCase(reviewRecord.pending, (state, action) => {
        state.reviewingId = action.meta.arg.id;
        state.reviewError = null;
      })
      .addCase(reviewRecord.fulfilled, (state, action) => {
        state.reviewingId = null;
        const existing = state.details[action.payload.id];
        state.details[action.payload.id] = { record: action.payload, view: existing?.view ?? 'hospital' };
        const index = state.list.findIndex((record) => record.id === action.payload.id);
        if (index !== -1) state.list[index] = toSummary(action.payload);
      })
      .addCase(reviewRecord.rejected, (state, action) => {
        state.reviewingId = null;
        state.reviewError = action.payload || 'Could not update this record';
      })
      // Records belong to the signed-in account.
      .addCase(logout, () => initialState)
      .addCase(forceLoggedOut, () => initialState);
  },
});

export default recordsSlice.reducer;
