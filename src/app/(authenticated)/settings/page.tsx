"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import RepositoryAccessList from "~/features/auth/components/RepositoryAccessList";
import { ImportDashboard } from "~/features/imports/components/ImportDashboard";
import { tokens } from "~/shared/ui/theme/tokens";

type Repo = { id: string; name: string; full_name: string; allowed: boolean };

export default function SettingsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/github/repos");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRepos(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(repoName: string, allow: boolean) {
    try {
      const res = await fetch("/api/settings/github/repos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName, allow }),
      });
      if (!res.ok) throw new Error("update failed");
      const body = await res.json();
      setRepos(body.data ?? repos);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect GitHub and remove imported data?")) return;
    try {
      const res = await fetch("/api/settings/github/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("disconnect failed");
      alert("Disconnected. Please sign in again if you want to reconnect.");
      load();
    } catch (err) {
      console.error(err);
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
          <CardHeader title="Data Import" />
          <CardContent>
            <ImportDashboard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Repository Access" />
          <CardContent>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            ) : (
              <RepositoryAccessList
                repos={repos}
                onToggle={handleToggle}
                onDisconnect={handleDisconnect}
              />
            )}
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
