"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  Skeleton,
} from "@mui/material";
import type { ImportStatsResponse } from "../schema";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ImportSummarySkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width={180} height={32} />
          <Stack direction="row" spacing={3}>
            <Skeleton variant="rounded" width={100} height={64} />
            <Skeleton variant="rounded" width={100} height={64} />
            <Skeleton variant="rounded" width={100} height={64} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type StatCardProps = {
  icon: string;
  count: number;
  label: string;
};

function StatCard({ icon, count, label }: StatCardProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: "background.paper",
        minWidth: 80,
      }}
    >
      <Typography variant="h6" aria-label={`${count} ${label}`}>
        {icon} {count.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

type ImportSummaryProps = {
  stats: ImportStatsResponse;
};

export function ImportSummary({ stats }: ImportSummaryProps) {
  const isEmpty =
    stats.totalCommits === 0 &&
    stats.totalPullRequests === 0 &&
    stats.totalReviews === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Data Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data imported yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h3">
            Data Summary
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            useFlexGap
          >
            <StatCard icon="📦" count={stats.totalRepositories ?? 0} label="Repos" />
            <StatCard icon="📝" count={stats.totalCommits} label="Commits" />
            <StatCard icon="🔀" count={stats.totalPullRequests} label="Pull Requests" />
            <StatCard icon="👁" count={stats.totalReviews} label="Reviews" />
          </Stack>

          {stats.languages.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Languages Detected
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.languages.map((lang) => (
                  <Chip
                    key={lang.language}
                    label={`${lang.language} (${lang.count})`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {(stats.earliestEventDate ?? stats.latestEventDate) && (
            <Typography variant="body2" color="text.secondary">
              Date range: {formatDate(stats.earliestEventDate)} → {formatDate(stats.latestEventDate)}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
