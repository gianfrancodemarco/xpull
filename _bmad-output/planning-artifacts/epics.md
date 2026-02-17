---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
workflowComplete: true
completedAt: '2026-02-17'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# xpull - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for xpull, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can authenticate with GitHub via OAuth to grant xpull access to their Git activity data
FR2: Users can select which GitHub accounts and repositories xpull has access to
FR3: The system can import a user's complete historical Git data (commits, PRs, reviews, languages) upon connection
FR4: The system can process historical imports of up to 50,000 commits without failure
FR5: The system can continuously sync new Git activity via webhooks
FR6: The system can detect programming languages and attribute activity to specific languages
FR7: The system can handle GitHub API rate limits by queuing and batching without data loss
FR8: Users can disconnect their GitHub account and delete all imported data
FR9: The system can handle webhook failures with retry and deduplication
FR10: The system can calculate XP for each Git activity using a heuristic quality-weighting algorithm
FR11: The system can determine a user's level based on a defined XP-per-level curve
FR12: The system can assign motivation leagues (Bronze through Diamond) based on personal XP thresholds
FR13: Users can view their current XP, level, and league status
FR14: The system can award badges when predefined criteria are met (for example, Bug Slayer for >=10 merged bug-fix PRs in 30 days)
FR15: The system can award titles when predefined level or milestone thresholds are reached (for example, Level 15 or Polyglot criteria met)
FR16: Users can select up to 6 badges to showcase on their public profile
FR17: The system can produce deterministic XP and level outputs so the same activity history always returns the same result
FR18: The system can keep exact XP weights private while publishing at least three scoring principles ("quality over quantity", "review depth matters", and "anti-gaming checks apply")
FR19: The system can generate a language skill tree with one branch per detected language
FR20: The system can unlock skill tree nodes based on Git activity thresholds per language
FR21: The system can display locked nodes alongside unlocked nodes to show the growth path
FR22: Users can explore skill trees via interactive visual diagram (pan, zoom, select)
FR23: Users can view node details (meaning, unlock criteria, earned status)
FR24: The system can ensure active developers (>=5 qualifying activities in the last 30 days) always have at least one reachable next node (unlockable within <=20 additional qualifying activities)
FR25: New users experience a cascading level-unlock sequence replaying their Git progression
FR26: The system can progressively reveal UI features during Unboxing as level thresholds are reached
FR27: The system can display cascade animations for earned badges, titles, and skill tree nodes during Unboxing
FR28: Users can skip or fast-forward the Unboxing
FR29: The system can display contextual encouragement messaging when sparse-data criteria are met (fewer than 50 commits in imported history)
FR30: The system can display a "Connect more sources" placeholder when only one Git provider is connected
FR31: Users can enable a reduced-motion alternative that replaces non-essential animations with static or minimal-motion transitions
FR32: Users can view their profile (level, league, skill trees, titles, badges)
FR33: Users can access public profiles through a shareable URL path pattern (xpull.dev/{username})
FR34: Users can customize profile with bio and external links
FR35: Users can choose a display username
FR36: Public profiles render Open Graph meta tags for social sharing
FR37: Dynamic OG images generated per profile (skill tree summary, level, league)
FR38: Public profiles can be crawled and indexed by search engines and include metadata required for social previews
FR39: The system can ensure private repository names, file paths, and code never appear on public profiles
FR40: The system can store only derived metrics and metadata and can exclude raw code, diffs, and comment threads
FR41: Users can view what data xpull has collected
FR42: Users can delete their account and all associated data
FR43: Users can control profile visibility (public or private)
FR44: Operators can view Git sync pipeline health (webhooks, queue depth, error rates)
FR45: Operators can view aggregate platform metrics (users, active users, Unboxing completion)
FR46: Operators can investigate individual sync failures
FR47: The system can alert operators when import or webhook error rate exceeds 5% for 5 consecutive minutes
FR48: The system supports up to 1,000 users without degradation

### NonFunctional Requirements

NFR1: Public profile first contentful render is <=1.5s at p75 on standard broadband, as measured by RUM and Lighthouse CI
NFR2: Authenticated pages reach largest contentful render <=2.5s at p75 on broadband desktop and modern mobile, as measured by RUM
NFR3: Skill tree initial render completes in <=500ms and interaction frame rate remains >=50 FPS on supported devices, as measured by browser performance traces
NFR4: Unboxing transitions < 200ms each; full cascade (up to 15 levels) < 60 seconds including analysis
NFR5: API responses < 300ms at 95th percentile for user-facing actions
NFR6: Initial critical-path frontend assets are <=250KB compressed on first load, as measured by build artifact reports
NFR7: Cumulative layout shift is <=0.1 at p75 on all user-facing pages, as measured by Lighthouse CI and RUM
NFR8: Historical imports process at >=1,000 commits/minute for repositories with <=2,000 average files per commit batch, as measured in import pipeline telemetry
NFR9: All data encrypted in transit (TLS 1.2+) and at rest
NFR10: GitHub OAuth tokens stored encrypted, never exposed to client
NFR11: OAuth tokens scoped to minimum permissions, refreshed before expiration
NFR12: Sessions expire after 30 minutes of inactivity by default (configurable 15-120 minutes), and secure logout invalidates active session tokens within 5 seconds
NFR13: All API endpoints authenticated except public profiles
NFR14: All endpoints enforce rate limiting (default 120 requests/minute per user; auth endpoints 20 requests/minute per IP), as measured by API gateway logs
NFR15: No secrets, tokens, or credentials in application logs
NFR16: Passes OWASP Top 10 vulnerability checks
NFR17: The system supports 1,000 concurrent users with p95 API latency <=500ms and error rate <=1% under MVP load-test profile
NFR18: Import queue handles 200 concurrent jobs without data loss
NFR19: Import processing capacity scales independently of interactive user request capacity, verified by doubling import throughput without increasing p95 API latency by more than 10%
NFR20: Persistent storage supports growth from 1,000 to 10,000 users without requiring data-model redesign, as measured by load and migration tests
NFR21: Monthly infrastructure operating cost remains <$50 at MVP baseline (<=1,000 MAU and <=200 concurrent users), as measured by billing dashboards
NFR22: 99.5% uptime monthly (~3.6 hours downtime/month)
NFR23: XP/level calculations deterministic — reprocessing always produces identical results
NFR24: No confirmed user data loss occurs during failures, deployments, or restarts; recovery objectives are RPO <=5 minutes and RTO <=30 minutes
NFR25: Git sync auto-recovers from transient GitHub API failures (exponential backoff)
NFR26: Failed imports retried 3x before flagging for operator review
NFR27: Daily full backups and 15-minute incremental recovery points are retained for at least 30 days, and monthly restore drills succeed at >=99% rate
NFR28: WCAG 2.1 Level AA compliance across all user-facing pages
NFR29: Skill tree keyboard-navigable (arrow keys, Tab, Enter) with screen reader text alternative
NFR30: All animations respect prefers-reduced-motion; Unboxing has non-animated alternative
NFR31: Color never sole status indicator — icons, labels, or patterns accompany all color coding
NFR32: 100% of forms include programmatically associated labels, linked error messages, and submission feedback, as verified by automated accessibility tests and manual QA checks
NFR33: Keyboard focus indicators have >=3:1 contrast ratio and logical tab order across all interactive views, as verified by accessibility audits
NFR34: Graceful handling of GitHub API rate limits (HTTP 429) with queued retry
NFR35: GitHub API abstracted behind internal interface for version tolerance
NFR36: Webhook processing handles out-of-order, duplicate, and delayed delivery
NFR37: GitHub OAuth succeeds on first attempt for >95% of users
NFR38: GitHub API outages (5xx) handled without crash; work queued for retry

### Additional Requirements

**From Architecture — Starter Template & Infrastructure:**
- Project initialized with Create T3 App (Next.js App Router + TypeScript + Prisma + NextAuth)
- Post-init: MUI + Emotion, Vitest + Testing Library, Playwright added
- Docker Compose required for local orchestration (app + Postgres + supporting services)
- Split web/api/worker services from day one (separate Dockerfiles)
- GitHub Actions CI on PR: build, test, lint (no auto-deploy)
- Environment management via .env only for MVP
- Hosting provider deferred (provider-agnostic structure)

**From Architecture — Data & API:**
- PostgreSQL 18.x as database
- Prisma 7.x + Prisma Migrate as schema/migration system of record
- Zod 4.x request/response boundary validation plus relational DB constraints
- REST-first internal API with standardized typed error envelopes (data/meta/error structure)
- JSON fields camelCase; dates ISO 8601 UTC; nullability explicit
- Correlation IDs on all API requests and logs
- No distributed cache (Redis) in MVP

**From Architecture — Auth & Security:**
- GitHub OAuth via next-auth/Auth.js
- RBAC-lite (user, admin) with resource ownership checks
- JWT-only stateless sessions
- Minimal API security guards now; hardening deferred post-MVP
- Security hardening debt explicitly tracked (rate limiting depth, session rotation, abuse protections)

**From Architecture — Frontend:**
- Redux Toolkit from day one for shared client state
- MUI token-driven design system with feature-folder organization
- Mostly client rendering (explicit SSR/SSG carve-out needed for public profiles)
- Feature-domain project structure: features/auth, features/profile, features/progression, features/unboxing, features/imports
- Shared primitives under shared/ui, shared/lib, shared/types

**From Architecture — Implementation Patterns:**
- Database naming: snake_case tables/columns; indexes idx_<table>_<columns>
- API paths: plural resources, nested patterns (/users/{userId}/badges)
- Code naming: PascalCase components, camelCase functions, SCREAMING_SNAKE constants
- Event system: domain.entity.action.v1 naming; consumers must be idempotent
- Unit tests co-located (*.test.ts); E2E centralized in tests/e2e/
- Loading states: skeletons for content, spinners for short actions; explicit empty/loading/error states

**From Architecture — Known Gaps to Track:**
- SEO vs rendering strategy tension (public profiles need SSR/SSG, rest is SPA)
- Security hardening debt (JWT rotation, rate limiting, abuse protection)
- Hosting provider selection deferred

**From UX — Visual Design Foundation:**
- Dark-first "Neo Arcade" palette: Primary Electric Violet #7C4DFF, Secondary Cyan Glow #00D1FF, Accent Gold #FFC857, Background Deep Navy #0B1020
- Typography: Sora (headings), Inter (body/UI), JetBrains Mono (code/meta)
- 8px base spacing unit; radius scale 8/12/16/20px
- Grid: 12-col desktop, 8-col tablet, 4-col mobile

**From UX — Design Direction:**
- Direction 2 (Story Feed) as base + Direction 3 (RPG Chamber) signature elements
- Narrative-first progression feed with milestone storytelling cards
- Avatar + Level Crest + League Ring identity anchor
- Skill Galaxy View as primary skill visualization

**From UX — Custom Components Required:**
- IdentityHero: persistent identity anchor (Avatar + Level Crest + League Ring)
- StoryMilestoneCard: progression event narrative cards
- WhatChangedPanel: "since last visit" snapshot for return sessions
- SkillGalaxyView: interactive skill tree visualization with keyboard-navigable alternative
- NextActionModule: single clear growth action suggestion
- UnboxingCascadeController: cinematic onboarding sequence with skip/pause/fast-forward
- SparseRecoveryPanel: playful low-data encouragement with constructive next steps

**From UX — Responsive & Accessibility:**
- Mobile-first CSS strategy with progressive enhancement
- Breakpoints: Mobile 320-767px, Tablet 768-1023px, Desktop 1024px+, Large desktop 1440px+
- Functional parity across devices (layout adaptation, not feature removal)
- WCAG 2.1 AA compliance target
- Reduced-motion alternatives for all animations
- 44x44 minimum touch targets on mobile
- Keyboard operability for all critical interactions
- Screen reader support with ARIA labels for dynamic progression visuals

### FR Coverage Map

FR1: Epic 1 - GitHub OAuth authentication
FR2: Epic 1 - GitHub account/repo selection
FR3: Epic 2 - Historical Git data import
FR4: Epic 2 - Process up to 50,000 commits
FR5: Epic 2 - Continuous webhook sync
FR6: Epic 2 - Language detection and attribution
FR7: Epic 2 - GitHub API rate limit handling
FR8: Epic 7 - Disconnect GitHub and delete data
FR9: Epic 2 - Webhook failure retry and dedup
FR10: Epic 3 - XP calculation (heuristic algorithm)
FR11: Epic 3 - Level determination (XP curve)
FR12: Epic 3 - League assignment (Bronze-Diamond)
FR13: Epic 3 - View XP, level, league status
FR14: Epic 3 - Badge awarding on criteria
FR15: Epic 3 - Title awarding on thresholds
FR16: Epic 3 - Badge showcase selection (up to 6)
FR17: Epic 3 - Deterministic XP/level outputs
FR18: Epic 3 - Private XP weights, public principles
FR19: Epic 4 - Language skill tree generation
FR20: Epic 4 - Skill tree node unlocking
FR21: Epic 4 - Display locked/unlocked nodes
FR22: Epic 4 - Interactive skill tree (pan/zoom/select)
FR23: Epic 4 - Node detail view
FR24: Epic 4 - Growth path guarantee (reachable next node)
FR25: Epic 5 - Cascading level-unlock Unboxing sequence
FR26: Epic 5 - Progressive UI feature reveal
FR27: Epic 5 - Cascade animations for badges/titles/nodes
FR28: Epic 5 - Skip/fast-forward Unboxing
FR29: Epic 5 - Sparse data encouragement messaging
FR30: Epic 5 - "Connect more sources" placeholder
FR31: Epic 5 - Reduced-motion alternative
FR32: Epic 6 - View own profile
FR33: Epic 6 - Public profile URL (xpull.dev/{username})
FR34: Epic 6 - Profile customization (bio, links)
FR35: Epic 6 - Display username selection
FR36: Epic 6 - Open Graph meta tags
FR37: Epic 6 - Dynamic OG images
FR38: Epic 6 - SEO crawlability and social preview metadata
FR39: Epic 7 - Private repo name protection
FR40: Epic 7 - Store only derived metrics (no raw code)
FR41: Epic 7 - View collected data
FR42: Epic 7 - Account and data deletion
FR43: Epic 7 - Profile visibility control (public/private)
FR44: Epic 8 - Sync pipeline health dashboard
FR45: Epic 8 - Aggregate platform metrics
FR46: Epic 8 - Individual sync failure investigation
FR47: Epic 8 - Error rate alerting (>5% for 5 min)
FR48: Epic 8 - 1,000 user capacity support

## Epic List

### Epic 1: Project Scaffolding & GitHub Authentication
Users can sign up and sign in to xpull via GitHub OAuth, with the foundational platform running.
**FRs covered:** FR1, FR2

### Epic 2: Git Data Import & Sync Pipeline
Users' complete Git history is imported upon connection and kept automatically up to date through ongoing sync.
**FRs covered:** FR3, FR4, FR5, FR6, FR7, FR9

### Epic 3: Developer Progression Engine
Users can see their XP, level, league, earned badges and titles — the core gamification identity emerges from their Git data.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

### Epic 4: Skill Tree System
Users can explore interactive language skill trees that visualize their growth path with unlocked and locked nodes.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24

### Epic 5: The Unboxing Experience
New users experience xpull's signature cinematic onboarding — a cascading reveal of their developer journey.
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31

### Epic 6: Developer Profile & Social Sharing
Users have a public, shareable developer profile with customization, OG images, and SEO crawlability.
**FRs covered:** FR32, FR33, FR34, FR35, FR36, FR37, FR38

### Epic 7: Data Privacy & Account Management
Users can control their data, manage privacy settings, and fully delete their account — building trust through transparency.
**FRs covered:** FR8, FR39, FR40, FR41, FR42, FR43

### Epic 8: Platform Operations & Monitoring
The platform operator can monitor sync health, investigate failures, view aggregate metrics, and receive alerts.
**FRs covered:** FR44, FR45, FR46, FR47, FR48

---

## Epic 1: Project Scaffolding & GitHub Authentication

Users can sign up and sign in to xpull via GitHub OAuth, with the foundational platform running.

### Story 1.1: Project Initialization & Local Development Environment

As a developer,
I want the xpull project scaffolded with all foundational tooling and a working local development environment,
So that I have a reliable, consistent baseline to build every future feature on.

**Acceptance Criteria:**

**Given** no project exists yet
**When** the initialization commands are run (Create T3 App with App Router, Prisma, NextAuth, PostgreSQL; plus MUI/Emotion, Vitest/Testing Library, Playwright)
**Then** a working Next.js TypeScript application is created with all dependencies installed
**And** `docker-compose.yml` exists at repo root with services for the app and PostgreSQL
**And** running `docker compose up` starts the app and database successfully
**And** Prisma connects to the Dockerized PostgreSQL and migrations can be run
**And** the MUI theme is configured with the Neo Arcade dark palette (Deep Navy background #0B1020, Electric Violet primary #7C4DFF, Cyan Glow secondary #00D1FF, Gold accent #FFC857)
**And** typography tokens are set (Sora headings, Inter body, JetBrains Mono code)
**And** spacing uses 8px base unit
**And** the project structure follows the Architecture doc: `src/app/`, `src/features/`, `src/shared/`, `src/server/`, `src/worker/`, `tests/`
**And** `shared/lib/api-response.ts` defines the standard success/error envelope shapes
**And** `shared/lib/errors.ts` defines the base domain error types
**And** `server/config/env.ts` validates environment variables with Zod
**And** `.env.example` documents all required environment variables
**And** a Vitest config exists and a sample unit test passes
**And** a Playwright config exists and can launch a browser
**And** `.github/workflows/ci.yml` runs lint, typecheck, and unit tests on PR
**And** ESLint is configured and passes on the initial codebase

### Story 1.2: GitHub OAuth Sign-In

As a user,
I want to sign in to xpull with my GitHub account,
So that I can access the platform using my developer identity without creating a separate password.

**Acceptance Criteria:**

**Given** an unauthenticated user visits xpull
**When** they click "Sign in with GitHub"
**Then** they are redirected to GitHub's OAuth authorization page with minimum required scopes
**And** upon granting permission, they are redirected back to xpull and a session is created

**Given** a user completes GitHub OAuth successfully
**When** the callback is processed
**Then** a user record is created in the database (if new) or matched (if returning) using their GitHub ID
**And** the GitHub OAuth token is stored encrypted in the database and never exposed to the client
**And** a JWT session token is issued and stored in an httpOnly secure cookie
**And** the user is redirected to the authenticated dashboard route

**Given** a user has an active session
**When** they visit any authenticated page
**Then** the session is validated and user context is available
**And** the session expires after 30 minutes of inactivity

**Given** a user clicks "Sign out"
**When** the logout action completes
**Then** the session token is invalidated within 5 seconds
**And** the user is redirected to the public landing page

**Given** a user denies the OAuth permission or an error occurs
**When** the OAuth callback receives an error
**Then** the user sees a clear error message with a retry option
**And** no partial user record is created

**Given** authenticated and unauthenticated routes exist
**When** an unauthenticated user attempts to access a protected route
**Then** they are redirected to the sign-in page
**And** public routes (landing page) remain accessible without authentication

### Story 1.3: GitHub Account & Repository Selection

As a user,
I want to select which GitHub accounts and repositories xpull can access,
So that I control exactly what data the platform uses for my developer profile.

**Acceptance Criteria:**

**Given** a user has signed in via GitHub OAuth
**When** they navigate to the settings or onboarding repository selection page
**Then** they see a list of their GitHub accounts (personal + any organizations they have access to)
**And** for each account, they see available repositories grouped by account

**Given** the repository list is displayed
**When** the user selects or deselects specific repositories
**Then** the selections are persisted to the database and associated with the user record
**And** only selected repositories will be used for data import and sync

**Given** a user has previously selected repositories
**When** they return to the repository selection page
**Then** their prior selections are reflected in the UI

**Given** a user changes their repository selection after initial setup
**When** they save the updated selection
**Then** newly added repositories become eligible for import
**And** removed repositories stop syncing (existing derived data is retained until explicit deletion)

**Given** the GitHub API is slow or rate-limited during repository listing
**When** the user opens the selection page
**Then** a loading state is shown with a skeleton placeholder
**And** if the request fails, a clear error message with retry is displayed

---

## Epic 2: Git Data Import & Sync Pipeline

Users' complete Git history is imported upon connection and kept automatically up to date through ongoing sync.

### Story 2.1: Historical Git Data Import

As a user,
I want my complete Git history imported when I connect my GitHub account,
So that xpull can analyze all my past contributions and build my developer profile from day one.

**Acceptance Criteria:**

**Given** a user has connected GitHub and selected repositories
**When** the import is triggered (automatically after repo selection or manually)
**Then** a background worker job is enqueued for the user's selected repositories
**And** the job fetches commits, pull requests, and code reviews from the GitHub API
**And** raw events are normalized into internal domain events and persisted to the database
**And** each persisted event includes: user ID, repo reference (no private repo names in public surfaces), event type, timestamp, and metadata
**And** the import creates only the database tables/entities it needs (git_events, imports, repos)

**Given** a repository with up to 50,000 commits
**When** the historical import processes it
**Then** all commits are imported without failure
**And** processing throughput is >=1,000 commits/minute

**Given** an import is in progress
**When** the user checks their dashboard
**Then** they see the import status (queued, in progress with percentage, completed, or failed)

**Given** an import fails partway through
**When** the failure is detected
**Then** the import is retried up to 3 times automatically
**And** already-processed events are not duplicated (idempotent by event ID)
**And** if all retries fail, the import is flagged for operator review

**Given** multiple users trigger imports simultaneously
**When** the import queue has up to 200 concurrent jobs
**Then** all jobs are processed without data loss
**And** import processing does not degrade interactive API response times

### Story 2.2: Language Detection & Attribution

As a user,
I want xpull to detect which programming languages I use and attribute my activity to each language,
So that my skill profile accurately reflects the technologies I work with.

**Acceptance Criteria:**

**Given** Git events have been imported or synced
**When** the language detection process runs
**Then** each event is analyzed to determine the programming language(s) involved
**And** language attribution is stored per event in the database

**Given** a commit touches multiple languages (e.g., TypeScript and Python files)
**When** the attribution is calculated
**Then** the commit is attributed proportionally or to all relevant languages

**Given** a language cannot be determined (e.g., configuration files, binary data)
**When** detection runs
**Then** those events are categorized appropriately (e.g., "Other" or excluded from language-specific attribution)
**And** no error is raised for unrecognizable file types

**Given** the GitHub API provides language metadata for repositories
**When** that metadata is available
**Then** it is used to supplement file-level detection for improved accuracy

### Story 2.3: Ongoing Git Sync via Webhooks

As a user,
I want my new Git activity to sync automatically after initial import,
So that my profile stays up to date without any manual action.

**Acceptance Criteria:**

**Given** a user has completed initial import for selected repositories
**When** the import completes
**Then** GitHub webhooks are registered for push events, pull request events, and review events on selected repositories

**Given** a webhook event arrives from GitHub
**When** the event is received by the webhook endpoint
**Then** it is validated (signature verification) and enqueued for processing
**And** the worker normalizes it into the same internal event format used by historical import
**And** language detection runs on the new event

**Given** webhook events arrive out of order
**When** they are processed
**Then** the system handles them correctly based on event timestamps, not arrival order

**Given** a duplicate webhook event arrives (same delivery ID)
**When** it is received
**Then** it is deduplicated and not processed twice

**Given** a webhook delivery fails (GitHub retries)
**When** the retry arrives
**Then** it is processed successfully without creating duplicate events

**Given** the webhook endpoint is temporarily unavailable
**When** GitHub retries delivery
**Then** events are processed upon recovery with no data loss

### Story 2.4: GitHub API Rate Limit & Error Resilience

As a user,
I want the system to handle GitHub API limitations gracefully,
So that my data import and sync never loses data even when GitHub is slow or unavailable.

**Acceptance Criteria:**

**Given** the GitHub API returns HTTP 429 (rate limit exceeded)
**When** the import or sync worker encounters it
**Then** the worker pauses and retries with exponential backoff
**And** the retry-after header is respected if present
**And** no data is lost and no partial state is left inconsistent

**Given** the GitHub API returns 5xx server errors
**When** the worker encounters them
**Then** the work item is requeued for retry with exponential backoff
**And** the system does not crash
**And** up to 3 retries are attempted before flagging for operator review

**Given** the authenticated user's rate limit (5,000 requests/hour) is approaching exhaustion
**When** the remaining quota drops below a threshold
**Then** API calls are batched and queued to stay within limits
**And** import progress is paused rather than failed

**Given** GitHub API calls are made throughout the codebase (import, sync, repo listing)
**When** any module needs to call GitHub
**Then** all calls go through an internal GitHub API abstraction layer
**And** the abstraction handles auth headers, rate limit tracking, error classification, and retry logic
**And** this abstraction enables future GitHub API version changes without modifying consumers

---

## Epic 3: Developer Progression Engine

Users can see their XP, level, league, earned badges and titles — the core gamification identity emerges from their Git data.

### Story 3.1: XP Calculation Engine

As a user,
I want my Git activity to be scored with XP using a quality-weighting algorithm,
So that my developer effort is quantified fairly based on what I actually do.

**Acceptance Criteria:**

**Given** imported or synced Git events exist for a user
**When** the XP calculation engine processes them
**Then** each qualifying event receives an XP value based on a heuristic quality-weighting algorithm
**And** XP values are recorded in an XP ledger table with event reference, user ID, XP amount, and timestamp

**Given** the same set of Git events for a user
**When** XP calculation is run multiple times (including full reprocessing)
**Then** the results are identical every time (deterministic output)

**Given** the XP algorithm weights different activity types
**When** calculating XP
**Then** commits, pull requests, and code reviews each have distinct base weights
**And** quality signals (e.g., PR size, review depth, merge vs close) modify the base weight

**Given** a user has potential gaming patterns (e.g., many trivial split commits)
**When** XP is calculated
**Then** the algorithm applies anti-gaming heuristics that reduce or zero-out XP for suspicious patterns
**And** no user-facing notification or shaming occurs (silent zero-reward)

**Given** the XP engine runs after import or sync
**When** new events arrive
**Then** only new/unprocessed events are scored (incremental calculation)
**And** existing XP ledger entries are not modified

### Story 3.2: Level & League System

As a user,
I want my XP to translate into a clear level and league,
So that I can see my overall progression at a glance and feel the momentum of growth.

**Acceptance Criteria:**

**Given** a user has accumulated XP in their ledger
**When** the level calculation runs
**Then** the user's level is determined based on a defined XP-per-level curve
**And** the level result is stored on the user's progression record

**Given** the XP-per-level curve
**When** applied across a range of simulated profiles (beginner to 5+ years active)
**Then** there is no "wall" where active developers stop feeling progress
**And** the curve provides meaningful level-ups for both new and experienced developers

**Given** a user's total XP
**When** league assignment runs
**Then** the user is placed in a motivation league (Bronze, Silver, Gold, Platinum, Diamond) based on personal XP thresholds
**And** league thresholds are absolute (not competitive ranking)
**And** every user can eventually reach Diamond through sustained activity
**And** there is no demotion from a league once achieved

**Given** a user's level or league changes
**When** the change is persisted
**Then** the previous and new values are recorded for later use by the Unboxing and progression UI

**Given** the same XP total
**When** level and league are calculated
**Then** the result is always identical (deterministic)

### Story 3.3: Badge & Title Awarding

As a user,
I want to earn badges and titles when I hit specific milestones,
So that I get recognized for meaningful achievements in my coding journey.

**Acceptance Criteria:**

**Given** a set of predefined badge criteria exist (e.g., Bug Slayer: >=10 merged bug-fix PRs in 30 days)
**When** the badge evaluation engine runs after XP/level computation
**Then** the user's Git event history is checked against each badge's criteria
**And** newly qualified badges are awarded and stored with the award timestamp

**Given** a set of predefined title criteria exist (e.g., Polyglot: activity in >=3 languages above threshold)
**When** the title evaluation engine runs
**Then** titles are awarded when level or milestone thresholds are reached
**And** a user can hold multiple titles simultaneously

**Given** a badge or title has already been awarded to a user
**When** the evaluation engine runs again
**Then** it is not re-awarded or duplicated

**Given** the badge and title definitions
**When** new badge/title types are added in the future
**Then** the engine supports adding new criteria without modifying the core evaluation logic (data-driven definitions)

**Given** a user earns a badge or title
**When** the award is persisted
**Then** it includes the badge/title ID, user ID, criteria snapshot, and award timestamp

### Story 3.4: Progression Dashboard & Badge Showcase

As a user,
I want to view my XP, level, league, badges, and titles on a dashboard,
So that I can see my complete developer progression at a glance and choose which badges to showcase.

**Acceptance Criteria:**

**Given** a user is authenticated and has progression data
**When** they navigate to their dashboard
**Then** they see their current XP total, level, and league displayed prominently
**And** the IdentityHero component shows their avatar, level crest, and league ring
**And** the WhatChangedPanel shows XP gained and any level/badge changes since their last visit

**Given** a user has earned badges
**When** they view their badge collection
**Then** all earned badges are displayed with name, description, and award date
**And** unearned badges they are close to achieving are shown as locked with progress indicators

**Given** a user wants to showcase specific badges
**When** they select up to 6 badges for their showcase
**Then** the selections are persisted and will appear on their public profile
**And** they can change their showcase selection at any time

**Given** a user has earned titles
**When** they view their titles
**Then** all earned titles are displayed
**And** their currently active/displayed title is indicated

**Given** the dashboard displays scoring information
**When** a user looks for explanation
**Then** at least three scoring principles are visible: "quality over quantity", "review depth matters", and "anti-gaming checks apply"
**And** exact XP weights are not exposed

**Given** the dashboard loads
**When** data is being fetched
**Then** skeleton loading states appear for each section
**And** the page reaches largest contentful render within 2.5 seconds

---

## Epic 4: Skill Tree System

Users can explore interactive language skill trees that visualize their growth path with unlocked and locked nodes.

### Story 4.1: Skill Tree Data Model & Generation

As a user,
I want the system to generate a language skill tree based on my coding activity,
So that I can see a structured representation of my skills across different programming languages.

**Acceptance Criteria:**

**Given** a user has imported/synced Git events with language attribution
**When** the skill tree generation engine runs
**Then** one skill tree branch is created per detected programming language
**And** each branch contains a hierarchy of nodes representing increasing mastery

**Given** a language branch exists
**When** the user's activity thresholds for that language are evaluated
**Then** nodes are unlocked progressively based on Git activity volume and quality per language
**And** unlock thresholds increase for deeper nodes in the tree

**Given** an active developer (>=5 qualifying activities in the last 30 days)
**When** the skill tree is generated
**Then** at least one next node is reachable (unlockable within <=20 additional qualifying activities)
**And** the growth path guarantee is validated programmatically

**Given** a user has activity in a new language
**When** the skill tree is regenerated
**Then** a new branch appears for that language with appropriate initial node unlocks

**Given** the skill tree data model
**When** data is stored
**Then** each node includes: node ID, language, tier/depth, unlock criteria, unlock status, and unlock timestamp
**And** the tree structure supports the SkillGalaxyView visualization requirements

### Story 4.2: Interactive Skill Tree Visualization

As a user,
I want to explore my skill trees through an interactive visual diagram,
So that I can see my growth across languages and understand what I can unlock next.

**Acceptance Criteria:**

**Given** a user has skill tree data
**When** they navigate to the skill tree view
**Then** the SkillGalaxyView component renders with branches for each language
**And** unlocked nodes are visually distinct from locked nodes
**And** the growth path (next reachable nodes) is visually highlighted

**Given** the skill tree is displayed
**When** the user interacts with it
**Then** they can pan and zoom the visualization
**And** they can select individual nodes by clicking/tapping

**Given** a user selects a node
**When** the node detail panel opens
**Then** it shows the node's meaning/description, unlock criteria, and earned status
**And** if locked, it shows progress toward unlocking (e.g., "3 of 10 qualifying activities")

**Given** the skill tree renders
**When** measured for performance
**Then** initial render completes in <=500ms
**And** interaction frame rate remains >=50 FPS on supported devices

**Given** a user navigates the skill tree with keyboard
**When** using arrow keys, Tab, and Enter
**Then** all nodes are reachable and selectable via keyboard
**And** screen reader text alternatives describe each node's state and meaning

**Given** a user with `prefers-reduced-motion` enabled
**When** they view the skill tree
**Then** transitions and animations are replaced with static or minimal-motion alternatives

**Given** the skill tree is viewed on mobile (320-767px)
**When** the layout adapts
**Then** a condensed card-based view with touch navigation is provided
**And** all node details remain accessible

---

## Epic 5: The Unboxing Experience

New users experience xpull's signature cinematic onboarding — a cascading reveal of their developer journey.

### Story 5.1: Unboxing Cascade Engine

As a new user,
I want to experience a cascading level-unlock sequence that replays my Git progression,
So that I feel the excitement of discovering how much I've already accomplished.

**Acceptance Criteria:**

**Given** a new user has completed their historical import
**When** the Unboxing is triggered (automatically after import or via explicit start)
**Then** a cascading sequence begins that replays the user's progression from Level 1 to their current level

**Given** the cascade is running
**When** each level is reached in the sequence
**Then** the level number is displayed with a transition animation
**And** any features unlocked at that level threshold are progressively revealed in the UI

**Given** the user reaches levels where badges, titles, or skill tree nodes were earned
**When** those thresholds are hit in the cascade
**Then** the relevant achievements are highlighted within the sequence

**Given** the cascade runs for up to 15 levels
**When** measured for pacing
**Then** each transition takes <200ms
**And** the full cascade completes in <60 seconds including analysis time

**Given** the Unboxing flow reaches completion
**When** the final level is displayed
**Then** a summary screen shows: current level, key unlocks, skill tree preview, and earned badges/titles
**And** clear next-action CTAs are presented: "Explore Skill Galaxy", "View Profile", "Share Milestone"

**Given** the Unboxing cascade engine
**When** it orchestrates the sequence
**Then** it uses precomputed progression data (not real-time calculation) for smooth pacing

### Story 5.2: Unboxing Animations & User Controls

As a new user,
I want the Unboxing to be visually exciting but fully under my control,
So that I can enjoy the experience at my own pace or skip it if I prefer.

**Acceptance Criteria:**

**Given** the Unboxing cascade is running
**When** badges, titles, and skill tree nodes are revealed
**Then** each is accompanied by a celebration animation appropriate to its significance

**Given** the Unboxing is in progress
**When** the user clicks "Skip" or "Fast Forward"
**Then** skipping jumps directly to the final summary screen with all results
**And** fast-forward accelerates the cascade to complete quickly
**And** the user still sees their complete final state

**Given** a user has `prefers-reduced-motion` enabled or has toggled the reduced-motion setting
**When** the Unboxing runs
**Then** all non-essential animations are replaced with static or minimal-motion transitions
**And** the content and pacing remain comprehensible without animation

**Given** the UnboxingCascadeController component
**When** it renders
**Then** it shows a sequence stage indicator, the reveal viewport, and skip/pause/fast-forward controls
**And** controls are keyboard accessible

**Given** the Unboxing is viewed on mobile
**When** the layout adapts
**Then** the experience is functional with appropriately sized controls and readable content
**And** touch gestures work for controls

### Story 5.3: Sparse Data & Multi-Provider Handling

As a new user with limited Git history,
I want to feel encouraged rather than disappointed by a short Unboxing,
So that I still see xpull as valuable and want to grow my profile.

**Acceptance Criteria:**

**Given** a user's imported history has fewer than 50 commits
**When** the sparse-data criteria are met
**Then** the system displays contextual encouragement messaging
**And** the tone is playful and constructive, not apologetic or dismissive

**Given** the SparseRecoveryPanel is displayed
**When** a sparse-data user sees it
**Then** it explains why the output is limited (few public repos, limited history)
**And** it presents immediate constructive actions: start/link a project, learn how XP grows, get notified for new source integrations

**Given** only one Git provider (GitHub) is connected
**When** the user views their settings or post-Unboxing screen
**Then** a "Connect more sources" placeholder is displayed
**And** it indicates GitLab and Bitbucket support is coming soon

**Given** a sparse-data user completes Unboxing
**When** the summary screen appears
**Then** it frames their current state as "the beginning of your journey" rather than a low score
**And** next-action CTAs emphasize growth opportunities

---

## Epic 6: Developer Profile & Social Sharing

Users have a public, shareable developer profile with customization, OG images, and SEO crawlability.

### Story 6.1: Profile Page & Customization

As a user,
I want to view and customize my developer profile,
So that I have a personal page that represents my coding identity the way I want.

**Acceptance Criteria:**

**Given** a user is authenticated
**When** they navigate to their profile page
**Then** they see their level, league, skill tree summary, active title, and showcased badges
**And** the IdentityHero component displays their avatar, level crest, and league ring

**Given** a user wants to customize their profile
**When** they edit their profile settings
**Then** they can set a bio (text field, reasonable character limit)
**And** they can add external links (e.g., personal site, Twitter, LinkedIn)
**And** changes are saved and immediately reflected on the profile

**Given** a user wants to choose a display username
**When** they set or change their username
**Then** the username is validated for uniqueness, length, and allowed characters
**And** the username determines their public profile URL path

**Given** a user views their profile
**When** the page loads
**Then** it shows the StoryMilestoneCard feed with recent progression events
**And** it displays the SkillGalaxyView in a mini-preview mode
**And** the NextActionModule suggests a growth action

### Story 6.2: Public Profile & SEO

As a visitor (or the profile owner sharing a link),
I want to access a developer's public profile via a clean URL that renders well for search engines,
So that profiles are discoverable and shareable as professional developer identity pages.

**Acceptance Criteria:**

**Given** a user has a public profile
**When** a visitor navigates to `xpull.dev/{username}`
**Then** the profile page renders with the user's level, league, skill tree summary, showcased badges, title, bio, and links

**Given** a public profile URL is requested
**When** the server processes it
**Then** the page is server-side rendered (SSR) with complete HTML content
**And** the response includes proper semantic HTML landmarks and heading hierarchy

**Given** a search engine crawler visits a public profile
**When** it indexes the page
**Then** the HTML contains all relevant profile content without requiring JavaScript execution
**And** JSON-LD structured data for the developer profile is included

**Given** a public profile page
**When** measured for performance
**Then** first contentful render is <=1.5s at p75 on standard broadband
**And** cumulative layout shift is <=0.1

**Given** a user's profile is set to private
**When** a visitor navigates to their profile URL
**Then** a graceful "profile not available" page is shown (not a raw 404)

### Story 6.3: Social Sharing & OG Images

As a user,
I want my profile to generate rich social previews when shared on Twitter, LinkedIn, or Slack,
So that sharing my developer identity looks impressive and drives curiosity.

**Acceptance Criteria:**

**Given** a public profile page
**When** the HTML head is rendered
**Then** Open Graph meta tags are included: og:title, og:description, og:image, og:url
**And** Twitter Card meta tags are included for optimized Twitter/X previews

**Given** a profile needs an OG image
**When** the image is generated
**Then** a dynamic OG image is created per profile showing: skill tree summary visualization, current level, league emblem, and username
**And** the image dimensions conform to OG image best practices (1200x630)

**Given** a user's progression changes (level up, new badge, etc.)
**When** their profile is next shared
**Then** the OG image reflects the updated state

**Given** a profile URL is pasted in Slack, Twitter, LinkedIn, or iMessage
**When** the platform fetches the preview
**Then** a rich card appears with the profile title, description, and dynamic OG image

---

## Epic 7: Data Privacy & Account Management

Users can control their data, manage privacy settings, and fully delete their account — building trust through transparency.

### Story 7.1: Data Privacy & Protection

As a user,
I want xpull to protect my private repository information and store only what's necessary,
So that I can trust the platform with my Git data.

**Acceptance Criteria:**

**Given** a user has imported data from private repositories
**When** any public-facing surface renders (public profile, OG images, shared content)
**Then** private repository names, file paths, and code content never appear
**And** only aggregate language/activity metrics are shown for private repo contributions

**Given** the system stores Git-derived data
**When** data is persisted
**Then** only derived metrics and metadata are stored (XP, language attribution, event type, timestamps)
**And** raw code, full diffs, and comment thread content are excluded from storage

**Given** the data storage model
**When** reviewed for compliance
**Then** no user data allows reconstruction of source code or repository file structure
**And** the data minimization principle is enforced at the ingestion layer (not just display layer)

### Story 7.2: Data Transparency & Account Deletion

As a user,
I want to see what data xpull has collected about me and be able to delete everything,
So that I remain in full control of my information.

**Acceptance Criteria:**

**Given** a user navigates to their data/privacy settings
**When** they request to view their collected data
**Then** they see a summary of: connected accounts, imported repositories, total events processed, derived metrics stored, and date ranges

**Given** a user wants to disconnect their GitHub account
**When** they click "Disconnect GitHub"
**Then** a confirmation dialog explains what will happen
**And** upon confirmation, the OAuth token is revoked/deleted, webhooks are unregistered, and all imported Git events and derived data for that account are permanently deleted

**Given** a user wants to delete their entire account
**When** they click "Delete Account"
**Then** a confirmation dialog requires explicit confirmation (e.g., typing username)
**And** upon confirmation, all user data is permanently deleted: profile, progression, badges, skill trees, imported events, OAuth tokens
**And** the username is released
**And** the operation completes and the user is signed out

**Given** a deletion is requested
**When** the deletion process runs
**Then** it completes within a reasonable timeframe and the user receives confirmation
**And** deleted data is not recoverable

### Story 7.3: Profile Visibility Controls

As a user,
I want to control whether my profile is public or private,
So that I can choose when and how my developer identity is visible to others.

**Acceptance Criteria:**

**Given** a user navigates to their privacy settings
**When** they toggle profile visibility
**Then** they can switch between "public" and "private" modes
**And** the change takes effect immediately

**Given** a profile is set to public
**When** a visitor navigates to the user's profile URL
**Then** the full public profile renders with progression, skill trees, badges, and bio

**Given** a profile is set to private
**When** a visitor navigates to the user's profile URL
**Then** a graceful "this profile is not publicly available" message is shown
**And** no progression data, skill tree, or badge information is revealed
**And** search engines receive appropriate signals to not index the page (noindex)

**Given** a new user creates an account
**When** no visibility preference has been set
**Then** the default visibility is public (encouraging sharing)
**And** the user is informed of this default during onboarding with an easy way to change it

---

## Epic 8: Platform Operations & Monitoring

The platform operator can monitor sync health, investigate failures, view aggregate metrics, and receive alerts.

### Story 8.1: Sync Pipeline Health Dashboard

As a platform operator,
I want to view the health of the Git sync pipeline and investigate failures,
So that I can keep the platform running smoothly and fix issues before users notice.

**Acceptance Criteria:**

**Given** the operator is authenticated with admin role
**When** they navigate to the admin dashboard
**Then** they see a sync pipeline health overview showing: active webhooks, queue depth, processing rate, and recent error rate

**Given** the pipeline health dashboard is displayed
**When** errors have occurred
**Then** the operator sees a list of recent sync/import failures with: user reference, error type, timestamp, and retry status
**And** they can click into an individual failure to see detailed error information and event context

**Given** an import has failed after all retries
**When** the operator views it
**Then** they see the failure reason, number of retries attempted, and the data state at point of failure
**And** they can trigger a manual retry if appropriate

**Given** the pipeline is operating normally
**When** the operator views the dashboard
**Then** key health indicators show green status
**And** recent processing throughput is visible

### Story 8.2: Platform Metrics & Alerting

As a platform operator,
I want to see aggregate platform metrics and receive alerts when things go wrong,
So that I can understand platform health and respond to incidents quickly.

**Acceptance Criteria:**

**Given** the operator is on the admin dashboard
**When** they view platform metrics
**Then** they see aggregate data: total users, active users (last 7/30 days), Unboxing completion count and rate, and import success rate

**Given** the import or webhook error rate exceeds 5%
**When** this threshold is sustained for 5 consecutive minutes
**Then** an alert is triggered and visible in the admin dashboard
**And** the alerting mechanism supports future extension to email/Slack notifications

**Given** the platform is under load
**When** up to 1,000 users are active
**Then** the system operates without degradation
**And** API latency remains within p95 <=500ms targets
**And** error rate stays <=1%

**Given** the metrics dashboard
**When** it displays data
**Then** metrics are refreshed at a reasonable interval (not real-time, but within minutes)
**And** historical trends are visible for at least the last 7 days
