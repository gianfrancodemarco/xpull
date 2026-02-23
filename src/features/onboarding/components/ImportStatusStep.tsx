"use client";

import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

import { ImportStatusCard, ImportStatusCardSkeleton } from "~/features/imports/components/ImportStatusCard";
import { ImportSummary } from "~/features/imports/components/ImportSummary";
import { useImportPolling } from "~/features/imports/hooks/useImportPolling";
import { useAppDispatch, useAppSelector } from "~/shared/lib/store";
import { fetchImportJobs, fetchImportStats } from "~/features/imports/importsSlice";
import { selectImportJobs, selectImportStats } from "~/features/imports/selectors";

type ImportStatusStepProps = {
  importJobId: string;
};

export function ImportStatusStep({ importJobId }: ImportStatusStepProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectImportJobs);
  const stats = useAppSelector(selectImportStats);

  useEffect(() => {
    void dispatch(fetchImportJobs());
  }, [dispatch]);

  useImportPolling();

  const job = jobs.find((j) => j.id === importJobId) ?? null;
  const isComplete = job?.status === "completed";

  useEffect(() => {
    if (isComplete) {
      void dispatch(fetchImportStats());
    }
  }, [isComplete, dispatch]);

  const handleGoToDashboard = () => {
    router.push("/feed");
  };

  return (
    <Stack spacing={3}>
      {job ? <ImportStatusCard job={job} /> : <ImportStatusCardSkeleton />}

      {isComplete && stats && <ImportSummary stats={stats} />}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        {isComplete && (
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
        )}
        <Typography
          component="button"
          variant="body2"
          color="text.secondary"
          onClick={handleGoToDashboard}
          sx={{
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            p: 1,
            "&:hover": { color: "text.primary" },
          }}
        >
          Skip to Dashboard
        </Typography>
      </Box>
    </Stack>
  );
}
