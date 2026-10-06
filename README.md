# SmartDesk

Plataforma SaaS multi-tenant de gestión para pequeñas empresas: clientes, proyectos, tareas, calendario, documentos, usuarios y roles.

> Estado: base arquitectónica, autenticación con Auth.js (registro de empresa, login y logout), dashboard de la aplicación y primer módulo (clientes: API, listado y ficha).

## Stack

- Next.js 16 (App Router, Route Handlers), React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL 17 + Prisma 7 (driver adapter `pg`)
- Auth.js v5 (`next-auth@5`, beta) con credenciales y sesiones JWT
- Zod para validación
- Tests con el runner nativo de Node (`node:test`) + `tsx`
- Docker Compose para la base de datos local

## Requisitos

- Node.js 24+ y npm
- Docker Desktop con el motor en marcha (en Windows necesita la característica *Virtual Machine Platform* / WSL 2)

## Puesta en marcha

```bash
npm install
cp .env.example .env      # cambia POSTGRES_PASSWORD (también en DATABASE_URL), AUTH_SECRET y SEED_USER_PASSWORD
npm run db:up             # PostgreSQL en localhost:5433
npm run db:deploy         # aplica las migraciones
npm run db:seed           # datos de ejemplo (dos organizaciones)
npm run dev               # http://localhost:3000 (login en /login, alta de empresa en /register)
```

¿Sin Docker? `npx prisma dev` levanta un PostgreSQL local embebido; usa la URL `postgres://…` que imprime como `DATABASE_URL`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` / `build` / `start` | Servidor de desarrollo, build y servidor de producción |
| `npm run lint` / `typecheck` / `test` | ESLint, tipos de rutas + `tsc --noEmit`, tests unitarios |
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
src/app/                páginas, Server Actions y Route Handlers ((app)/ = aplicación autenticada)
src/lib/                utilidades de presentación (formato de fechas, etiquetas)
src/config/env.ts       variables de entorno validadas
src/server/auth/        Auth.js, sesión, contraseñas y matriz de permisos
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

### Autenticación y autorización

Están separadas:

- **Autenticación** (quién eres): Auth.js v5 en `src/server/auth/auth.ts`, proveedor de credenciales (email + contraseña) y sesión JWT en cookie `httpOnly` (8 h). El token solo lleva el id del usuario. `src/server/auth/session.ts` es el único punto que resuelve el usuario actual y lo vuelve a leer de la base de datos en cada petición:
  - `requireSessionUser()` en API y Server Actions (sin sesión: `401`);
  - `requirePageUser()` en páginas (sin sesión: redirige a `/login`).
- **Autorización** (qué puedes hacer): `tenantAccessService.authorize()` consulta la membresía y el rol en la organización en cada operación. Los roles no van en el token, así que un cambio de rol se aplica al instante.
- Contraseñas con `scrypt` (módulo `crypto` de Node, sal aleatoria, comparación en tiempo constante). Con emails inexistentes también se calcula un hash, para no revelar por el tiempo de respuesta qué cuentas existen.
- `/register` crea una organización nueva con su primer usuario como ADMIN e inicia sesión. Tras el login siempre se va a `/dashboard` (sin redirecciones controladas por el usuario).
- Las páginas protegidas comprueban la sesión en el servidor (patrón *Data Access Layer* de Next 16); no se usa `proxy.ts`.

Variables: `AUTH_SECRET` (obligatoria, mínimo 32 caracteres; se genera con `npx auth secret`). En producción detrás de un dominio o proxy hace falta `AUTH_URL` o `AUTH_TRUST_HOST=true`.

Pendiente: limitar intentos de login (*rate limiting*), verificación de email, recuperación de contraseña e invitación de usuarios a una organización.

## Frontend de la aplicación

Las páginas autenticadas viven en el grupo de rutas `src/app/(app)/`, que comparte un layout con sidebar (en móvil, un menú lateral basado en `<dialog>`) y cabecera.

| Ruta | Contenido |
| --- | --- |
| `/dashboard` | Resumen: clientes (datos reales), proyectos, tareas y documentos (próximamente), clientes recientes, cartera por estado y actividad (pendiente) |
| `/clients` | Listado de clientes con búsqueda, paginación y acciones Ver / Editar / Eliminar |
| `/clients/new` | Alta de cliente (ADMIN y EMPLOYEE) |
| `/clients/{id}` | Ficha de un cliente, con Editar y (solo ADMIN) Eliminar |
| `/clients/{id}/edit` | Edición de cliente (ADMIN y EMPLOYEE) |
| `/projects` | Listado de proyectos con búsqueda (proyecto o cliente), filtros (estado, prioridad, cliente) y paginación |
| `/projects/new` | Alta de proyecto (ADMIN y EMPLOYEE) |
| `/projects/{id}` | Ficha del proyecto (Resumen; Tareas, Calendario, Documentos, Equipo y Actividad «Próximamente»), con Editar y (solo ADMIN) Eliminar |
| `/projects/{id}/edit` | Edición de proyecto (ADMIN y EMPLOYEE) |
| `/tasks`, `/calendar`, `/documents`, `/settings` | Página «Próximamente» |

- **Organización activa**: `getAppContext()` (`src/server/auth/organization-context.ts`) obtiene el usuario con Auth.js y elige una de **sus** organizaciones. La cookie `sd_active_org` solo guarda la preferencia (se cambia con el selector del sidebar cuando el usuario pertenece a varias); si apunta a una organización de la que no es miembro, se ignora. Además, cada consulta vuelve a pasar por `tenantAccessService.authorize()`.
- Las páginas llaman a servicios (`dashboardService`, `clientService`, `projectService`), nunca a repositorios. Un usuario con rol `CLIENT` ve el dashboard sin datos de clientes.
- Estados de UI: `loading.tsx` (esqueletos), `error.tsx` en `(app)` y en la raíz (por ejemplo, base de datos caída), `not-found` para clientes inexistentes o de otra organización, y estados vacíos.
- Componentes en `src/app/(app)/_components/`; formato de fechas y textos en `src/lib/format.ts` (`es-ES`, zona `Europe/Madrid`). Los colores son tokens CSS (`globals.css`) con modo oscuro.

### CRUD de clientes desde la interfaz

- Crear, editar y eliminar usan **Server Actions** (`src/app/(app)/clients/actions.ts`), que siguen el mismo camino que la API: validan con los esquemas Zod de `src/server/validation/client.schema.ts` y llaman a `clientService`, que autoriza con `tenantAccessService.authorize()`. Ni las páginas ni las acciones tocan repositorios o Prisma.
- La organización sale siempre de `getAppContext()` (servidor). Del formulario solo se leen los campos del cliente (`readClientForm`); un `organizationId` enviado por el navegador se descarta. El id del cliente que llega en la acción se trata como no fiable: se valida y el servicio lo busca dentro de la organización activa (otro tenant ⇒ «no encontrado»).
- Permisos: ADMIN crea, edita y elimina; EMPLOYEE crea y edita; CLIENT no ve ni modifica clientes. La interfaz oculta lo que no se puede hacer, pero el servidor lo rechaza igualmente (probado llamando a las acciones directamente).
- Formularios: validación en el servidor con mensajes en español, se conservan los valores tras un error, el foco va al primer campo inválido, botón desactivado mientras se guarda (sin dobles envíos). Los errores inesperados muestran un mensaje genérico y el detalle solo queda en el log del servidor.
- Eliminar pide confirmación en un `<dialog>` (el foco empieza en «Cancelar») e indica que no se puede deshacer.
- Tras crear, editar o eliminar se redirige con `?notice=created|updated|deleted`, que muestra un aviso de éxito y se quita de la URL. Las redirecciones del listado se construyen en el servidor a partir de búsqueda y página validadas (sin redirecciones abiertas).

### Proyectos

- Modelo `Project` (`prisma/schema.prisma`): pertenece a una organización, a un cliente y a su creador (`createdBy`, que se muestra como responsable). Estado (`ProjectStatus`) y prioridad (`ProjectPriority`) son enums; fechas de inicio y fin como `DATE`; presupuesto e horas como `DECIMAL`. Está preparado para colgar de él tareas, eventos, documentos, equipo y actividad en fases posteriores.
- **Aislamiento entre organizaciones en tres capas**: el servicio comprueba con el repositorio de clientes que el `clientId` recibido pertenece a la organización activa; todas las consultas del repositorio filtran por `organizationId`; y la base de datos usa una clave foránea compuesta `(client_id, organization_id)` → `clients(id, organization_id)`, de modo que PostgreSQL rechaza un proyecto apuntando a un cliente de otra organización aunque fallara el código.
- Un cliente con proyectos no se puede eliminar (la base de datos lo impide y la interfaz lo explica); hay que eliminar o reasignar antes sus proyectos. Borrar una organización entera sí elimina sus proyectos.
- Permisos `project:read`, `project:write` (ADMIN, EMPLOYEE) y `project:delete` (solo ADMIN) en `src/server/auth/permissions.ts`; CLIENT no tiene acceso al CRUD.
- Mismo patrón que Clientes: Server Actions en `src/app/(app)/projects/actions.ts`, Route Handlers en `/api/organizations/{organizationId}/projects`, servicio `projectService` y repositorio `projectRepository` (único que usa Prisma).
- El **progreso** se muestra como 0 % porque todavía no existen tareas: no se inventa. Se calculará a partir de las tareas cuando exista ese módulo.
- Importes y horas aceptan coma o punto decimal (máximo dos decimales, sin separador de miles).

**Actividad reciente (pendiente).** No existe todavía un modelo de actividad, así que el panel solo muestra un estado vacío. Para hacerlo real falta: una tabla `ActivityEvent` (organización, autor, acción, entidad, metadatos, fecha) escrita por los servicios al crear o cambiar datos, y un método de repositorio/servicio que liste los últimos eventos de una organización.

## API

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/health` | público |
| GET/POST | `/api/auth/*` | Auth.js (login, logout, sesión, CSRF) |
| GET | `/api/organizations` | autenticado |
| GET | `/api/organizations/{organizationId}/clients?search=&status=&page=&pageSize=` | `client:read` |
| POST | `/api/organizations/{organizationId}/clients` | `client:write` |
| GET | `/api/organizations/{organizationId}/clients/{clientId}` | `client:read` |
| PATCH | `/api/organizations/{organizationId}/clients/{clientId}` | `client:write` |
| DELETE | `/api/organizations/{organizationId}/clients/{clientId}` | `client:delete` (solo ADMIN); `409` si tiene proyectos |
| GET | `/api/organizations/{organizationId}/projects?search=&status=&priority=&clientId=&page=&pageSize=` | `project:read` |
| POST | `/api/organizations/{organizationId}/projects` | `project:write` |
| GET | `/api/organizations/{organizationId}/projects/{projectId}` | `project:read` |
| PATCH | `/api/organizations/{organizationId}/projects/{projectId}` | `project:write` |
| DELETE | `/api/organizations/{organizationId}/projects/{projectId}` | `project:delete` (solo ADMIN) |

Errores: `{ "error": { "code", "message", "details?" } }` con `400`, `401`, `403`, `404`, `409` o `500` (sin detalles internos).

Los endpoints usan la cookie de sesión de Auth.js: inicia sesión en `/login` y llama a la API desde el mismo navegador. Las rutas `/api/auth/*` las gestiona Auth.js.

Usuarios del seed (contraseña: el valor de `SEED_USER_PASSWORD` de tu `.env`): `admin@acme.test` (ADMIN), `employee@acme.test` (EMPLOYEE) y `client@acme.test` (CLIENT) en Acme; `admin@globex.test` (ADMIN) en Globex. Ids de organización: Acme `018f0000-0000-7000-8000-000000000001`, Globex `…0002`.

## Seguridad

- Los secretos viven en `.env` (ignorado por Git); `.env.example` solo contiene valores de ejemplo.
- PostgreSQL de desarrollo solo escucha en `127.0.0.1`.
- Entrada validada con esquemas estrictos: los campos desconocidos (p. ej. `organizationId` en el cuerpo) se rechazan.
- Sesión en cookie `httpOnly` firmada y cifrada; Auth.js protege login y logout contra CSRF.
- Los logs de login nunca incluyen contraseñas ni emails.
