@AGENTS.md

# SmartDesk

Multi-tenant SaaS for small businesses. Full-stack Next.js (App Router), Prisma 7, PostgreSQL. See README.md for setup, scripts and API.

## Rules

- Use **npm**. pnpm is blocked on the dev machine (Windows Device Guard). Unsigned native binaries can be blocked too: Vitest 5 (rolldown) does not start there, which is why tests use `node:test` + `tsx`.
- Layering is strict: Route Handler → Service → Repository → Prisma. Only `src/server/repositories` and `src/server/db` may import Prisma; `src/app` may not import repositories. ESLint enforces both.
- Repositories return domain types from `src/server/domain`, never Prisma types.
- Every tenant-scoped service method starts with `tenantAccess.authorize(user, organizationId, permission)`, and every repository query filters by `organizationId`. Non-members get 404, members without permission get 403.
- New permissions go in `src/server/auth/permissions.ts`.
- Validate all input with Zod (`strictObject` for bodies) in `src/server/validation`. Throw `AppError` subclasses; `route()` in `src/server/http/route.ts` turns them into responses.
- Authentication: Auth.js v5 (credentials + JWT) configured in `src/server/auth/auth.ts`. Resolve the current user only through `src/server/auth/session.ts` (`requireSessionUser` in API/actions, `requirePageUser` in pages). Never put roles in the token; authorization is always `tenantAccess.authorize()` against the DB.
- Server Actions are entry points like Route Handlers: validate with Zod, call services, never repositories.
- App pages live in `src/app/(app)/` and get user + active organization from `getAppContext()`. The `sd_active_org` cookie is only a hint validated against memberships; never trust a client-sent organization id without `tenantAccess.authorize()`.
- Do not pass functions (e.g. icon components) as props from Server to Client Components; let the client component import them.
- Modules not built yet show `ComingSoon`; never fake persisted data in the UI.
- Form Server Actions: read only known fields from FormData (see `readClientForm`), treat bound ids as untrusted, take the tenant from `getAppContext()`, and map errors to friendly messages (call `unstable_rethrow` first so redirects still work). Never return raw error messages to the client.
- Passwords: `src/server/auth/password.ts` (scrypt). Never log passwords or emails.
- Read env through `getEnv()` (lazy), never `process.env` directly in app code.
- Never commit `.env`. Do not create Azure infrastructure unless asked.
- Before committing: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Database

- Local PostgreSQL via `npm run db:up` (host port 5433). Without Docker: `npx prisma dev`.
- Schema changes: edit `prisma/schema.prisma`, then `npm run db:migrate -- --name <change>`.
- The Prisma client is generated into `src/generated/prisma` (git-ignored; `postinstall` regenerates it).

## Git

Branches: `main`, `develop`, `feature/*`. Clear, professional commit messages.
