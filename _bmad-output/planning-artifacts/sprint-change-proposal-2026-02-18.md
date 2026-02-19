# Sprint Change Proposal — Authenticated Navigation Shell

**Date:** 2026-02-18
**Author:** Gianfranco (assisted by correct-course workflow)
**Status:** Approved
**Scope:** Minor

---

## Section 1: Issue Summary

Post-login authenticated pages have no global navigation. The UX specification defines top nav (desktop) with identity anchor and active-state highlighting. The architecture defines the `(authenticated)` route group with `/dashboard`, `/settings`, `/unboxing`. But no story creates the shared AppBar layout that ties these routes together. Story 1.4's settings page is currently unreachable except by direct URL.

**Trigger:** Story 1.4 (Repository Selection & GitHub Disconnection) — settings page is built but unreachable without navigation.

**Category:** Missing glue component — navigation was assumed by UX spec and architecture, but never explicitly tasked in any story.

**Evidence:**
- `src/app/layout.tsx` has no nav component
- No `app/(authenticated)/layout.tsx` exists
- `src/shared/ui/nav/` directory exists but is empty
- Settings page at `app/(authenticated)/settings/page.tsx` has no inbound navigation path

## Section 2: Impact Analysis

**Epic Impact:** Epic 1 only — one new story added (Story 1.5).

**Story Impact:** No existing stories modified. Story 1.5 can be implemented in parallel with or after Story 1.4.

**Artifact Conflicts:** None.
- PRD: No conflict. FRs assume authenticated navigation exists.
- Architecture: No conflict. Already defines `app/(authenticated)/` route group and lists MUI AppBar as foundation.
- UX Spec: Directly supports existing spec (Navigation Patterns, lines 748-765).

**Technical Impact:** Minimal — MUI AppBar component, authenticated layout wrapper, session-aware rendering.

## Section 3: Recommended Approach

**Selected:** Direct Adjustment — Add Story 1.5 to Epic 1.

- Effort: Low (1 component + 1 layout file + tests)
- Risk: Low (standard MUI AppBar, no new API, no new state)
- Timeline impact: None

**Rationale:** This is a small, well-scoped glue component that the UX spec already describes. It unblocks settings navigation and benefits all future authenticated surfaces.

## Section 4: Detailed Change Proposals

### New Story: Story 1.5 — Authenticated Navigation Shell

**Story:**
As an authenticated developer, I want a persistent top navigation bar on all authenticated pages, so that I can move between Dashboard, Settings, and other sections without memorizing URLs.

**Acceptance Criteria:**

1. An `app/(authenticated)/layout.tsx` wraps all authenticated routes and renders a top AppBar visible on every authenticated page (dashboard, settings, unboxing).
2. The AppBar contains: xpull logo/wordmark (links to /dashboard), "Dashboard" nav link, user avatar/menu (with Settings link and Sign Out action). Active route is visually highlighted.
3. Top AppBar on all breakpoints for MVP. Touch targets >= 44px on mobile. Hamburger menu or compact layout below 768px.
4. AppBar reads session via `getServerSession(authConfig)` or client session hook. Shows user avatar/name from GitHub profile. Sign Out triggers `signOut()` and redirects to landing page.
5. Follows Neo Arcade palette, Sora/Inter typography, WCAG 2.1 AA contrast, keyboard navigable, focus indicators >= 3:1 contrast ratio.
6. Vitest unit tests for nav component rendering + active state. Playwright E2E test verifying navigation between dashboard and settings.

**Tasks:**
- Create `src/app/(authenticated)/layout.tsx` wrapping children with AppBar
- Create `src/shared/ui/nav/AppBar.tsx` (MUI AppBar + Toolbar) with logo, nav links, user avatar menu
- Add user avatar menu with "Settings" link and "Sign Out" action
- Style with Neo Arcade theme tokens, responsive breakpoints
- Add Vitest tests for AppBar rendering, active link state, sign-out
- Add Playwright test: navigate dashboard -> settings -> dashboard

**Dev Notes:**
- Reuse `getServerSession(authConfig)` from `src/server/auth`
- Use MUI AppBar, Toolbar, IconButton, Menu, Avatar
- Place shared component in `src/shared/ui/nav/` (directory already exists)
- Follow architecture naming: PascalCase component, co-located tests
- This unblocks Story 1.4 (settings is now reachable via nav)

## Section 5: Implementation Handoff

**Scope Classification:** Minor — direct implementation by development team.

**Dependencies:** Story 1.3 (landing + dashboard) should be merged first so the dashboard route exists.

**Success Criteria:** User can navigate between `/dashboard` and `/settings` using the AppBar after login.

**Routed to:** Development team for direct implementation.
