# CI Pipeline Implementation Notes

## Architecture coverage
- The dedicated `.github/workflows/ci.yml` run enforces the layered layout (`src/app/api/**`, `src/server/**`, `src/worker/**`, `shared/**`) by exercising `pnpm typecheck`, `pnpm test`, and `pnpm build` in order, ensuring each surface area compiles and the shared tiles stay consistent with `_bmad-output/planning-artifacts/architecture.md`.
- Playwright end-to-end verification (`pnpm test:e2e`) keeps the UI/API boundary healthy by spinning up `pnpm dev` (matching `playwright.config.ts`) before Chromium hits the app, so PRs can only merge after the app server, API routes, and worker hooks survive real browser traffic.

## Logging and observability alignment
- CI log output naturally references the shared utilities under `shared/lib/errors.ts` and `shared/lib/correlation-id.ts`, because failing `pnpm test` or `pnpm test:e2e` exercises the same helpers as the running services; mention these files in reports so downstream automation can attribute errors with the documented correlation envelope.
- By reusing the error/correlation helpers from the repository, the pipeline ensures logs stay traceable to the domains described in the architecture decision document.

## Environment parity
- Environment variables mirror `docker-compose.yml` and `.env.example`, guaranteeing local developers and CI share the same secrets/datasources:
  - `DATABASE_URL=postgresql://xpull:xpull_dev@localhost:5432/xpull_dev`
  - `AUTH_SECRET=xpull_ci_secret_placeholder`
  - `NEXTAUTH_URL=http://localhost:3000`
  - `AUTH_GITHUB_ID=ci-placeholder`
  - `AUTH_GITHUB_SECRET=ci-placeholder`
- GitHub Actions spins up `postgres:18` with the same user/password/database trio, so tests can rely on the same schema that `docker-compose.yml` provisions.

## Verification checklist
- `pnpm typecheck` (mirrors `tsc --noEmit` to keep Next.js/App Router + Prisma safe)
- `pnpm test` (Vitest + jsdom, matching the `tests/utils/setup.ts` environment and the `vitest.config.mts` aliasing)
- `pnpm build` (guarantees `next build` still succeeds with the MUI + Redux providers established in Story 1.1)
- `pnpm test:e2e` (runs Playwright Chromium via `playwright.config.ts` with the retry/trace defaults and `pnpm dev` web server)
- Use this document to orient future `code-review` or `dev-story` runs so reviewers can quickly see what the pipeline enforces.

## References
- `_bmad-output/planning-artifacts/architecture.md`
- `package.json`, `vitest.config.mts`, `playwright.config.ts`
- Issue #10 (Story 1.1) for the initial scaffold, Docker Compose, and shared utilities.
