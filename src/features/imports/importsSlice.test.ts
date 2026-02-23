import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import importsReducer, {
  fetchImportJobs,
  fetchImportStats,
  retryImportJob,
  setPolling,
} from "./importsSlice";
import type { ImportsState } from "./importsSlice";
import {
  selectImportJobs,
  selectLatestImportJob,
  selectImportStats,
  selectIsImportInProgress,
  selectImportsLoading,
  selectImportsError,
  selectFormattedStatus,
} from "./selectors";

function createTestStore(preloadedImports?: Partial<ImportsState>) {
  return configureStore({
    reducer: { imports: importsReducer },
    preloadedState: preloadedImports
      ? {
          imports: {
            jobs: [],
            stats: null,
            isLoading: false,
            isPolling: false,
            error: null,
            ...preloadedImports,
          },
        }
      : undefined,
  });
}

const mockJob = {
  id: "job-1",
  userId: "user-1",
  status: "completed" as const,
  progress: 100,
  totalItems: 50,
  processedItems: 50,
  errorMessage: null,
  startedAt: "2026-01-15T10:00:00.000Z",
  completedAt: "2026-01-15T10:05:00.000Z",
  createdAt: "2026-01-15T09:59:00.000Z",
  updatedAt: "2026-01-15T10:05:00.000Z",
};

const mockStats = {
  totalCommits: 100,
  totalPullRequests: 25,
  totalReviews: 15,
  languages: [{ language: "TypeScript", count: 50 }],
  earliestEventDate: "2025-01-01T00:00:00.000Z",
  latestEventDate: "2026-02-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("importsSlice", () => {
  describe("initial state", () => {
    it("has empty initial state", () => {
      const store = createTestStore();
      const state = store.getState().imports;
      expect(state.jobs).toEqual([]);
      expect(state.stats).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isPolling).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("setPolling action", () => {
    it("sets polling to true", () => {
      const store = createTestStore();
      store.dispatch(setPolling(true));
      expect(store.getState().imports.isPolling).toBe(true);
    });

    it("sets polling to false", () => {
      const store = createTestStore({ isPolling: true });
      store.dispatch(setPolling(false));
      expect(store.getState().imports.isPolling).toBe(false);
    });
  });

  describe("fetchImportJobs thunk", () => {
    it("sets isLoading on pending (when not polling)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [mockJob] }),
        }),
      );

      const store = createTestStore();
      const promise = store.dispatch(fetchImportJobs());

      expect(store.getState().imports.isLoading).toBe(true);
      await promise;
    });

    it("does not set isLoading when polling", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [mockJob] }),
        }),
      );

      const store = createTestStore({ isPolling: true });
      const promise = store.dispatch(fetchImportJobs());

      expect(store.getState().imports.isLoading).toBe(false);
      await promise;
    });

    it("stores jobs on fulfilled", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [mockJob] }),
        }),
      );

      const store = createTestStore();
      await store.dispatch(fetchImportJobs());

      expect(store.getState().imports.jobs).toEqual([mockJob]);
      expect(store.getState().imports.isLoading).toBe(false);
    });

    it("sets error on rejected", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      );

      const store = createTestStore();
      await store.dispatch(fetchImportJobs());

      expect(store.getState().imports.error).toBe(
        "Failed to fetch import jobs",
      );
      expect(store.getState().imports.isLoading).toBe(false);
    });
  });

  describe("fetchImportStats thunk", () => {
    it("stores stats on fulfilled", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: mockStats }),
        }),
      );

      const store = createTestStore();
      await store.dispatch(fetchImportStats());

      expect(store.getState().imports.stats).toEqual(mockStats);
    });

    it("sets error on rejected", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      );

      const store = createTestStore();
      await store.dispatch(fetchImportStats());

      expect(store.getState().imports.error).toBe(
        "Failed to fetch import stats",
      );
    });
  });

  describe("retryImportJob thunk", () => {
    it("updates job status to pending on fulfilled", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({ data: { id: "job-fail", status: "retrying" } }),
        }),
      );

      const failedJob = {
        ...mockJob,
        id: "job-fail",
        status: "failed" as const,
        errorMessage: "Something went wrong",
      };
      const store = createTestStore({ jobs: [failedJob] });
      await store.dispatch(retryImportJob("job-fail"));

      const updated = store.getState().imports.jobs.find(
        (j) => j.id === "job-fail",
      );
      expect(updated?.status).toBe("pending");
      expect(updated?.errorMessage).toBeNull();
    });

    it("sets error on rejected", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 400 }),
      );

      const store = createTestStore();
      await store.dispatch(retryImportJob("job-1"));

      expect(store.getState().imports.error).toBe(
        "Failed to retry import job",
      );
    });
  });
});

describe("selectors", () => {
  it("selectImportJobs returns jobs", () => {
    const state = { imports: { ...createTestStore({ jobs: [mockJob] }).getState().imports } };
    expect(selectImportJobs(state)).toEqual([mockJob]);
  });

  it("selectLatestImportJob returns most recent job", () => {
    const olderJob = { ...mockJob, id: "job-old", createdAt: "2025-01-01T00:00:00.000Z" };
    const newerJob = { ...mockJob, id: "job-new", createdAt: "2026-06-01T00:00:00.000Z" };
    const state = { imports: { ...createTestStore({ jobs: [olderJob, newerJob] }).getState().imports } };

    expect(selectLatestImportJob(state)?.id).toBe("job-new");
  });

  it("selectLatestImportJob returns null when no jobs", () => {
    const state = { imports: { ...createTestStore().getState().imports } };
    expect(selectLatestImportJob(state)).toBeNull();
  });

  it("selectImportStats returns stats", () => {
    const state = { imports: { ...createTestStore({ stats: mockStats }).getState().imports } };
    expect(selectImportStats(state)).toEqual(mockStats);
  });

  it("selectIsImportInProgress returns true for active jobs", () => {
    const activeJob = { ...mockJob, status: "in_progress" as const };
    const state = { imports: { ...createTestStore({ jobs: [activeJob] }).getState().imports } };
    expect(selectIsImportInProgress(state)).toBe(true);
  });

  it("selectIsImportInProgress returns true for pending jobs", () => {
    const pendingJob = { ...mockJob, status: "pending" as const };
    const state = { imports: { ...createTestStore({ jobs: [pendingJob] }).getState().imports } };
    expect(selectIsImportInProgress(state)).toBe(true);
  });

  it("selectIsImportInProgress returns false for completed jobs only", () => {
    const state = { imports: { ...createTestStore({ jobs: [mockJob] }).getState().imports } };
    expect(selectIsImportInProgress(state)).toBe(false);
  });

  it("selectImportsLoading returns loading state", () => {
    const state = { imports: { ...createTestStore({ isLoading: true }).getState().imports } };
    expect(selectImportsLoading(state)).toBe(true);
  });

  it("selectImportsError returns error", () => {
    const state = { imports: { ...createTestStore({ error: "Something failed" }).getState().imports } };
    expect(selectImportsError(state)).toBe("Something failed");
  });

  it("selectFormattedStatus returns formatted label", () => {
    const activeJob = { ...mockJob, status: "in_progress" as const };
    const state = { imports: { ...createTestStore({ jobs: [activeJob] }).getState().imports } };
    expect(selectFormattedStatus(state)).toBe("In Progress");
  });

  it("selectFormattedStatus returns null when no jobs", () => {
    const state = { imports: { ...createTestStore().getState().imports } };
    expect(selectFormattedStatus(state)).toBeNull();
  });
});
