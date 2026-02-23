"use client";

import React, { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { RepoItem } from "../schema";

type RepoSelectionStepProps = {
  onContinue: (selectedRepoIds: string[]) => void;
};

export function RepoSelectionStep({ onContinue }: RepoSelectionStepProps) {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/repos");
      if (!res.ok) throw new Error("Failed to fetch repositories");
      const body = await res.json();
      const data = body.data as RepoItem[];
      setRepos(data);
    } catch {
      setError("Could not load your repositories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRepos();
  }, [fetchRepos]);

  const handleToggle = (repoName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(repoName)) {
        next.delete(repoName);
      } else {
        next.add(repoName);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(repos.map((r) => r.fullName)));
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  const handleContinue = () => {
    onContinue(Array.from(selected));
  };

  if (isLoading) {
    return (
      <Stack spacing={2} role="status" aria-label="Loading repositories">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchRepos}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2">
          Your Repositories ({repos.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            Deselect All
          </Button>
        </Stack>
      </Stack>

      <List sx={{ maxHeight: 400, overflow: "auto" }}>
        {repos.map((repo) => (
          <ListItem key={repo.fullName} disablePadding>
            <ListItemButton
              onClick={() => handleToggle(repo.fullName)}
              sx={{ minHeight: 56 }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>
                <Checkbox
                  edge="start"
                  checked={selected.has(repo.fullName)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-label": `Select ${repo.name}` }}
                />
              </ListItemIcon>
              <ListItemText
                primary={repo.name}
                secondary={formatUpdatedAt(repo.updatedAt)}
              />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                {repo.language && (
                  <Chip label={repo.language} size="small" variant="outlined" />
                )}
                {repo.stars > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {repo.stars} stars
                  </Typography>
                )}
                <Chip
                  label={repo.isPrivate ? "Private" : "Public"}
                  size="small"
                  color={repo.isPrivate ? "default" : "success"}
                  variant="outlined"
                />
              </Stack>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          disabled={selected.size === 0}
          onClick={handleContinue}
        >
          Continue ({selected.size} selected)
        </Button>
      </Box>
    </Box>
  );
}

function formatUpdatedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days}d ago`;
  const months = Math.floor(days / 30);
  return `Updated ${months}mo ago`;
}
