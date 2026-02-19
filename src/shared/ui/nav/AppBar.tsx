"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
// Avoid optional dependency on @mui/icons-material in tests — use simple glyph
import { signOut } from "next-auth/react";

type UserShape = { name?: string | null; email?: string | null; image?: string | null } | null;

type NavProps = {
  user?: UserShape;
};

export default function TopAppBar({ user }: NavProps) {
  const pathname = usePathname() ?? "/";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  function handleMenuOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }
  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleMobileOpen(e: React.MouseEvent<HTMLElement>) {
    setMobileAnchor(e.currentTarget);
  }
  function handleMobileClose() {
    setMobileAnchor(null);
  }

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  const isActive = (p: string) => pathname.startsWith(p);

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Link href="/dashboard" aria-label="xpull home">
            <Typography component="span" variant="h6" sx={{ cursor: "pointer" }}>
              xpull
            </Typography>
          </Link>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, ml: 2 }}>
            <Link href="/dashboard">
              <Button color={isActive("/dashboard") ? "secondary" : "inherit"}>Dashboard</Button>
            </Link>
            <Link href="/settings">
              <Button color={isActive("/settings") ? "secondary" : "inherit"}>Settings</Button>
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{user?.name ?? "xpull Citizen"}</Typography>
          <IconButton onClick={handleMenuOpen} size="small" aria-label="user-menu">
            <Avatar src={user?.image ?? undefined} alt={user?.name ?? "user"} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <Link href="/settings">Settings</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleSignOut();
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton onClick={handleMobileOpen} color="inherit" aria-label="menu">
            <span aria-hidden style={{ lineHeight: 0 }}>
              ☰
            </span>
          </IconButton>
          <Menu anchorEl={mobileAnchor} open={Boolean(mobileAnchor)} onClose={handleMobileClose}>
            <MenuItem onClick={handleMobileClose}>
              <Link href="/dashboard">Dashboard</Link>
            </MenuItem>
            <MenuItem onClick={handleMobileClose}>
              <Link href="/settings">Settings</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMobileClose();
                handleSignOut();
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
