# SmartDesk

Plataforma SaaS multi-tenant de gestión para pequeñas empresas: clientes, proyectos, tareas, calendario, documentos, usuarios y roles.

> Estado: base arquitectónica y primer módulo (clientes, solo API). La autenticación real con Auth.js todavía no está integrada.

## Stack

- Next.js 16 (App Router, Route Handlers), React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL 17 + Prisma 7 (driver adapter `pg`)
- Zod para validación
- Tests con el runner nativo de Node (`node:test`) + `tsx`
- Docker Compose para la base de datos local

## Requisitos

- Node.js 24+ y npm
- Docker Desktop con el motor en marcha (en Windows necesita la característica *Virtual Machine Platform* / WSL 2)

## Puesta en marcha

```bash
npm install
cp .env.example .env      # y cambia POSTGRES_PASSWORD (también dentro de DATABASE_URL)
npm run db:up             # PostgreSQL en localhost:5433
npm run db:deploy         # aplica las migraciones
npm run db:seed           # datos de ejemplo (dos organizaciones)
npm run dev               # http://localhost:3000
```

¿Sin Docker? `npx prisma dev` levanta un PostgreSQL local embebido; usa la URL `postgres://…` que imprime como `DATABASE_URL`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` / `build` / `start` | Servidor de desarrollo, build y servidor de producción |
| `npm run lint` / `typecheck` / `test` | ESLint, `tsc --noEmit`, tests unitarios |
| `npm run db:up` / `db:down` | Arranca / para PostgreSQL (Docker Compose) |
| `npm run db:migrate` | Crea y aplica una migración en desarrollo |
| `npm run db:deploy` | Aplica las migraciones existentes |
| `npm run db:seed` | Carga los datos de ejemplo |
| `npm run db:studio` | Prisma Studio |

## Arquitectura

```
Route Handler  →  Service  →  Repository  →  Prisma  →  PostgreSQL
src/app/api       src/server/services   src/server/repositories
```

- **Route Handlers**: autentican, validan la entrada (Zod), llaman a un servicio y dan forma a la respuesta. Sin lógica de negocio.
- **Services**: lógica de negocio y autorización. Reciben sus dependencias por inyección (`createXService`), lo que permite testearlos sin base de datos.
- **Repositories**: única capa que usa Prisma. Devuelven tipos de dominio (`src/server/domain`), no tipos de Prisma.
- ESLint (`no-restricted-imports`) impide importar Prisma fuera de los repositorios y repositorios desde `src/app`.

```
prisma/                 esquema, migraciones y seed
src/app/                páginas y Route Handlers
src/config/env.ts       variables de entorno validadas
src/server/auth/        sesión (autenticación) y matriz de permisos
src/server/domain/      tipos de dominio
src/server/errors/      errores de aplicación
src/server/http/        wrapper de rutas, parsing y respuestas de error
src/server/repositories/
src/server/services/
src/server/validation/  esquemas Zod
```

### Multi-tenancy y permisos

- Todo dato de negocio pertenece a una `Organization`. Un `User` accede a ella mediante una `Membership` con rol `ADMIN`, `EMPLOYEE` o `CLIENT`.
- La organización va en la URL (`/api/organizations/{organizationId}/…`) y **siempre** se comprueba en backend: `tenantAccessService.authorize(user, organizationId, permiso)`.
- Quien no es miembro recibe `404` (no se revela que la organización existe); quien es miembro sin permiso recibe `403`.
- Los repositorios filtran todas las consultas por `organizationId`.
- La matriz de permisos está en `src/server/auth/permissions.ts`.

### Autenticación (provisional)

`src/server/auth/session.ts` es el único punto que resuelve quién llama. Hasta integrar Auth.js funciona con un bypass de desarrollo: con `AUTH_DEV_BYPASS=true` el usuario se indica en la cabecera `x-dev-user-id`. El bypass se ignora con `NODE_ENV=production`, así que en producción todas las peticiones protegidas devuelven `401`.

## API

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/health` | público |
| GET | `/api/organizations` | autenticado |
| GET | `/api/organizations/{organizationId}/clients?search=&status=&page=&pageSize=` | `client:read` |
| POST | `/api/organizations/{organizationId}/clients` | `client:write` |
| GET | `/api/organizations/{organizationId}/clients/{clientId}` | `client:read` |
| PATCH | `/api/organizations/{organizationId}/clients/{clientId}` | `client:write` |
| DELETE | `/api/organizations/{organizationId}/clients/{clientId}` | `client:delete` (solo ADMIN) |

Errores: `{ "error": { "code", "message", "details?" } }` con `400`, `401`, `403`, `404`, `409` o `500` (sin detalles internos).

Ejemplo con los datos del seed (admin de Acme):

```bash
curl -H "x-dev-user-id: 018f0000-0000-7000-8000-000000000011" http://localhost:3000/api/organizations/018f0000-0000-7000-8000-000000000001/clients
```

Usuarios del seed: Acme `…0011` (ADMIN), `…0012` (EMPLOYEE), `…0013` (CLIENT); Globex `…0021` (ADMIN). Organizaciones: Acme `…0001`, Globex `…0002`.

## Seguridad

- Los secretos viven en `.env` (ignorado por Git); `.env.example` solo contiene valores de ejemplo.
- PostgreSQL de desarrollo solo escucha en `127.0.0.1`.
- Entrada validada con esquemas estrictos: los campos desconocidos (p. ej. `organizationId` en el cuerpo) se rechazan.
