"use client";

import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import {
  fetchImportJobs,
  fetchImportStats,
  startImportJob,
} from "../importsSlice";
import {
  selectImportJobs,
  selectLatestImportJob,
  selectImportStats,
  selectImportsLoading,
  selectImportsError,
  selectIsImportInProgress,
  selectIsStartingImport,
} from "../selectors";
import { useImportPolling } from "../hooks/useImportPolling";
import {
  ImportStatusCard,
  ImportStatusCardSkeleton,
} from "./ImportStatusCard";
import { ImportSummary, ImportSummarySkeleton } from "./ImportSummary";

type ImportDashboardProps = {
  selectedRepoIds?: string[];
};

export function ImportDashboard({ selectedRepoIds }: ImportDashboardProps = {}) {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectImportJobs);
  const latestJob = useAppSelector(selectLatestImportJob);
  const stats = useAppSelector(selectImportStats);
  const isLoading = useAppSelector(selectImportsLoading);
  const error = useAppSelector(selectImportsError);
  const isImportActive = useAppSelector(selectIsImportInProgress);
  const isStarting = useAppSelector(selectIsStartingImport);
  const [historyOpen, setHistoryOpen] = useState(false);

  useImportPolling();

  useEffect(() => {
    void dispatch(fetchImportJobs());
    void dispatch(fetchImportStats());
  }, [dispatch]);

  const hasCompletedImport = jobs.some((j) => j.status === "completed");
  const pastJobs = jobs.filter((j) => j !== latestJob);

  const selectionCount = selectedRepoIds?.length ?? 0;
  const isButtonDisabled = isImportActive || isStarting || selectionCount === 0;

  const handleStartImport = () => {
    void dispatch(startImportJob(selectedRepoIds));
  };

  const buttonLabel = selectionCount > 0
    ? `Import ${selectionCount} ${selectionCount === 1 ? "Repository" : "Repositories"}`
    : "Select repositories to import";

  const startButton = (
    <Button
      variant="contained"
      color="primary"
      disabled={isButtonDisabled}
      onClick={handleStartImport}
      aria-label="Start historical data import"
    >
      {isStarting ? (
        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
      ) : null}
      {buttonLabel}
    </Button>
  );

  const tooltipTitle = isImportActive
    ? "An import is already running"
    : selectionCount === 0
      ? "Select at least one repository above"
      : "";

  return (
    <Stack spacing={3}>
      {tooltipTitle ? (
        <Tooltip title={tooltipTitle}>
          <span>{startButton}</span>
        </Tooltip>
      ) : (
        startButton
      )}

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
          No import jobs yet.
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
