import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ImportJobResponse, ImportStatsResponse } from "./schema";

export type ImportsState = {
  jobs: ImportJobResponse[];
  stats: ImportStatsResponse | null;
  isLoading: boolean;
  isPolling: boolean;
  isStarting: boolean;
  error: string | null;
};

const initialState: ImportsState = {
  jobs: [],
  stats: null,
  isLoading: false,
  isPolling: false,
  isStarting: false,
  error: null,
};

export const fetchImportJobs = createAsyncThunk(
  "imports/fetchJobs",
  async () => {
    const res = await fetch("/api/imports");
    if (!res.ok) throw new Error("Failed to fetch import jobs");
    const body = await res.json();
    return body.data as ImportJobResponse[];
  },
);

export const fetchImportStats = createAsyncThunk(
  "imports/fetchStats",
  async () => {
    const res = await fetch("/api/imports/stats");
    if (!res.ok) throw new Error("Failed to fetch import stats");
    const body = await res.json();
    return body.data as ImportStatsResponse;
  },
);

export const retryImportJob = createAsyncThunk(
  "imports/retryJob",
  async (importId: string) => {
    const res = await fetch(`/api/imports/${importId}/retry`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to retry import job");
    const body = await res.json();
    return body.data as { id: string; status: string };
  },
);

export const startImportJob = createAsyncThunk(
  "imports/startJob",
  async (_, { dispatch }) => {
    const res = await fetch("/api/imports", { method: "POST" });
    if (!res.ok) throw new Error("Failed to start import");
    const body = await res.json();
    void dispatch(fetchImportJobs());
    return body.data as ImportJobResponse;
  },
);

const importsSlice = createSlice({
  name: "imports",
  initialState,
  reducers: {
    setPolling(state, action: { payload: boolean }) {
      state.isPolling = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImportJobs.pending, (state) => {
        if (!state.isPolling) state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImportJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchImportJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to fetch import jobs";
      })

      .addCase(fetchImportStats.pending, (state) => {
        if (!state.isPolling) state.isLoading = true;
      })
      .addCase(fetchImportStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchImportStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to fetch import stats";
      })

      .addCase(retryImportJob.pending, (state) => {
        state.error = null;
      })
      .addCase(retryImportJob.fulfilled, (state, action) => {
        const job = state.jobs.find((j) => j.id === action.payload.id);
        if (job) {
          job.status = "pending";
          job.errorMessage = null;
        }
      })
      .addCase(retryImportJob.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to retry import job";
      })

      .addCase(startImportJob.pending, (state) => {
        state.isStarting = true;
        state.error = null;
      })
      .addCase(startImportJob.fulfilled, (state) => {
        state.isStarting = false;
      })
      .addCase(startImportJob.rejected, (state, action) => {
        state.isStarting = false;
        state.error = action.error.message ?? "Failed to start import";
      });
  },
});

export const { setPolling } = importsSlice.actions;
export default importsSlice.reducer;
