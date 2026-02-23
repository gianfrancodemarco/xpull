"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { signOut } from "next-auth/react";

import { tokens } from "~/shared/ui/theme/tokens";

type UserShape = { name?: string | null; email?: string | null; image?: string | null } | null;

type NavProps = {
  user?: UserShape;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Feed", href: "/feed" },
  { label: "Settings", href: "/settings" },
];

export default function TopAppBar({ user }: NavProps) {
  const pathname = usePathname() ?? "/";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const open = Boolean(anchorEl);

  function handleMenuOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }
  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Link href="/dashboard" aria-label="xpull home" style={{ textDecoration: "none" }}>
              <Typography
                component="span"
                variant="h6"
                sx={{
                  fontFamily: tokens.typography.heading,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  letterSpacing: "-0.02em",
                }}
              >
                xpull
              </Typography>
            </Link>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, ml: 3 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: isActive(item.href)
                      ? tokens.colors.secondary
                      : tokens.colors.textSecondary,
                    minHeight: 44,
                    px: 2,
                    position: "relative",
                    "&::after": isActive(item.href)
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "60%",
                          height: 2,
                          backgroundColor: tokens.colors.primary,
                          borderRadius: 1,
                        }
                      : {},
                    "&:hover": {
                      color: tokens.colors.secondary,
                      backgroundColor: "rgba(0, 209, 255, 0.08)",
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${tokens.colors.secondary}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Desktop user area */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.textSecondary }}>
              {user?.name ?? "xpull Citizen"}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              aria-label="user-menu"
              sx={{
                minWidth: 44,
                minHeight: 44,
                "&:focus-visible": {
                  outline: `2px solid ${tokens.colors.secondary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Avatar
                src={user?.image ?? undefined}
                alt={user?.name ?? "user"}
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    backgroundColor: tokens.colors.surfaceElevated,
                    border: `1px solid rgba(234, 240, 255, 0.08)`,
                    mt: 1,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => handleMenuClose()}
                component={Link}
                href="/settings"
                sx={{ minHeight: 44 }}
              >
                Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleSignOut();
                }}
                sx={{ minHeight: 44 }}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </Box>

          {/* Mobile hamburger */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color="inherit"
              aria-label="menu"
              sx={{
                minWidth: 44,
                minHeight: 44,
                "&:focus-visible": {
                  outline: `2px solid ${tokens.colors.secondary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <span aria-hidden style={{ lineHeight: 0, fontSize: 24 }}>
                ☰
              </span>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: tokens.colors.surface,
            borderLeft: `1px solid rgba(234, 240, 255, 0.08)`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: tokens.typography.heading,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              mb: 1,
            }}
          >
            xpull
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(234, 240, 255, 0.08)" }} />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              onClick={() => setDrawerOpen(false)}
              sx={{
                minHeight: 48,
                color: isActive(item.href)
                  ? tokens.colors.secondary
                  : tokens.colors.textPrimary,
                "&.Mui-selected": {
                  backgroundColor: "rgba(124, 77, 255, 0.12)",
                  borderRight: `3px solid ${tokens.colors.primary}`,
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 209, 255, 0.08)",
                },
                "&:focus-visible": {
                  outline: `2px solid ${tokens.colors.secondary}`,
                  outlineOffset: -2,
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ borderColor: "rgba(234, 240, 255, 0.08)" }} />
        <List>
          <ListItemButton
            onClick={() => {
              setDrawerOpen(false);
              handleSignOut();
            }}
            sx={{
              minHeight: 48,
              color: tokens.colors.error,
              "&:hover": {
                backgroundColor: "rgba(255, 90, 122, 0.08)",
              },
              "&:focus-visible": {
                outline: `2px solid ${tokens.colors.secondary}`,
                outlineOffset: -2,
              },
            }}
          >
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
}
