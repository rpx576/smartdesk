@AGENTS.md

# Advanthor web

Marketing website of Advanthor (web creation, web maintenance, SEO, cybersecurity). Next.js App Router, no database. See README.md.

## Rules

- Use **npm**. pnpm is blocked on the dev machine (Windows Device Guard); tests use `node:test` + `tsx`.
- Content lives in `src/content/` (services, plans, home, company, site). Pages render it; do not hard-code service texts in components.
- Never invent data: legal owner data stays `null` in `src/content/company.ts` (shown as `[PENDIENTE: …]`), prices stay `null` in `src/content/plans.ts`, `CASE_STUDIES` only holds real, publishable projects. No certifications, guarantees or results that are not real.
- Every page sets its metadata with `pageMetadata()` from `src/lib/seo.ts` (unique title/description, canonical). Private pages pass `noindex: true` and are listed in `NOINDEX_PATHS`; indexable ones in `INDEXABLE_PATHS` (the sitemap).
- Service pages use `ServicePage` (`src/components/service-page.tsx`) so the four stay consistent.
- Forms post to Route Handlers that validate with Zod `strictObject` (`src/server/contact/schema.ts`), throw `AppError` subclasses and answer through `errorResponse()`. Never show a fake success: if email is not configured, say so.
- Client code (`src/components`, `*-form.tsx`) must not import `@/server/*` (ESLint enforces it). Shared constants go in `src/content/`.
- Server settings through `getSiteConfig()` / `getContactConfig()` in `src/config/env.ts` (lazy); browser settings through `publicConfig` (literal `process.env.NEXT_PUBLIC_*`).
- Optional third-party scripts (analytics) load only after consent (`src/components/cookies/consent.tsx`). Any new third party: add it to the CSP in `next.config.ts`, to `PROCESSORS` in `company.ts` and to the cookie policy.
- Never log personal data (names, emails, messages). Never commit `.env*`.
- Before committing: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Git

Branches: `main`, `develop`, `feature/*`. The retired SmartDesk SaaS lives in `archivo/smartdesk-saas` / tag `smartdesk-final`.
