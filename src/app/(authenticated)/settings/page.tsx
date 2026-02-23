"use client";

import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ImportDashboard } from "~/features/imports/components/ImportDashboard";
import { RepoSelectionCard } from "~/features/onboarding/components/RepoSelectionCard";
import { tokens } from "~/shared/ui/theme/tokens";

export default function SettingsPage() {
  const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>([]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedRepoIds(ids);
  }, []);

  async function handleDisconnect() {
    if (!confirm("Disconnect GitHub and remove imported data?")) return;
    try {
      const res = await fetch("/api/settings/github/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("disconnect failed");
      alert("Disconnected. Please sign in again if you want to reconnect.");
    } catch {
      alert("Disconnect failed");
    }
  }

  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontFamily: tokens.typography.heading, fontWeight: 700, mb: 3 }}
      >
        Settings
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="Repositories & Import"
            subheader="Select repositories, then import their history"
          />
          <CardContent>
            <RepoSelectionCard onSelectionChange={handleSelectionChange} />
            <Divider sx={{ my: 3 }} />
            <ImportDashboard selectedRepoIds={selectedRepoIds} />
          </CardContent>
        </Card>

        <Card sx={{ border: `1px solid rgba(255, 107, 107, 0.2)` }}>
          <CardHeader title="Account" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Disconnecting will remove your GitHub connection and all imported data.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDisconnect}
              sx={{
                color: tokens.colors.coralRed,
                borderColor: tokens.colors.coralRed,
                "&:hover": {
                  borderColor: tokens.colors.coralRed,
                  backgroundColor: "rgba(255, 107, 107, 0.08)",
                },
              }}
            >
              Disconnect GitHub
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
