# Sprint Change Proposal — Authenticated UI/UX Overhaul

**Date:** 2026-02-23
**Author:** Gianfranco (assisted by correct-course workflow)
**Status:** Approved
**Scope:** Minor

---

## Section 1: Issue Summary

The authenticated UI surfaces (navbar, dashboard, settings) built during Epic 1 are functional but visually rough and inconsistent with the Neo Arcade design vision defined in the UX specification. The dashboard contains hardcoded placeholder data, the AppBar is a default MUI component with minimal styling, the settings page is plain stacked boxes, and no feed page exists. Styles are inconsistent across surfaces (CSS modules on landing/sign-in, MUI on settings, inline styles on RepositoryAccessList).

**Trigger:** Completed Epic 1 stories (1.1-1.5) — authenticated surfaces exist but do not match the UX design specification.

**Category:** Design gap — the UX spec describes a rich Story Feed home, Neo Arcade theming, and cohesive navigation, but implementation stories focused on functionality over visual polish.

**Evidence:**
- Dashboard (`dashboard-view.tsx`) contains hardcoded "+420 XP", fake feed cards, and static data
- AppBar (`shared/ui/nav/AppBar.tsx`) uses minimal MUI defaults without Neo Arcade theming
- Settings page uses basic MUI Box layout without card-based hierarchy
- `RepositoryAccessList` uses inline styles instead of MUI theme tokens
- No feed page or route exists
- Mixed styling approaches (CSS modules, MUI, inline)

## Section 2: Impact Analysis

**Epic Impact:**
- Epic 1 (#3): Add Story 1.6. No existing stories modified.
- Epics 2-7: Unaffected directly. Future epics benefit from a stronger UI foundation.

**Story Impact:**
- No existing stories require modification
- New Story 1.6 can be implemented independently

**Artifact Conflicts:** None.
- PRD: No conflict. This change better implements the existing MVP UI expectations.
- Architecture: No conflict. MUI theming, Redux, feature-folder structure all preserved.
- UX Spec: This change *implements* the UX spec more faithfully — Neo Arcade palette, Story Feed direction, Navigation Patterns, consistent component hierarchy.

**Technical Impact:** Presentation-layer only. No API, data model, or pipeline changes.

## Section 3: Recommended Approach

**Selected:** Direct Adjustment — Add Story 1.6 to Epic 1.

- Effort: Medium
- Risk: Low (theming and layout work, no new backend logic)
- Timeline impact: None — parallelizable with Epic 2 work

**Rationale:** This is a presentation-layer refinement that brings the existing authenticated surfaces in line with the UX spec. It improves the foundation that all future epics build upon without changing scope, architecture, or requirements.

## Section 4: Detailed Change Proposals

### New Story: Story 1.6 — Authenticated UI/UX Redesign

**Story:**
As an authenticated developer, I want a polished, cohesive UI across all authenticated pages (navbar, dashboard, settings, feed) so that the platform feels professional, visually consistent, and aligned with the Neo Arcade design vision.

**Acceptance Criteria:**

1. **Navbar redesign:** AppBar uses Neo Arcade palette (Deep Navy background, Electric Violet accents, Cyan Glow highlights). xpull logo/wordmark is styled. Active route has clear visual indicator. User identity area shows avatar + name with styled dropdown. Responsive: hamburger below 768px with styled drawer. Touch targets >= 44px.

2. **Dashboard redesign:** Remove all hardcoded placeholder data. Replace with properly designed layout: identity hero area (user avatar, name, level placeholder), "What Changed" panel structure (empty state or coming-soon), feed-style milestone card placeholders (well-designed empty/teaser states rather than fake data), and a collected-data section showing real import stats (already implemented). Clear visual hierarchy following progression-first principle.

3. **Settings redesign:** Card-based layout with clear section headers. Unified "Repositories & Import" card combining repo selection (with last import time per repo) and ImportDashboard (import button disabled until repos selected, job status, history). Account/danger zone section for disconnect. Consistent spacing using 8px grid. All components use MUI theme tokens. *(Partially implemented via Story 2.5 — settings page now uses unified card layout with `RepoSelectionCard` + `ImportDashboard`)*

4. **Feed page (mocked):** New `/feed` route accessible from navbar. Shows the Story Feed vision with placeholder StoryMilestoneCard-style components. "What Changed" panel mockup. "Next Action" module mockup. Coming-soon state for sections that need real data. This gives the design direction concrete shape.

5. **Consistent theming:** All authenticated surfaces use MUI theme tokens exclusively. No CSS modules or inline styles on authenticated pages. Neo Arcade color palette applied consistently. Typography follows Sora (headings) / Inter (body) / JetBrains Mono (code/meta) stack.

6. **Testing:** Vitest unit tests for redesigned components. Visual regression baseline for key surfaces. Existing tests updated where component APIs change.

**Tasks:**
- Redesign `src/shared/ui/nav/AppBar.tsx` with Neo Arcade theming, styled user menu, responsive drawer
- Redesign `src/app/dashboard/dashboard-view.tsx` with proper layout, empty states, real data integration
- Redesign `src/app/(authenticated)/settings/page.tsx` with card-based sections
- Create `/feed` route with mocked Story Feed components
- Create placeholder custom components: StoryMilestoneCard, WhatChangedPanel, NextActionModule (empty/teaser states)
- Eliminate CSS module and inline style usage on authenticated pages
- Update MUI theme with full Neo Arcade token set (if not already complete)
- Update tests for changed components

**Dev Notes:**
- Reference UX Design Specification sections: Visual Design Foundation, Design Direction Decision, Component Strategy, UX Consistency Patterns
- Use MUI theme `createTheme()` with Neo Arcade tokens from `shared/ui/theme/tokens.ts`
- Feed page components can be simple card layouts — they will be replaced by real data-driven components in later epics
- Keep IdentityHero, StoryMilestoneCard, WhatChangedPanel, NextActionModule as separate components in `shared/ui/components/` for reuse
- Dashboard should show real import stats (existing feature) and placeholder/coming-soon for progression data (Epic 3)

## Section 5: Implementation Handoff

**Scope Classification:** Minor — direct implementation by development team.

**Dependencies:** Stories 1.1-1.5 should be complete (they are).

**Success Criteria:**
- All authenticated pages use Neo Arcade theming consistently
- Dashboard shows real data where available and well-designed placeholders elsewhere
- Feed page demonstrates the Story Feed design direction
- Settings feels organized and polished
- No CSS modules or inline styles on authenticated surfaces
- NavBar feels distinctive and branded

**Routed to:** Development team for direct implementation.
