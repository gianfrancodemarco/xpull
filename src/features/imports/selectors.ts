import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "~/shared/lib/store";

const selectImportsState = (state: RootState) => state.imports;

export const selectImportJobs = createSelector(
  selectImportsState,
  (s) => s.jobs,
);

export const selectLatestImportJob = createSelector(selectImportJobs, (jobs) =>
  jobs.length > 0
    ? [...jobs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]!
    : null,
);

export const selectImportStats = createSelector(
  selectImportsState,
  (s) => s.stats,
);

export const selectIsImportInProgress = createSelector(
  selectImportJobs,
  (jobs) => jobs.some((j) => j.status === "pending" || j.status === "in_progress"),
);

export const selectIsStartingImport = createSelector(
  selectImportsState,
  (s) => s.isStarting,
);

export const selectImportsLoading = createSelector(
  selectImportsState,
  (s) => s.isLoading,
);

export const selectImportsError = createSelector(
  selectImportsState,
  (s) => s.error,
);

export const selectActiveImportJob = createSelector(selectImportJobs, (jobs) =>
  jobs.find((j) => j.status === "pending" || j.status === "in_progress") ?? null,
);

export const selectImportProgressPercent = createSelector(
  selectLatestImportJob,
  (job) => (job ? job.progress : 0),
);

export const selectFormattedStatus = createSelector(
  selectLatestImportJob,
  (job) => {
    if (!job) return null;
    const labels: Record<string, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      failed: "Failed",
    };
    return labels[job.status] ?? job.status;
  },
);
