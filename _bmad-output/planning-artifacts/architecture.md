---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-xpull-2026-02-16.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-17'
project_name: 'xpull'
user_name: 'Gianfranco'
date: '2026-02-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The requirements define a product with three tightly coupled capability planes:

1) **Data ingestion and normalization**
- OAuth-based GitHub connection, historical import, webhook-driven incremental sync, language attribution, and failure/retry handling.
- Architecturally implies an ingestion pipeline separated from user-facing request paths, with idempotent processing and replay-safe event handling.

2) **Progression intelligence and rules**
- Deterministic XP/level/league computation, badge/title awarding, anti-gaming posture, and skill-tree unlock logic.
- Architecturally implies a rules/engine layer with versioned scoring logic, auditable derivations, and stable recomputation behavior.

3) **Experience delivery**
- Unboxing sequence, interactive skill exploration, public profile + OG sharing, privacy controls, and operator visibility.
- Architecturally implies dual rendering strategy (interactive app + SEO/public profile serving), plus API boundaries optimized for both session UX and background sync outcomes.

Overall FR profile indicates a system that is not CRUD-centric: it is **event-derived, rules-driven, and UX-sensitive**.

**Non-Functional Requirements:**
NFRs will strongly constrain architecture in these ways:

- **Performance:** strict page/interaction budgets, fast profile rendering, responsive skill interactions, and bounded Unboxing pacing.
- **Security:** encrypted transport/storage, protected OAuth credentials, scoped access, authenticated APIs, and hardened logging.
- **Scalability:** concurrent users plus concurrent import jobs with isolated scaling between interactive API traffic and ingestion workloads.
- **Reliability:** deterministic recomputation, queue/retry resilience, failure recovery objectives, and backup/restore discipline.
- **Accessibility:** WCAG 2.1 AA, keyboard and screen reader support, non-color status communication, reduced-motion alternatives.
- **Integration robustness:** first-class handling for GitHub rate limits, webhook disorder/duplication, and provider outages.

These NFRs indicate architecture must optimize for **predictability, safety, and operability**, not only feature velocity.

**Scale & Complexity:**
The project has medium-high architectural complexity because it combines:
- event-driven ingestion + deterministic derivation,
- high-visibility interactive UX,
- strict privacy/security boundaries,
- and operator-grade observability.

- Primary domain: Full-stack web application (developer gamification/identity)
- Complexity level: Medium-high
- Estimated architectural components: 11-14 major components/subsystems

### Technical Constraints & Dependencies

- Dependency on GitHub APIs, OAuth, webhooks, and platform rate limits.
- Requirement to avoid exposing private repo identifiers/code content in public surfaces.
- Deterministic progression outcomes for trust and reproducibility.
- Responsive web-only MVP with near-parity core experience across desktop/mobile.
- No offline-first requirement for MVP; connected model is acceptable.
- Public profile discoverability/social preview requirements drive server-rendered/public edge strategy.
- Operational constraints include import throughput, queue depth management, and error alerting.

### Cross-Cutting Concerns Identified

- **Authentication and identity boundary:** secure GitHub account linking and session management.
- **Data privacy and minimization:** derived-metric storage and strict public/private data partitioning.
- **Deterministic domain logic:** stable, versioned XP/skill computations and recomputation consistency.
- **Resilience and idempotency:** webhook deduplication, retries, backoff, and eventual consistency.
- **Observability and operations:** pipeline health metrics, error investigation paths, and threshold alerts.
- **Performance engineering:** separation of background compute from user-facing latency budgets.
- **Accessibility and inclusive interaction:** keyboard paths, text alternatives, reduced motion.
- **Trust UX:** explainability cues ("why this level/unlock"), transparent sparse-data handling, and anti-pressure interaction patterns.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (React-based) based on project requirements analysis and user preferences:
- Full TypeScript across frontend and backend
- React UI requirements with complex interactive UX
- PostgreSQL-backed persistence and deterministic domain logic
- Dockerized local/prod parity requirement

### Starter Options Considered

1. **Create T3 App (Recommended)**
- Current official init: `npm create t3-app@latest`
- Official advanced/CI flags available for deterministic scaffolding
- Stack includes modular selection of Next.js, TypeScript, Prisma/Drizzle, auth, styling, API layer
- Official Docker deployment guidance is available and maintained
- Strong alignment with event-driven backend + rich React frontend + typed contracts

2. **create-next-app + custom assembly**
- Current official init: `npx create-next-app@latest`
- Excellent baseline, but requires assembling DB/auth/API/testing conventions manually
- Higher setup burden for a solo MVP with strict architectural constraints

3. **RedwoodJS starter**
- Current docs indicate active support (v8.8 docs)
- Supports TypeScript, Prisma/PostgreSQL, and Docker
- More opinionated framework model and weaker fit than T3 for incremental architecture control

### Selected Starter: Create T3 App

**Rationale for Selection:**
Create T3 App best matches the required architecture shape: full-stack TypeScript, React-based frontend, PostgreSQL support, and Docker-ready deployment path. It reduces setup risk while preserving modularity, and gives a strong baseline for typed boundaries across ingestion, scoring, and profile delivery layers.

**Initialization Command:**

```bash
pnpm dlx create-t3-app@latest xpull --CI --appRouter --prisma --nextAuth --dbProvider postgres --tailwind false
```

**Post-Initialization Commands (Testing + UI Framework):**

```bash
pnpm add @mui/material @emotion/react @emotion/styled @mui/material-nextjs @emotion/cache
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
pnpm create playwright
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript-first full-stack setup on Node.js
- Next.js App Router foundation for React UI + server route handling

**UI Framework (Chosen):**
- MUI as the primary design system/component framework
- Next.js App Router integration via MUI's App Router cache provider package
- Aligns with UX design-system decision and accessibility baseline requirements

**Styling Solution:**
- MUI theming and design tokens as primary styling strategy
- Avoid Tailwind as primary styling layer to preserve single source of UI conventions

**Build Tooling:**
- Next.js modern build pipeline
- Docker-compatible deployment model with documented standalone/container patterns

**Testing Framework:**
- **Unit tests:** Vitest (+ jsdom + Testing Library)
- **E2E tests:** Playwright
- Enables architecture-level quality gates for deterministic logic and critical UX flows

**Code Organization:**
- Modular full-stack structure suitable for:
  - UI routes/components
  - server procedures/handlers
  - database schema + migrations
  - test layers (unit + integration + e2e)

**Development Experience:**
- Fast local bootstrapping, typed end-to-end development ergonomics
- Strong ecosystem documentation and active maintenance
- Docker-supported environment parity for development and deployment

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database platform: PostgreSQL 18.x
- Data layer: Prisma 7.x + Prisma Migrate as schema/migration system of record
- API style: REST-first internal API
- Validation baseline: Zod 4.x at API boundaries + DB constraints
- UI foundation: MUI token-driven design system
- Local environment standard: Docker Compose required for local orchestration

**Important Decisions (Shape Architecture):**
- Auth: GitHub OAuth via next-auth/Auth.js
- Authorization: RBAC-lite (`user`, `admin`) with resource-level checks
- Session strategy: JWT-only stateless sessions
- Frontend state: Redux Toolkit from day one
- Error handling: typed error envelope + domain error codes + correlation IDs
- Scaling approach: split web/api/worker services immediately

**Deferred Decisions (Post-MVP):**
- Distributed cache (Redis) deferred until usage patterns justify it
- Formal OpenAPI-first documentation program deferred (lightweight internal docs now)
- Deployment target deferred ("none for now" for hosting provider selection)
- API hardening for stronger rate limiting and guard depth deferred by decision

### Data Architecture

- **Database:** PostgreSQL 18.x (latest stable major selected)
- **ORM & Migrations:** Prisma 7.x + Prisma Migrate
- **Validation:** Zod 4.x request/response boundary validation plus relational constraints in PostgreSQL
- **Caching:** no distributed cache in MVP
- **Rationale:** prioritize deterministic behavior, strict typing, and lower MVP operational overhead

### Authentication & Security

- **Authentication:** GitHub OAuth via next-auth/Auth.js
- **Authorization:** RBAC-lite (`user`, `admin`) with resource ownership checks
- **Sessions:** JWT-only stateless sessions
- **API security baseline:** minimal guards now, harden later
- **Rationale:** optimize for MVP delivery speed while preserving a clear path to stronger controls
- **Risk note:** this choice introduces explicit security hardening debt against stricter NFR expectations

### API & Communication Patterns

- **API pattern:** REST-first internal API
- **Documentation:** lightweight internal docs + typed contracts in code
- **Error model:** standardized typed envelope with domain error codes and correlation IDs
- **Rate limiting:** minimal now, harden later
- **Rationale:** explicit HTTP contracts with minimal initial process overhead
- **Risk note:** lightweight docs + deferred rate limiting require early governance in implementation patterns

### Frontend Architecture

- **State management:** Redux Toolkit from day one
- **Component architecture:** MUI token-driven system with feature-folder organization
- **Rendering strategy:** mostly client rendering
- **Performance strategy:** basic framework defaults for MVP
- **Rationale:** prioritize feature velocity and consistent UI-system implementation
- **Constraint note:** mostly client rendering conflicts with strong SEO/public profile crawlability goals and must be handled explicitly in implementation design

### Infrastructure & Deployment

- **Hosting strategy:** none selected for now (deployment provider deferred)
- **Local runtime:** Docker Compose as required local orchestration standard
- **CI/CD:** GitHub Actions on PR for build/test/lint only (no auto-deploy)
- **Environment management:** `.env` only for MVP
- **Monitoring/logging:** platform basic logs for MVP
- **Scaling:** split web/api/worker services immediately
- **Rationale:** keep hosting optional while enforcing strong local consistency and early service boundaries

### Decision Impact Analysis

**Implementation Sequence:**
1. Bootstrap project with selected starter and pin core versions
2. Establish Docker Compose local stack (app + postgres + supporting services as needed)
3. Implement data schema/migrations and validation boundaries
4. Implement auth/authz/session primitives
5. Define REST endpoint conventions + typed error envelope
6. Implement frontend architecture (Redux + MUI tokens + feature folders)
7. Add CI checks (build/test/lint on PR)
8. Introduce incremental hardening items (rate limiting, stronger guards, observability depth)

**Cross-Component Dependencies:**
- Prisma schema decisions drive REST contract shapes and frontend state modeling
- Auth/session choices directly affect API guard and error-envelope standards
- Rendering choice impacts profile SEO/social preview requirements
- Deferred hosting decision constrains production-specific optimizations until provider selection
- Immediate service split increases operational complexity but improves separation for ingestion workloads

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
12 areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case` plural (`users`, `git_events`, `xp_ledger`)
- Columns: `snake_case` (`created_at`, `user_id`)
- Foreign keys: `<entity>_id` (`user_id`, `repo_id`)
- Indexes: `idx_<table>_<column_list>` (`idx_users_email`, `idx_git_events_user_id_created_at`)
- Unique constraints: `uq_<table>_<column_list>`

**API Naming Conventions:**
- REST paths: plural resources (`/users`, `/profiles`, `/imports`)
- Nested resources: `/users/{userId}/badges`
- Path params: `{camelCase}` in route definitions (`{userId}`)
- Query params: `camelCase` (`pageSize`, `sortBy`)
- Headers: standard HTTP names; custom headers prefixed with `x-xpull-`

**Code Naming Conventions:**
- Components: `PascalCase` (`ProfileHeader.tsx`)
- Hooks: `useCamelCase` (`useProfileProgress.ts`)
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Redux slices: `<feature>Slice.ts`
- Redux actions: `feature/actionName` (`profile/setVisibility`)

### Structure Patterns

**Project Organization:**
- Organize by feature domain first (`features/profile`, `features/unboxing`, `features/progression`)
- Shared primitives under `shared/` (`shared/ui`, `shared/lib`, `shared/types`)
- API layer grouped by bounded domain (`server/api/profile`, `server/api/progression`)
- Data access isolated in `server/data/` and never imported directly by UI

**File Structure Patterns:**
- Unit tests co-located: `*.test.ts` / `*.test.tsx`
- E2E tests centralized in `tests/e2e/`
- Contracts/schemas co-located with domain modules (`schema.ts`, `dto.ts`)
- Environment validation in one place (`config/env.ts`)
- Docker local orchestration in `docker-compose.yml` at repo root

### Format Patterns

**API Response Formats:**
- Success envelope:
  - `{ "data": <payload>, "meta": { "requestId": "...", "timestamp": "..." } }`
- Error envelope:
  - `{ "error": { "code": "STRING_CODE", "message": "Human readable", "details": {} }, "meta": { "requestId": "...", "timestamp": "..." } }`
- All non-2xx responses must use the same error envelope

**Data Exchange Formats:**
- JSON fields: `camelCase` in API payloads
- Dates/times: ISO 8601 UTC strings only
- Booleans: strict `true/false`
- Nullability explicit; avoid omitted/implicit null semantics
- Single resource responses are objects, never single-item arrays

### Communication Patterns

**Event System Patterns:**
- Event names: `domain.entity.action.v1` (`progression.xp.awarded.v1`)
- Event payload base shape:
  - `eventId`, `eventName`, `occurredAt`, `actorId`, `correlationId`, `payload`
- Versioning in event name suffix (`.v1`, `.v2`)
- Consumers must be idempotent (dedupe by `eventId`)

**State Management Patterns:**
- Redux Toolkit is source of truth for shared client state
- Server state fetched via REST clients and normalized before store updates
- No direct mutation outside RTK reducers
- Selectors live in slice-local `selectors.ts`
- Async flows use thunks; each thunk defines pending/success/error states

### Process Patterns

**Error Handling Patterns:**
- Map domain errors to stable error codes
- Log internal diagnostics separately from user-facing error messages
- Correlation ID required in logs and API meta
- UI shows friendly messages; technical detail stays in logs only

**Loading State Patterns:**
- Naming: `isLoading`, `isSubmitting`, `isRefreshing`
- Global loading only for app bootstrap; feature loading local by default
- Skeletons for content surfaces, spinners for short actions
- Empty/loading/error states are explicit and component-tested

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming and response-envelope conventions exactly
- Add/update Zod schemas when adding or changing API contracts
- Include unit tests for new domain logic and E2E coverage for critical flows
- Preserve Redux slice boundaries and avoid cross-feature state leakage
- Keep Docker Compose local workflow runnable after changes

**Pattern Enforcement:**
- PR checklist validates naming, envelope, schema, and test conventions
- CI gates: lint + typecheck + unit tests on every PR
- Pattern violations are logged in architecture decision notes and corrected before merge
- Pattern updates require explicit architecture document update first

### Pattern Examples

**Good Examples:**
- `GET /users/{userId}/profile` returns `{ data, meta }` with ISO timestamp
- `progression/xpAwarded` thunk updates `progressionSlice` only through reducers
- `features/profile/components/ProfileCard.tsx` with `ProfileCard.test.tsx` co-located

**Anti-Patterns:**
- Mixing `snake_case` and `camelCase` within the same API payload
- Returning raw arrays or ad-hoc error objects without envelope/meta
- Writing feature state in arbitrary global store keys
- Adding backend endpoints without Zod contract validation
- Adding local runtime dependencies without updating `docker-compose.yml`

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
xpull/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── eslint.config.js
├── .gitignore
├── .env.example
├── .env.local
├── .dockerignore
├── docker-compose.yml
├── Dockerfile.web
├── Dockerfile.api
├── Dockerfile.worker
├── openapi/
│   ├── README.md
│   └── internal-api-guidelines.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── scripts/
│   ├── dev-up.sh
│   ├── dev-down.sh
│   ├── run-migrations.ts
│   └── seed-db.ts
├── docs/
│   ├── architecture/
│   │   └── decisions.md
│   ├── api/
│   │   └── error-codes.md
│   └── runbooks/
│       ├── local-development.md
│       └── incident-basics.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── quality-gates.yml
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   └── profile/
│   │   │       └── [username]/
│   │   │           └── page.tsx
│   │   ├── (authenticated)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── unboxing/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── [userId]/
│   │   │   │       └── route.ts
│   │   │   ├── profiles/
│   │   │   │   ├── route.ts
│   │   │   │   └── [username]/
│   │   │   │       └── route.ts
│   │   │   ├── progression/
│   │   │   │   ├── xp/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── levels/
│   │   │   │   │   └── route.ts
│   │   │   │   └── skill-tree/
│   │   │   │       └── route.ts
│   │   │   ├── imports/
│   │   │   │   ├── route.ts
│   │   │   │   └── [importId]/
│   │   │   │       └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── schema.ts
│   │   │   └── authSlice.ts
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── selectors.ts
│   │   │   ├── schema.ts
│   │   │   └── profileSlice.ts
│   │   ├── progression/
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── selectors.ts
│   │   │   ├── schema.ts
│   │   │   └── progressionSlice.ts
│   │   ├── unboxing/
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── schema.ts
│   │   │   └── unboxingSlice.ts
│   │   └── imports/
│   │       ├── components/
│   │       ├── api/
│   │       ├── schema.ts
│   │       └── importsSlice.ts
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── theme/
│   │   │   │   ├── tokens.ts
│   │   │   │   ├── theme.ts
│   │   │   │   └── mui-cache-provider.tsx
│   │   │   ├── components/
│   │   │   └── patterns/
│   │   ├── lib/
│   │   │   ├── http-client.ts
│   │   │   ├── api-response.ts
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   ├── correlation-id.ts
│   │   │   └── date.ts
│   │   ├── types/
│   │   └── constants/
│   ├── server/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── feature-flags.ts
│   │   ├── auth/
│   │   │   ├── auth-options.ts
│   │   │   ├── auth-guards.ts
│   │   │   └── rbac.ts
│   │   ├── api/
│   │   │   ├── middleware/
│   │   │   │   ├── with-correlation-id.ts
│   │   │   │   ├── with-error-envelope.ts
│   │   │   │   └── with-validation.ts
│   │   │   ├── users/
│   │   │   ├── profiles/
│   │   │   ├── progression/
│   │   │   └── imports/
│   │   ├── data/
│   │   │   ├── client.ts
│   │   │   ├── repositories/
│   │   │   └── transactions/
│   │   ├── domain/
│   │   │   ├── progression/
│   │   │   ├── badges/
│   │   │   ├── levels/
│   │   │   └── anti-gaming/
│   │   └── events/
│   │       ├── bus.ts
│   │       ├── contracts/
│   │       └── handlers/
│   ├── worker/
│   │   ├── main.ts
│   │   ├── jobs/
│   │   │   ├── import-history.job.ts
│   │   │   ├── webhook-sync.job.ts
│   │   │   └── recompute-progression.job.ts
│   │   ├── processors/
│   │   └── schedules/
│   └── middleware.ts
├── tests/
│   ├── e2e/
│   │   ├── onboarding.spec.ts
│   │   ├── profile.spec.ts
│   │   └── progression.spec.ts
│   ├── integration/
│   │   ├── api/
│   │   └── worker/
│   ├── fixtures/
│   └── utils/
└── public/
    ├── images/
    ├── icons/
    └── fonts/
```

### Architectural Boundaries

**API Boundaries:**
- External boundary: REST routes under `src/app/api/**`
- Request validation boundary: `src/server/api/middleware/with-validation.ts` using Zod
- Error envelope boundary: all routes pass through `with-error-envelope`
- Auth boundary: `src/server/auth/auth-guards.ts` and `src/app/api/auth/**`
- Data-access boundary: only `src/server/data/**` talks to Prisma client

**Component Boundaries:**
- UI components in `features/*/components` cannot import `server/*`
- Shared UI and tokens only from `shared/ui/**`
- Feature slices own their own selectors and actions
- Cross-feature access only through exported public module surfaces

**Service Boundaries:**
- `server/domain/**` holds business rules (XP, levels, badges, anti-gaming)
- `server/api/**` translates HTTP -> domain calls
- `worker/**` runs async ingestion/recompute and emits domain events
- `events/**` standardizes event contracts and dispatch

**Data Boundaries:**
- Prisma schema/migrations under `prisma/**` are source of truth
- Repository pattern in `server/data/repositories/**`
- No direct DB access from UI or route handlers
- Caching boundary deferred (no Redis in MVP)

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Git connection & import -> `app/api/imports/**`, `worker/jobs/import-history.job.ts`, `server/domain/*import*`
- Progression (XP/levels/leagues) -> `server/domain/progression/**`, `features/progression/**`, `app/api/progression/**`
- Skill tree experience -> `features/progression/components/**`, `app/(authenticated)/dashboard/**`
- Unboxing -> `features/unboxing/**`, `app/(authenticated)/unboxing/page.tsx`
- Profile & sharing -> `features/profile/**`, `app/(public)/profile/[username]/page.tsx`, `app/api/profiles/**`
- Platform operations -> `app/api/health/route.ts`, `worker/**`, `docs/runbooks/**`

**Cross-Cutting Concerns:**
- Authentication -> `server/auth/**`, `app/api/auth/**`, `middleware.ts`
- Authorization -> `server/auth/rbac.ts`, route-level guard wrappers
- Error handling -> `shared/lib/errors.ts`, `server/api/middleware/with-error-envelope.ts`
- Validation -> each feature `schema.ts` + server validation middleware
- Observability/logging -> `shared/lib/logger.ts` + correlation middleware

### Integration Points

**Internal Communication:**
- UI -> REST client (`shared/lib/http-client.ts`) -> API routes
- API routes -> domain services -> repositories
- Worker jobs -> domain services/events
- Redux slices consume normalized REST payloads and update feature state

**External Integrations:**
- GitHub OAuth + API/webhooks via `server/auth` and worker ingestion jobs
- Postgres via Prisma client
- Future hosting integration deferred until provider selection
- Docker Compose provides local service composition

**Data Flow:**
1. GitHub event/import arrives
2. Worker normalizes and persists domain events
3. Domain services compute XP/level/skill updates
4. API exposes profile/progression through REST envelopes
5. Frontend consumes and renders through Redux + MUI views

### File Organization Patterns

**Configuration Files:**
- Root-level runtime/build/tool config
- Env schema in `src/server/config/env.ts`
- CI workflows under `.github/workflows/`

**Source Organization:**
- `app/` for routes and app-shell concerns
- `features/` for domain UI/state slices
- `server/` for backend/domain/data
- `worker/` for async pipelines

**Test Organization:**
- Unit tests co-located as `*.test.ts(x)`
- Integration tests centralized under `tests/integration/`
- Playwright E2E in `tests/e2e/`

**Asset Organization:**
- Static public assets in `public/`
- UI design tokens/themes in `shared/ui/theme/`

### Development Workflow Integration

**Development Server Structure:**
- Local stack run by `docker-compose.yml`
- Web, API, worker, and Postgres orchestrated together locally
- Scripts in `scripts/` for up/down/migrate/seed workflows

**Build Process Structure:**
- Independent Dockerfiles for web/api/worker
- CI validates lint, typecheck, unit, integration, and e2e gating policy as configured

**Deployment Structure:**
- Hosting provider intentionally deferred
- Structure remains provider-agnostic while preserving split service deployability

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The chosen stack is technically coherent: Next.js App Router + TypeScript + Prisma/PostgreSQL + MUI + Redux Toolkit + Docker Compose + split web/api/worker architecture can work together without structural conflicts.
Version baselines selected are compatible for a modern Node LTS environment and align with selected libraries.

**Pattern Consistency:**
Implementation patterns are internally consistent:
- naming rules align with database/API/code conventions
- response/error envelope conventions align with REST-first API choice
- test placement and state conventions align with selected toolchain
- local orchestration expectation (Docker Compose) is consistently reflected

**Structure Alignment:**
The project tree supports all major decisions:
- clear separation of app/features/shared/server/worker
- explicit API, data, and auth boundaries
- test strategy locations defined
- local environment and CI artifacts included

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
Core feature areas are structurally mapped:
- Git import/sync
- progression engine (XP/levels/skill tree)
- Unboxing flow
- profile/public sharing surfaces
- operational health paths

**Functional Requirements Coverage:**
All FR categories have architectural support:
- ingestion/sync
- progression logic
- profile and UX surfaces
- privacy/account controls
- platform operations

**Non-Functional Requirements Coverage:**
Most NFRs are addressed architecturally (performance, reliability, accessibility patterns, deterministic processing, boundaries).
A few NFRs are currently satisfied as planned hardening work rather than full immediate controls.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical choices are documented, including starter, data stack, API style, auth approach, state strategy, structure, and implementation conventions.

**Structure Completeness:**
Project structure is sufficiently concrete for multi-agent implementation and handoff, including directory-level ownership and integration points.

**Pattern Completeness:**
High-value conflict points are covered with enforceable conventions and examples, reducing cross-agent divergence risk.

### Gap Analysis Results

**Critical Gaps:** None that block starting implementation.

**Important Gaps (should be tracked immediately):**
1. **SEO vs rendering strategy tension**
Current frontend decision favors mostly client rendering, while product/UX scope expects crawlable public profiles and rich OG sharing.
Resolution path: carve explicit SSR/SSG treatment for public profile routes while keeping authenticated surfaces client-heavy.

2. **Security hardening debt is explicit**
JWT-only sessions + minimal guards + minimal rate limiting now can conflict with stricter NFR intent if left unplanned.
Resolution path: add early hardening milestone (guard depth, rate limiting, session/rotation controls, abuse protections).

3. **Hosting provider deferred**
Provider-agnostic structure is fine for now, but some deployment/security/observability specifics remain postponed.
Resolution path: lock hosting before implementation reaches deployment-dependent concerns.

**Nice-to-Have Gaps:**
- formal OpenAPI publication plan (currently lightweight docs only)
- richer observability baseline beyond platform logs
- explicit ADR cadence for future decision changes

### Validation Issues Addressed

- Conflicting priorities were surfaced and retained as explicit tracked trade-offs, not hidden assumptions.
- Deferred choices (hosting, rate limiting depth, advanced observability) are documented as planned follow-up decisions.
- Local dev consistency risk is reduced by enforcing Docker Compose as a required pattern.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** Medium-high
(High on structure and consistency; reduced by explicit deferred hardening and hosting decisions.)

**Key Strengths:**
- strong multi-agent consistency rules
- clean separation of concerns across web/api/worker
- deterministic domain and validation emphasis
- practical local development standardization

**Areas for Future Enhancement:**
- formalize public-profile rendering strategy for SEO
- schedule security/rate-limit hardening early
- choose hosting target and map deployment-specific controls
- expand observability baseline beyond MVP logs

### Implementation Handoff

**AI Agent Guidelines:**
- Follow architectural decisions exactly as documented
- Apply consistency patterns across all modules
- Respect boundaries between app/features/server/worker/data
- Use this document as source of truth for architecture choices

**First Implementation Priority:**
Run project initialization from the selected starter command, then establish local Docker Compose stack and foundational schema/auth/error-envelope scaffolding.
