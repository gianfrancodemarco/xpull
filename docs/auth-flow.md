# Authentication Flow

## Overview
The app leans on NextAuth + GitHub OAuth to grant and persist access to a user’s GitHub history. Users hit the `/sign-in` page, trigger `next-auth/react` helpers, and the OAuth handshake is handled by the `/api/auth/[...nextauth]/route.ts` handler backed by the Prisma adapter. Sessions live in the database, cookies keep the browser authenticated, and server-rendered routes read the same session data to personalize the dashboard.

## Flow diagrams

### Sequence diagram
```mermaid
sequenceDiagram
  participant Browser
  participant SignInPage
  participant NextAuthClient
  participant NextAuthRoute
  participant GitHub
  participant Database

  Browser->>SignInPage: GET /sign-in
  SignInPage->>Browser: render GitHub button
  Browser->>NextAuthClient: `signIn("github", callbackUrl="/dashboard")`
  NextAuthClient->>NextAuthRoute: POST /api/auth/signin
  NextAuthRoute->>GitHub: send OAuth request with client ID
  GitHub->>Browser: redirect to callback with code
  Browser->>NextAuthRoute: GET /api/auth/callback/github?code=…
  NextAuthRoute->>Database: PrismaAdapter persists User, Account, Session
  NextAuthRoute->>Browser: set session cookie & redirect /dashboard
  Browser->>DashboardPage: GET /dashboard
  DashboardPage->>NextAuthRoute: `getServerSession(authConfig)`
  NextAuthRoute->>Database: validate session, join user
  DashboardPage->>Browser: render welcome with session data
```

### Component diagram
```mermaid
graph LR
  A["SignIn Page (client)"] --> B["NextAuth React helpers (signIn)"]
  B --> C["/api/auth/[...nextauth]/route.ts"]
  C --> D["GitHub OAuth provider"]
  C --> E["PrismaAdapter → db → Postgres"]
  F["Dashboard getServerSession"] --> C
  E --> G["Account / Session / User rows"]
```

## Step-by-step narrative

### 1. Sign-in UI triggers NextAuth
`src/app/sign-in/page.tsx` renders a single button that calls `signIn("github", { callbackUrl: "/dashboard" })`. This hands the browser over to NextAuth’s client helpers and immediately sets the post-auth redirect destination.

```28:35:src/app/sign-in/page.tsx
  const handleSignIn = useCallback(() => {
    if (loading) return;
    setLoading(true);
    void signIn("github", { callbackUrl: "/dashboard" });
  }, [loading]);
```

### 2. NextAuth handles OAuth and persists records
The `/api/auth/[...nextauth]` route re-exports the `handlers` from `NextAuth(authConfig)`. The configuration wires up the GitHub provider via `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`, stores tokens in Postgres through `PrismaAdapter(db)`, and returns the typed session with `user.id`.

```1:4:src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;
```

```15:27:src/server/auth/config.ts
export const authConfig = {
  providers: [GitHubProvider],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
```

The Prisma client lives in `~/server/db.ts`, where a singleton is exported so the adapter can reuse it across requests.

```1:16:src/server/db.ts
import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

Environment secrets that drive the OAuth handshake and session encryption live in `.env`.

```3:13:.env
DATABASE_URL="postgresql://xpull:xpull_dev@localhost:5432/xpull_dev"
AUTH_SECRET="PkTd7WqCPbfWI1rxXOwdswCpauX7l/WqSIUp32D0Khk="
NEXTAUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID="Ov23liNTjZmXgLkAnsdS"
AUTH_GITHUB_SECRET="26404dc16f1b20214fe6dfb1d84c56249338ba30"
```

### 3. Sessions persist to Postgres and rescue on the dashboard
The Prisma schema defines the `Account`, `Session`, and `User` tables that mirror NextAuth’s expectations. When the callback returns GitHub tokens and profile info, `PrismaAdapter` upserts those rows and creates a session entry whose token is tied to the browser cookie.

```31:67:prisma/schema.prisma
// Necessary for Next auth
model Account {
    id                       String  @id @default(cuid())
    userId                   String
    type                     String
    provider                 String
    providerAccountId        String
    refresh_token            String?
    access_token             String?
    expires_at               Int?
    token_type               String?
    scope                    String?
    id_token                 String?
    session_state            String?
    user                     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
    refresh_token_expires_in Int?

    @@unique([provider, providerAccountId])
}

model Session {
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
    posts         Post[]
}
```

Later, the dashboard calls `getServerSession(authConfig)` so it can read the active session (name/email/avatar) that was persisted via the Prisma adapter before rendering the feed.

```1:15:src/app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";

import { authConfig } from "~/server/auth/config";
import DashboardView from "./dashboard-view";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  const userName = session?.user?.name ?? "xpull Citizen";

  return <DashboardView userName={userName} />;
}
```

### 4. Signing out
While the UI currently never renders it, the exported `signOut` helper and the same `/api/auth/[...nextauth]` handlers support logging the user out: NextAuth removes the session entry, clears the cookie, and revokes the OAuth session when the browser hits `signOut()`.

## Configuration notes
- **Session enrichment**: `authConfig.callbacks.session` ensures the frontend sees `user.id` alongside the default name/email to keep typed data flowing into `DashboardView`.
- **Env vars**: `AUTH_SECRET` encrypts cookies, `NEXTAUTH_URL` and `AUTH_GITHUB_*` keys drive provider registration, and `DATABASE_URL` points Prisma to the Postgres instance.
- **Prisma schema**: `Account`, `Session`, and `User` models are the canonical NextAuth tables; keep them in sync with the adapter.

## References
- `Sign-in button → signIn handler` (`src/app/sign-in/page.tsx`)
- `NextAuth handler + config` (`src/app/api/auth/[...nextauth]/route.ts` & `src/server/auth/config.ts`)
- `Dashboard session lookup` (`src/app/dashboard/page.tsx`)
- `Database + Prisma client` (`src/server/db.ts`, `prisma/schema.prisma`)
