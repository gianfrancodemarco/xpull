# Local GitHub connection for testing

This project uses GitHub OAuth via `next-auth` for authentication and signing in. The following steps unlock a local testing flow that mirrors CI/production.

## 1. Create an OAuth app on GitHub

1. Visit https://github.com/settings/developers and select **New OAuth App**.
2. Fill in:
   - **Application name:** `xpull (local)`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Save the app and copy the **Client ID** + **Client Secret**.

## 2. Store the secrets as environment variables

Create (or update) a `.env.local` at the project root with:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xpull?schema=public
AUTH_SECRET=a-long-random-string
AUTH_GITHUB_ID=<your-client-id>
AUTH_GITHUB_SECRET=<your-client-secret>
```

- `DATABASE_URL` should point at your local PostgreSQL. Use Docker Compose or your own Postgres instance.
- `AUTH_SECRET` can be generated with `openssl rand -hex 32` or `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`.

## 3. Register a test GitHub user (optional)

- Connect your personal GitHub account or create a dedicated testing account to avoid hitting rate limits or exposing sensitive repositories.
- Use GitHub settings to revoke the app or rotate the secret if the credentials are shared.

## 4. Run the app locally

1. Install dependencies: `pnpm install`.
2. Start Postgres via `docker-compose up -d postgres` (see `docker-compose.yml`).
3. Run migrations: `pnpm db:generate` / `pnpm db:migrate`.
4. Launch the dev server: `pnpm dev`.
5. Visit `http://localhost:3000` and click **Connect GitHub**; the OAuth prompt will redirect back to `next-auth`.

## 5. Testing with Playwright

- Before running `pnpm test:e2e`, download the browsers with `pnpm exec playwright install`.
- Make sure `pnpm dev` is not already binding to port 3000 (Playwright will start its own web server).
- You can optionally set `PWDEBUG=1` for a headed browser session during development.

## Keeping secrets secure

- Never commit `.env.local`. Add new secrets to `.gitignore` if needed.
- Rotate the OAuth secret if anyone outside your team gains access.

Follow these steps and your local GitHub connection will match CI expectations so tests and manual flows behave identically to production.
