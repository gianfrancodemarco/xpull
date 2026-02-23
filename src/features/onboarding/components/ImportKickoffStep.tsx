"use client";

import React, { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ImportKickoffStepProps = {
  selectedRepoIds: string[];
  onImportStarted: (jobId: string) => void;
};

export function ImportKickoffStep({
  selectedRepoIds,
  onImportStarted,
}: ImportKickoffStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startImport = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRepoIds }),
      });
      if (!res.ok) throw new Error("Failed to start import");
      const body = await res.json();
      onImportStarted(body.data.id as string);
    } catch {
      setError("Could not start the import. Please try again.");
      setIsStarting(false);
    }
  }, [selectedRepoIds, onImportStarted]);

  useEffect(() => {
    void startImport();
  }, [startImport]);

  if (error) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={startImport}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 6,
      }}
    >
      <CircularProgress size={48} sx={{ mb: 3 }} />
      <Typography variant="h6" component="p">
        Preparing your import...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Setting up {selectedRepoIds.length} {selectedRepoIds.length === 1 ? "repository" : "repositories"}
      </Typography>
    </Box>
  );
}
