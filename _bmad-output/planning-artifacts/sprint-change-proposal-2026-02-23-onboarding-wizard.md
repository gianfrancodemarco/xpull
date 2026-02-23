# Sprint Change Proposal — Onboarding Import Wizard

**Date:** 2026-02-23
**Author:** Gianfranco (assisted by correct-course workflow)
**Status:** Approved
**Scope:** Minor

---

## Section 1: Issue Summary

New users currently land on the dashboard after GitHub OAuth and must manually navigate to Settings to find the "Start Import" button. There is no guided onboarding flow — no repo selection, no automatic import trigger, and no clear path from signup to data ingestion. The PRD describes FR2 ("users can select which repositories") and FR3 ("import historical data upon connection"), and the UX spec envisions a smooth funnel from OAuth to Unboxing. The current implementation skips the connection between authentication and import entirely.

**Trigger:** Epic 2 implementation (Stories 2.1-2.4) — import pipeline works but the user-facing trigger is buried in settings with no guided flow.

**Category:** New requirement (guided onboarding wizard) — the PRD/UX spec assume a smooth auth-to-import flow, but no story explicitly creates it.

**Evidence:**
- Import is triggered via "Start Import" button on settings page only
- No repo selection UI exists in the onboarding flow
- FR2 (repo selection) is listed in Epic 1 but only implemented as a settings toggle, not an onboarding step
- FR3 says "import upon connection" but import requires manual navigation and button click
- New users see a mostly-empty dashboard with no guidance on what to do next

## Section 2: Impact Analysis

**Epic Impact:**
- Epic 2 (#4): Add Story 2.5. No existing stories modified.
- Epic 1 (#3): No changes needed — auth flow remains the same, wizard redirects after auth.
- Epic 5 (#7, Unboxing): Benefits — wizard naturally precedes the Unboxing experience. The import status page is a stepping stone to future Unboxing.

**Story Impact:**
- No existing stories require modification
- Story 2.5 depends on Stories 2.1 (import pipeline) being complete
- Existing `ImportDashboard`, `ImportStatusCard`, `ImportSummary` components can be reused/enhanced

**Artifact Conflicts:** None.
- PRD: Better fulfills FR2 (repo selection) and FR3 (import upon connection). No conflict.
- Architecture: Minor additions — need an API to fetch user's GitHub repos for display, and the import trigger may need to accept selected repo IDs. Worker/pipeline architecture unchanged.
- UX Spec: Fills a gap in the onboarding funnel between OAuth and Unboxing. Additive, not conflicting.

**Technical Impact:**
- New API endpoint: `GET /api/repos` — fetch user's accessible GitHub repos from GitHub API
- Modified import trigger: accept optional list of selected repository IDs
- New wizard UI pages/components
- Redirect logic: detect first-time user and redirect to wizard instead of dashboard
- Existing import components (ImportStatusCard, ImportDashboard) reusable for step 3

## Section 3: Recommended Approach

**Selected:** Direct Adjustment — Add Story 2.5 to Epic 2.

- Effort: Medium
- Risk: Low (GitHub repos API is straightforward, import pipeline exists, wizard is UI-driven)
- Timeline impact: Minimal — most backend pieces exist, this is primarily a UI flow

**Rationale:** The import pipeline is already built and working. This change wraps it in a user-facing wizard that fulfills the PRD's "upon connection" vision and creates the natural precursor to the Unboxing experience. It uses existing components and adds a thin API layer for repo listing.

## Section 4: Detailed Change Proposals

### New Story: Story 2.5 — Onboarding Import Wizard

**Story:**
As a newly authenticated developer, I want a guided onboarding wizard that shows me all my GitHub repositories, lets me choose which ones to import, and automatically starts the import so that I get my data flowing without navigating to settings or figuring out the process myself.

**Acceptance Criteria:**

1. **First-time redirect:** After first GitHub OAuth login, user is redirected to `/onboarding` wizard instead of `/dashboard`. Returning users (who have completed onboarding or have existing import data) go directly to dashboard.

2. **Step 1 — Repository Selection:** Wizard displays all user-accessible GitHub repos fetched from GitHub API. Each repo shows: name, language, stars, last updated, public/private indicator. User can select/deselect individual repos. "Select All" / "Deselect All" controls available. Minimum 1 repo must be selected to proceed.

3. **Step 2 — Import Kickoff:** After confirming selection, import starts automatically for selected repositories. User sees a transition/loading state ("Preparing your import...") before landing on the status page. Import jobs are created for selected repos (parallel or batched based on worker capacity).

4. **Step 3 — Import Status:** User lands on an import monitoring page showing progress for their import. Reuses/enhances existing `ImportStatusCard` component to show per-repo or aggregate progress. Live polling (existing `useImportPolling` hook). Shows completion state with summary stats when done. "Go to Dashboard" CTA appears when import completes. User can navigate away at any time — import continues in background.

5. **API support:** `GET /api/repos` endpoint returns user's GitHub repositories with metadata (name, language, stars, visibility, updated_at). Import trigger accepts optional selected repository IDs to scope the import.

6. **Testing:** Vitest unit tests for wizard components and repo selection logic. API tests for `/api/repos` endpoint. Integration test for wizard flow.

**Tasks:**
- Create `GET /api/repos` endpoint using GitHub API (Octokit `repos.listForAuthenticatedUser`)
- Create `/onboarding` route with wizard step components
- Create `RepoSelectionStep` component (repo list, select/deselect, metadata display)
- Create `ImportKickoffStep` component (confirmation, auto-trigger)
- Create `ImportStatusStep` component (reuse ImportStatusCard/ImportDashboard, add "Go to Dashboard" CTA)
- Add first-time user detection (check if user has any import jobs or onboarding completion flag)
- Add redirect logic in authenticated layout or middleware
- Modify import API to accept selected repository IDs (optional — if not provided, import all as before)
- Add tests for all new components and API endpoint

**Dev Notes:**
- GitHub API: `octokit.repos.listForAuthenticatedUser({ per_page: 100, sort: 'updated' })` — paginate if needed
- First-time detection: check `ImportJob` table for user — if no records, redirect to onboarding
- Parallel import: current worker architecture processes repos within a single import job. Consider whether to create one job per repo (true parallelism) or keep single job with selected repos list. Single job is simpler for MVP.
- The wizard is a natural precursor to the Unboxing (Epic 5). The import status page could later transition into the Unboxing cascade when data is ready.
- Existing components in `src/features/imports/components/` handle polling, status display, retry, and summary — reuse heavily

## Section 5: Implementation Handoff

**Scope Classification:** Minor — direct implementation by development team.

**Dependencies:** Stories 2.1 (import pipeline) should be complete. Story 1.5 (nav shell) provides the layout context.

**Success Criteria:**
- First-time users are guided through repo selection → import → status monitoring
- Import starts automatically without user needing to find a button in settings
- User can monitor import progress and navigate to dashboard when ready
- Returning users bypass the wizard and go to dashboard
- Existing import functionality (retry, polling, status) still works

**Routed to:** Development team for direct implementation.
