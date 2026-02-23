"use client";

import React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

type Repo = {
  id: string;
  name: string;
  full_name: string;
  allowed: boolean;
};

export default function RepositoryAccessList({
  repos,
  onToggle,
}: {
  repos: Repo[];
  onToggle: (repoName: string, allow: boolean) => Promise<void>;
  onDisconnect: () => Promise<void>;
}) {
  if (repos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No repositories found. Connect your GitHub account to see repositories.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Toggle repository access for xpull.
      </Typography>
      <List disablePadding>
        {repos.map((r) => (
          <ListItem
            key={r.id}
            disablePadding
            secondaryAction={
              <Checkbox
                edge="end"
                checked={r.allowed}
                onChange={(e) => onToggle(r.name, e.target.checked)}
                inputProps={{ "aria-label": `Toggle ${r.full_name}` }}
              />
            }
            sx={{
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <ListItemText
              primary={r.full_name}
              secondary={r.name}
              primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
