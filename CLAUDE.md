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
- Authentication lives only in `src/server/auth/session.ts` (dev bypass via `x-dev-user-id` until Auth.js is added; disabled in production).
- Read env through `getEnv()` (lazy), never `process.env` directly in app code.
- Never commit `.env`. Do not create Azure infrastructure unless asked.
- Before committing: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Database

- Local PostgreSQL via `npm run db:up` (host port 5433). Without Docker: `npx prisma dev`.
- Schema changes: edit `prisma/schema.prisma`, then `npm run db:migrate -- --name <change>`.
- The Prisma client is generated into `src/generated/prisma` (git-ignored; `postinstall` regenerates it).

## Git

Branches: `main`, `develop`, `feature/*`. Clear, professional commit messages.
