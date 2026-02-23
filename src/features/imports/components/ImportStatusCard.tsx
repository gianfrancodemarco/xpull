"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Stack,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";
import type { ImportJobResponse } from "../schema";
import { useAppDispatch } from "~/shared/lib/store";
import { retryImportJob } from "../importsSlice";

const statusConfig = {
  pending: { label: "Pending", color: "warning" as const, icon: "⏳" },
  in_progress: { label: "In Progress", color: "info" as const, icon: "🔄" },
  completed: { label: "Completed", color: "success" as const, icon: "✅" },
  failed: { label: "Failed", color: "error" as const, icon: "❌" },
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ImportStatusCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="rounded" width={100} height={24} />
          </Stack>
          <Skeleton variant="rounded" height={8} />
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={150} />
            <Skeleton variant="text" width={100} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ImportStatusCardProps = {
  job: ImportJobResponse;
};

export function ImportStatusCard({ job }: ImportStatusCardProps) {
  const dispatch = useAppDispatch();
  const config = statusConfig[job.status];

  const handleRetry = () => {
    void dispatch(retryImportJob(job.id));
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h3">
              Import Status
            </Typography>
            <Chip
              label={`${config.icon} ${config.label}`}
              color={config.color}
              size="small"
              aria-label={`Import status: ${config.label}`}
            />
          </Stack>

          {job.status === "in_progress" && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={job.progress}
                aria-label={`Import progress: ${job.progress}%`}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {job.progress}% complete
              </Typography>
            </Box>
          )}

          <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Items: {job.processedItems}{job.totalItems != null ? ` / ${job.totalItems}` : ""} processed
            </Typography>
            <Stack direction="row" spacing={2}>
              {job.startedAt && (
                <Typography variant="body2" color="text.secondary">
                  Started: {formatRelativeTime(job.startedAt)}
                </Typography>
              )}
              {job.completedAt && (
                <Typography variant="body2" color="text.secondary">
                  Completed: {formatRelativeTime(job.completedAt)}
                </Typography>
              )}
            </Stack>
          </Stack>

          {job.status === "failed" && job.errorMessage && (
            <Alert severity="error" variant="outlined">
              {job.errorMessage}
            </Alert>
          )}

          {job.status === "failed" && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleRetry}
              aria-label="Retry failed import"
            >
              Retry Import
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
