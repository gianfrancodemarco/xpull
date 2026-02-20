---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories-epic-2']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
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

**From Architecture:**
- Starter template: Create T3 App (`pnpm dlx create-t3-app@latest xpull --CI --appRouter --prisma --nextAuth --dbProvider postgres --tailwind false`) — impacts Epic 1, Story 1
- Post-init setup: MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs`, `@emotion/cache`), Vitest, Playwright
- Database: PostgreSQL 18.x with Prisma 7.x ORM + Prisma Migrate
- Validation: Zod 4.x at API boundaries + DB constraints
- Authentication: GitHub OAuth via next-auth/Auth.js with JWT-only stateless sessions
- Authorization: RBAC-lite (user, admin) with resource ownership checks
- API pattern: REST-first internal API with standardized typed error envelope (data/error + meta with requestId/timestamp)
- Frontend state: Redux Toolkit from day one, feature-folder organization
- UI framework: MUI token-driven design system (no Tailwind)
- Infrastructure: Docker Compose required for local orchestration; split web/api/worker services immediately
- CI/CD: GitHub Actions on PR for build/test/lint (no auto-deploy)
- Testing: Vitest (unit) + Playwright (E2E), co-located unit tests
- Event system: domain.entity.action.v1 naming, idempotent consumers, eventId deduplication
- Code conventions: PascalCase components, useCamelCase hooks, camelCase functions/variables, SCREAMING_SNAKE_CASE constants
- DB naming: snake_case tables (plural), snake_case columns, idx_/uq_ prefixes for indexes/constraints
- API naming: plural resources, camelCase query params, x-xpull- custom header prefix
- Project structure: features/, shared/, server/, worker/ organization with strict boundaries
- Error handling: domain error codes, correlation IDs, friendly UI messages
- Environment: .env only for MVP

**From UX Design:**
- Dark-first "Neo Arcade" color palette (Electric Violet #7C4DFF primary, Cyan Glow #00D1FF secondary, Gold #FFC857 accent, Deep Navy #0B1020 background)
- Typography: Sora (headings/display), Inter (body/UI), JetBrains Mono (code/meta)
- Spacing: 8px base unit, 4px micro-adjustment, radius scale 8/12/16/20px
- Grid: 12-col desktop, 8-col tablet, 4-col mobile
- Design direction: Direction 2 (Story Feed) base + Direction 3 (RPG Chamber) identity elements
- Custom components required: IdentityHero, StoryMilestoneCard, WhatChangedPanel, SkillGalaxyView, NextActionModule, UnboxingCascadeController, SparseRecoveryPanel
- Responsive: mobile-first CSS, breakpoints 320-767 (mobile), 768-1023 (tablet), 1024+ (desktop)
- Minimum touch target: 44x44 on mobile
- WCAG 2.1 AA compliance baseline
- prefers-reduced-motion support for all animations
- Color never sole status indicator (color + icon + text)
- Focus indicators with >=3:1 contrast ratio
- Skeleton loading for content surfaces, spinners for short actions
- Single primary CTA per major surface
- Progression-first hierarchy: key progression signals above secondary detail

**From PRD Validation Report:**
- FR14, FR15 need explicit badge/title criteria and thresholds for deterministic award logic
- FR18 needs explicitly listed scoring principles and verification points
- FR24 needs measurable "active developer" and "reachable next node" thresholds (addressed in updated PRD)
- FR47 needs numeric alert thresholds (addressed in updated PRD: 5% error rate for 5 consecutive minutes)
- Orphan FRs (FR41, FR43) need explicit journey traceability
- Some NFRs need clearer measurement methods (addressed in updated PRD)

### FR Coverage Map

FR1: Epic 1 (#3) - GitHub OAuth authentication
FR2: Epic 1 (#3) - Repository selection
FR3: Epic 2 (#4) - Historical Git data import
FR4: Epic 2 (#4) - Import up to 50,000 commits
FR5: Epic 2 (#4) - Continuous webhook sync
FR6: Epic 2 (#4) - Language detection and attribution
FR7: Epic 2 (#4) - GitHub API rate limit handling
FR8: Epic 1 (#3) - Disconnect GitHub and delete data
FR9: Epic 2 (#4) - Webhook failure retry and deduplication
FR10: Epic 3 (#5) - XP calculation engine
FR11: Epic 3 (#5) - Level determination
FR12: Epic 3 (#5) - League assignment
FR13: Epic 3 (#5) - View XP, level, league status
FR14: Epic 3 (#5) - Badge awarding
FR15: Epic 3 (#5) - Title awarding
FR16: Epic 3 (#5) - Badge showcase selection
FR17: Epic 3 (#5) - Deterministic XP/level outputs
FR18: Epic 3 (#5) - Private XP weights with public principles
FR19: Epic 4 (#6) - Language skill tree generation
FR20: Epic 4 (#6) - Skill tree node unlock logic
FR21: Epic 4 (#6) - Locked/unlocked node display
FR22: Epic 4 (#6) - Interactive skill tree visualization
FR23: Epic 4 (#6) - Node detail inspection
FR24: Epic 4 (#6) - Reachable next node guarantee
FR25: Epic 5 (#7) - Cascading level-unlock sequence
FR26: Epic 5 (#7) - Progressive UI reveal during Unboxing
FR27: Epic 5 (#7) - Cascade animations for badges/titles/nodes
FR28: Epic 5 (#7) - Skip/fast-forward Unboxing
FR29: Epic 5 (#7) - Sparse data encouragement messaging
FR30: Epic 5 (#7) - Connect more sources placeholder
FR31: Epic 5 (#7) - Reduced-motion alternative
FR32: Epic 6 (#8) - View profile
FR33: Epic 6 (#8) - Public profile shareable URL
FR34: Epic 6 (#8) - Profile customization (bio, links)
FR35: Epic 6 (#8) - Display username
FR36: Epic 6 (#8) - Open Graph meta tags
FR37: Epic 6 (#8) - Dynamic OG images
FR38: Epic 6 (#8) - SEO crawlability
FR39: Epic 2 (#4) - Private repo names never on public profiles
FR40: Epic 2 (#4) - Store only derived metrics
FR41: Epic 6 (#8) - View collected data
FR42: Epic 6 (#8) - Delete account and data
FR43: Epic 6 (#8) - Profile visibility controls
FR44: Epic 7 (#9) - Git sync pipeline health
FR45: Epic 7 (#9) - Aggregate platform metrics
FR46: Epic 7 (#9) - Individual sync failure investigation
FR47: Epic 7 (#9) - Automated error rate alerting
FR48: Epic 7 (#9) - Support 1,000 users

## Epic List

### Epic 1: Project Foundation & Developer Authentication (GitHub Issue #3)
Users can sign up with GitHub OAuth, access the platform, and manage their connection. Scaffolds project foundation (T3 App, Docker Compose, PostgreSQL, CI, auth, error envelope, project structure). Includes authenticated navigation shell for post-login route access.
**FRs covered:** FR1, FR2, FR8
**Stories:** 1.1 (#10), 1.2 (#11), 1.3 (#12), 1.4 (#13), 1.5 (#18 — Authenticated Navigation Shell, added via sprint-change-proposal-2026-02-18)

### Epic 2: Git Data Ingestion Pipeline (GitHub Issue #4)
Users have their real-world coding activity automatically imported and kept in sync, with privacy-safe data handling.
**FRs covered:** FR3, FR4, FR5, FR6, FR7, FR9, FR39, FR40
**Stories:** 2.1 (#20), 2.2 (#21 — blocked by #20), 2.3 (#22 — blocked by #20), 2.4 (#23 — blocked by #20, #21)

### Epic 3: Developer Progression Engine (GitHub Issue #5)
Users can see their XP, level, league, badges, and titles calculated deterministically from their real Git activity.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

### Epic 4: Skill Tree System (GitHub Issue #6)
Users can explore interactive language skill trees that visualize their coding growth across languages.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24

### Epic 5: The Unboxing Experience (GitHub Issue #7)
New users experience a memorable, cinematic reveal of their developer journey through cascading level, badge, and skill tree unlocks.
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31

### Epic 6: Developer Profile & Social Sharing (GitHub Issue #8)
Users have a shareable public profile showcasing their developer identity, with full control over visibility, customization, and data transparency.
**FRs covered:** FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR41, FR42, FR43

### Epic 7: Platform Operations & Observability (GitHub Issue #9)
Operators can monitor platform health, investigate failures, and receive alerts when issues arise.
**FRs covered:** FR44, FR45, FR46, FR47, FR48

## Epic-to-Issue Mapping

| Epic | GitHub Issue | Issue ID |
|------|-------------|----------|
| Epic 1: Project Foundation & Developer Authentication | #3 | I_kwDORRrwu87rn21m |
| Epic 2: Git Data Ingestion Pipeline | #4 | I_kwDORRrwu87rn3IY |
| Epic 3: Developer Progression Engine | #5 | I_kwDORRrwu87rn3hI |
| Epic 4: Skill Tree System | #6 | I_kwDORRrwu87rn3yJ |
| Epic 5: The Unboxing Experience | #7 | I_kwDORRrwu87rn4JU |
| Epic 6: Developer Profile & Social Sharing | #8 | I_kwDORRrwu87rn4gS |
| Epic 7: Platform Operations & Observability | #9 | I_kwDORRrwu87rn4yB |
