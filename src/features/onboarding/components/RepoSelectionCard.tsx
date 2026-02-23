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
import { formatRelativeTime } from "./repoFormatUtils";

type RepoSelectionCardProps = {
  onSelectionChange?: (repoIds: string[]) => void;
};

export function RepoSelectionCard({ onSelectionChange }: RepoSelectionCardProps) {
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
      setRepos(body.data as RepoItem[]);
    } catch {
      setError("Could not load your repositories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRepos();
  }, [fetchRepos]);

  const updateSelection = (next: Set<string>) => {
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const handleToggle = (repoFullName: string) => {
    const next = new Set(selected);
    if (next.has(repoFullName)) {
      next.delete(repoFullName);
    } else {
      next.add(repoFullName);
    }
    updateSelection(next);
  };

  const handleSelectAll = () => updateSelection(new Set(repos.map((r) => r.fullName)));
  const handleDeselectAll = () => updateSelection(new Set());

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} />
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {selected.size} of {repos.length} repositories selected
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={handleSelectAll}>Select All</Button>
          <Button size="small" onClick={handleDeselectAll}>Deselect All</Button>
        </Stack>
      </Stack>

      <List sx={{ maxHeight: 360, overflow: "auto" }}>
        {repos.map((repo) => (
          <ListItem key={repo.fullName} disablePadding>
            <ListItemButton onClick={() => handleToggle(repo.fullName)} sx={{ minHeight: 48 }}>
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
                secondary={repo.lastImportedAt
                  ? `Imported ${formatRelativeTime(repo.lastImportedAt)}`
                  : "Not imported yet"}
              />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                {repo.language && (
                  <Chip label={repo.language} size="small" variant="outlined" />
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
    </Box>
  );
}
