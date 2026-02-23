"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import { fetchImportJobs, fetchImportStats } from "../importsSlice";
import {
  selectImportJobs,
  selectLatestImportJob,
  selectImportStats,
  selectImportsLoading,
  selectImportsError,
} from "../selectors";
import { useImportPolling } from "../hooks/useImportPolling";
import {
  ImportStatusCard,
  ImportStatusCardSkeleton,
} from "./ImportStatusCard";
import { ImportSummary, ImportSummarySkeleton } from "./ImportSummary";

export function ImportDashboard() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectImportJobs);
  const latestJob = useAppSelector(selectLatestImportJob);
  const stats = useAppSelector(selectImportStats);
  const isLoading = useAppSelector(selectImportsLoading);
  const error = useAppSelector(selectImportsError);
  const [historyOpen, setHistoryOpen] = useState(false);

  useImportPolling();

  useEffect(() => {
    void dispatch(fetchImportJobs());
    void dispatch(fetchImportStats());
  }, [dispatch]);

  const hasCompletedImport = jobs.some((j) => j.status === "completed");
  const pastJobs = jobs.filter((j) => j !== latestJob);

  return (
    <Stack spacing={3}>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {isLoading && !latestJob ? (
        <ImportStatusCardSkeleton />
      ) : latestJob ? (
        <ImportStatusCard job={latestJob} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          No import jobs found. Start an import from the GitHub settings.
        </Typography>
      )}

      {isLoading && !stats ? (
        <ImportSummarySkeleton />
      ) : stats && hasCompletedImport ? (
        <ImportSummary stats={stats} />
      ) : null}

      {pastJobs.length > 0 && (
        <Accordion
          expanded={historyOpen}
          onChange={(_, expanded) => setHistoryOpen(expanded)}
          disableGutters
          elevation={0}
          sx={{ bgcolor: "transparent" }}
        >
          <AccordionSummary aria-controls="import-history-content" id="import-history-header">
            <Typography variant="subtitle2">
              Import History ({pastJobs.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {pastJobs.map((job) => (
                <ImportStatusCard key={job.id} job={job} />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
}
