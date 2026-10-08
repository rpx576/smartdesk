# SmartDesk / SmartHub: historial del proyecto

Documento de memoria con todo lo hecho desde el inicio del proyecto hasta la sesión actual. Está escrito para que cualquiera (o una sesión futura de Claude) pueda retomar el trabajo sin repasar la conversación.

- **Carpeta local:** `C:\Users\raulx\Documents\Proyectos\Smartdesk`
- **Repositorio:** https://github.com/rpx576/smartdesk
- **Ramas:** `main`, `develop` y `feature/*`
- **Quién hace qué:** Claude escribe y prueba el código. El usuario hace `git add`, `commit`, `push` y las PR en GitHub.

---

## 1. Qué es SmartDesk

SaaS multi-tenant para pequeñas empresas. Cada organización tiene sus clientes, proyectos, tareas y calendario, con tres roles: **ADMIN**, **EMPLOYEE** y **CLIENT**.

### Stack

| Pieza | Versión / detalle |
| --- | --- |
| Framework | Next.js 16.3.8 (App Router, Turbopack) y React 19.2.8 |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind 4 con tokens CSS (`canvas`, `surface`, `line`, `ink`, `accent`, `danger`…) |
| Validación | Zod 4.6.5 |
| Base de datos | PostgreSQL 17 en Docker (`127.0.0.1:5433`) con Prisma 7.10 y `@prisma/adapter-pg` |
| Autenticación | Auth.js v5 (next-auth 5.0.0-beta.32): credenciales y sesión JWT; los roles nunca van en el token |
| Tests | `node --import tsx --test "src/**/*.test.ts"` (Vitest no se usa) |
| Gestor de paquetes | **npm** (pnpm no se puede usar) |

### Limitaciones de la máquina de desarrollo

- **Device Guard** bloquea pnpm, Vitest/rolldown y algunos binarios sin firmar.
- **Docker** necesitó activar WSL2 y la plataforma de máquina virtual.
- Hay un **PostgreSQL nativo en el puerto 5432**, por eso el de Docker usa el 5433.

### Arquitectura (regla estricta)

`Route Handler / Server Action → Servicio → Repositorio → Prisma`

- Solo `src/server/repositories` y `src/server/db` pueden importar Prisma; ESLint lo hace cumplir.
- Cada método de servicio empieza con `tenantAccess.authorize(user, organizationId, permiso)`. Un no miembro recibe **404** y un miembro sin permiso, **403**.
- Cada consulta de repositorio filtra por `organizationId`.
- La organización sale siempre del servidor (`getAppContext()`); la cookie `sd_active_org` es solo una pista.
- Los permisos viven en `src/server/auth/permissions.ts`.
- La validación usa Zod con objetos estrictos, en `src/server/validation`.
- Todo id que enlaza tablas lleva además una **clave foránea compuesta** `(x_id, organization_id)` como respaldo en la base de datos.

---

## 2. Cronología de fases

1. **Fase 2: estructura base.** Next.js + TypeScript + Tailwind, Docker con PostgreSQL, Prisma, tests y scripts. Se usó npm. Primer commit en `main` y creación de `develop`; los push los hizo el usuario a mano.
2. **Fase 3: autenticación.** Rama `feature/auth` con Auth.js, registro, login, logout y roles. `.claude/` se añadió a `.gitignore` y se confirmó que `.env` no se versiona.
3. **Dashboard** (`feature/dashboard`). Sidebar, cabecera, tarjetas, clientes recientes, estados de interfaz y navegación con «Próximamente».
4. **CRUD de clientes** (`feature/clients-crud`). Permisos por rol, Server Actions, formularios accesibles y borrado con confirmación.
5. **Corrección de un fallo.** Tras fusionar la PR 3, el ADMIN no veía los botones del CRUD de clientes. Se investigó la causa real, se mantuvo la autorización en servidor y se añadieron tests.
6. **Proyectos.** Modelo, permisos, filtros, progreso calculado desde las tareas y clave compuesta hacia clientes.
7. **Tareas** (`feature/tasks`, PR 6). Estados, prioridades, responsable (con clave compuesta a la membresía) y `completedAt` derivado en el servicio.
8. **Calendario V1** (`feature/calendar`). Ver la sección 3.
9. **Rediseño visual y web SmartHub.** Ver las secciones 4 y 5.

---

## 3. Calendario V1 (rama `feature/calendar`)

Estado: **terminado y probado, sin commit**.

### Qué incluye

- **Vistas:** mes (con «+N más»), semana (rejilla horaria con eventos solapados en paralelo; en móvil, lista por días), día y agenda paginada. Navegación Anterior / Hoy / Siguiente.
- **Eventos:** alta, ficha, edición y borrado con tipo, ubicación, todo el día, responsable y enlaces en cascada Cliente → Proyecto → Tarea.
- **Tareas:** se leen de `Task` (nunca se copian). Con inicio y fecha límite se ven como intervalo; con solo fecha límite, como vencimiento; las completadas salen tachadas y las canceladas se ocultan.
- **Filtros en servidor:** Mostrar (todos / eventos / tareas), Mis elementos, Proyecto, Usuario, Tipo de evento y Estado de tarea, más búsqueda.
- **Solapamientos:** aviso («Este evento coincide con otro evento existente.»), nunca bloqueo.
- **API:** `/api/organizations/{org}/calendar-events` (GET y POST) y `/{eventId}` (GET, PATCH y DELETE).
- **Integraciones:** sección «Calendario» en la ficha del proyecto y panel «Tu agenda» en el dashboard.
- **Zona horaria:** todo en Europe/Madrid con los helpers de `src/lib/dates.ts`. Un evento de todo el día va de la medianoche local a la siguiente (días de 23 y 25 horas incluidos).

### Permisos

| Permiso | Roles |
| --- | --- |
| `calendar:read`, `calendar:write`, `calendar:assignable` | ADMIN, EMPLOYEE |
| `calendar:manage` (editar o borrar cualquier evento) | ADMIN |

- EMPLOYEE solo edita o borra eventos que creó o que tiene asignados (`canModifyEvent`).
- CLIENT no tiene acceso en V1.

### Base de datos

Migración `20261008090000_add_calendar_events`:
- modelo `CalendarEvent` y enum `CalendarEventType`;
- claves compuestas hacia responsable (membership), cliente, proyecto y tarea;
- `@@unique([id, organizationId])` en `Task`;
- índices por organización + inicio, responsable, proyecto, cliente y tarea;
- `CHECK` de fin posterior al inicio.

Borrar un cliente, proyecto o tarea **no borra** sus eventos: se desvinculan en una transacción interactiva.

### Archivos principales

- **Servidor:** `src/server/domain/calendar-event.ts`, `validation/calendar-event.schema.ts`, `repositories/calendar-event.repository.ts` y `services/calendar-event.service.ts`, cada uno con su test.
- **Interfaz:** `src/app/(app)/calendar/` con páginas, acciones, `view-model.ts`, `form-data.ts` y `_components/`.
- **Rutas API:** `src/app/api/organizations/[organizationId]/calendar-events/`.
- **Semilla:** 8 eventos en octubre de 2026 (6 de Acme, dos de ellos solapados a propósito, y 2 de Globex).
- **Documentación:** `README.md` y `CLAUDE.md` ya recogen todo.

### Verificación realizada

- 257 tests unitarios en verde, más lint, typecheck, build y `git diff --check`.
- Smoke HTTP contra el servidor real: Calendar 93/93, Tasks 71/71 y Projects 45/45.
- Pruebas manuales en navegador con ADMIN, EMPLOYEE y CLIENT, Acme frente a Globex, y a 1366 px y 375 px.

### Problemas corregidos en el camino

- Mensaje equivocado cuando un CLIENT intentaba crear un evento.
- En móvil, el número del día de hoy se deformaba y el contador del mes salía cortado.
- El intervalo de las tareas en la agenda ocupaba dos líneas.
- El aviso de éxito quedaba fuera de pantalla tras guardar en móvil (corregido en el `Notice` compartido).

### Problemas conocidos (no bloqueantes)

- Aviso del driver `pg` («client.query() when the client is already executing a query…»): ya existía antes del calendario (Prisma 7 con `@prisma/adapter-pg`).
- La tabla de clientes del dashboard tiene scroll horizontal interno a 1366 px (anterior al calendario).
- Sin arrastrar ni redimensionar eventos (pospuesto a V1.5). Un evento dura como máximo un día.
- Las tareas sin fecha límite no aparecen en el calendario.

---

## 4. Rama `feature/fondo-azul`

- **Cambio:** en `src/app/globals.css`, `--canvas` pasa de `#f5f6f8` a `#dbeafe` (modo claro) y de `#0c0e12` a `#0b1a33` (modo oscuro).
- **Commit:** `52b2440`, «style: fondo de la aplicación en azul». Solo toca `globals.css`.
- **Pendiente:** hacer `git push -u origin feature/fondo-azul` y abrir la PR hacia `develop`.
- **Alcance del color:** afecta a las páginas de dentro de la app. La home y las pantallas de login tenían un gris escrito a mano (`bg-zinc-50`) que ignoraba la variable.

---

## 5. Rama `feature/home-smarthub`: la web de SmartHub

El usuario quiere que **SmartDesk sea una opción dentro de una web mayor llamada SmartHub**: la home, en el mismo proyecto, imita una captura de referencia. SmartDesk aparece en el desplegable **Productos ▸ SmartDesk**, que enlaza a `/dashboard`.

Estado: **código escrito en el disco y probado, sin commit**.

### Archivos

| Archivo | Contenido |
| --- | --- |
| `src/app/page.tsx` | Home completa: hero oscuro, servicios, cifras, testimonios, llamada final y pie |
| `src/app/_home/navigation.ts` | Menú principal. Lo que aún no existe se muestra como «Pronto», sin enlace |
| `src/app/_home/icons.tsx` | Iconos propios de la web |
| `src/app/_home/site-header.tsx` | Cabecera de cristal oscuro, desplegables y menú móvil |
| `src/app/_home/effects.tsx` | Aparición al hacer scroll y cifras que cuentan |
| `src/app/_home/particle-sphere.tsx` | Esfera de partículas en WebGL puro |
| `src/app/globals.css` | Animaciones de la home, estrellas y el efecto de los botones |

### Efectos

- **Hero:** azul marino con estrellas que titilan y luces azules lentas. La **esfera de partículas azul** (26.000 puntos en escritorio, 12.000 en móvil) ondula con ruido simplex, gira despacio y se inclina hacia el ratón. Está inspirada en un vídeo de referencia que el usuario grabó.
- **Barra de navegación:** botones en píldora de cristal con una línea de luz azul en el borde inferior. Al pasar el ratón, enfocar con teclado o abrir su desplegable, se enciende otra línea arriba y la píldora brilla. «Precios» queda apagado porque aún no existe. Está inspirada en un segundo vídeo de referencia.
- **Resto de la página:** entrada en cascada, aparición al hacer scroll, cifras que cuentan, tarjetas que se elevan y desplegables animados.
- **Rendimiento y accesibilidad:** sin librerías nuevas. La esfera se pausa cuando no está en pantalla o con la pestaña oculta. Con «reducir movimiento» todo se desactiva o queda estático. Sin WebGL queda solo el resplandor azul.

### Decisiones y detalles

- La barra completa aparece desde **1280 px** (`xl`); por debajo se usa el botón de menú. A 1024 px no cabía.
- El menú móvil tiene altura máxima y scroll propio (antes los botones de abajo eran inalcanzables).
- **Cifras y testimonios** de la captura se copiaron tal cual porque el usuario lo pidió. Hay que sustituirlos por datos reales antes de publicar. Los testimonios usan iniciales en vez de fotos.
- El botón «Contactar con ventas» usa `contacto@smarthub.example`: cambiarlo por el correo real.
- SmartAI, SmartWeb, Precios, Blog, Guías, Centro de ayuda y Sobre nosotros aún no tienen página.
- Comprobado: lint, typecheck, 257 tests y `git diff --check` en verde, y la vista a 1366, 1280, 1024 y 375 px sin scroll horizontal.

### Comandos pendientes para guardarlo en la rama

```powershell
git add src/app/page.tsx src/app/_home src/app/globals.css
git diff --cached --stat
git commit -m "feat: home de SmartHub con esfera de partículas, barra con efecto de luz y acceso a SmartDesk"
```

Deben entrar 7 archivos (`globals.css`, `page.tsx` y cinco en `_home`), ninguno del calendario.

---

## 6. Estado de Git

| Rama | Estado |
| --- | --- |
| `main`, `develop` | Estables. `develop` está en `88c2cf7` (fusión de la PR 6, tareas) |
| `feature/calendar` | Calendario V1 completo, **sin commit** (todos los cambios están en el disco) |
| `feature/fondo-azul` | 1 commit (`52b2440`), **sin push** |
| `feature/home-smarthub` | Rama actual, parte de `feature/fondo-azul`; la home está **sin commit** |

Los cambios del calendario y de la home conviven en el mismo directorio de trabajo. Al hacer `git add`, hay que añadir **solo los archivos de cada cambio** para no mezclar PR.

Orden recomendado para las PR:
1. Subir y fusionar la PR del fondo azul (`feature/fondo-azul` hacia `develop`).
2. Subir la rama de la home y abrir su PR hacia `develop`.
3. El calendario va en su propia rama y PR.

Aviso: al cambiar de rama, los archivos sin commit viajan con el usuario; en una rama que no incluye un cambio, esa parte no se ve (por ejemplo, en `feature/calendar` el fondo vuelve a gris).

---

## 7. Cómo trabajar con el usuario

- **Idioma:** siempre en español.
- **Reparto:** el usuario hace `git add`, `commit`, `push` y las PR. Claude no hace commit, push ni PR salvo petición expresa.
- **Comandos para PowerShell:**
  - Un solo bloque por paso, sin `$` de prompt ni salida mezclada.
  - Ficheros largos con `[IO.File]::WriteAllText(..., @'...'@)`, que evita el BOM de `Set-Content` en PowerShell 5.1. Al pegar bloques largos, Windows Terminal avisa («Va a pegar texto que contiene varias líneas»): se pulsa «Pegar de todas formas» y, si queda un `>>`, Enter.
  - Para cambios pequeños en archivos existentes, scripts con sustituciones (`Contains` / `Replace`) que avisan si no encuentran una ancla.
- **Pruebas de verdad:** no dar nada por terminado sin probarlo (lint, typecheck, tests, build y, si es visible, navegador a 1366 px y 375 px).
- **Terminales:**
  - Servidor de producción local: `next start -p 3100` con `AUTH_TRUST_HOST=true` (ya hay una configuración `smartdesk-prod` en el `.claude/launch.json` de la carpeta `Proyectos`).
  - Desarrollo: `npm run dev` en el 3000.
- **Usuarios del seed:** `admin@acme.test`, `employee@acme.test` y `client@acme.test` en Acme, y `admin@globex.test` en Globex. La contraseña es `SEED_USER_PASSWORD` de su `.env` (nunca se escribe en el código ni en la conversación).
- **Otra organización del usuario:** `raul-cb3f59`. No tocarla en las pruebas.

---

## 8. Convenciones técnicas útiles

- **Fechas de calendario** (`@db.Date`): medianoche UTC; formatear con `formatDay`, nunca con `formatDate`.
- **Fechas de eventos:** instantes en UTC, introducidos y mostrados en hora de Madrid; convertir solo con los helpers de `src/lib/dates.ts`.
- **Server Actions de formulario:** leer solo los campos conocidos (`readXForm`), tratar los ids como no fiables, tomar la organización de `getAppContext()`, y llamar a `unstable_rethrow` antes de mapear errores.
- **Formularios:** `noValidate`, `fieldset disabled` mientras se envía, valores devueltos tras un error y foco en el primer campo inválido.
- **Selects con `defaultValue`:** darles `key={value}` para que se remonten con el valor enviado.
- **Props servidor a cliente:** no pasar funciones (iconos incluidos) de un Server Component a un Client Component.
- **Migraciones:** en un terminal sin interacción, `prisma migrate dev` se niega a continuar si hay avisos. Se usa `prisma migrate diff ... --script` y luego `npm run db:deploy`.
- **Ficheros con CRLF:** el repositorio usa CRLF; los `Replace` de PowerShell fallan con saltos de línea mixtos, así que se evita mezclar finales de línea.
- **Antes de un commit:** `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`.

---

## 9. Pendiente y siguientes pasos

1. Hacer `push` de `feature/fondo-azul` y abrir su PR hacia `develop`.
2. Hacer commit y `push` de `feature/home-smarthub` y abrir su PR.
3. Hacer commit, `push` y PR del calendario desde `feature/calendar`.
4. Sustituir las cifras y los testimonios de ejemplo de la home por datos reales, y el correo de contacto de ejemplo.
5. Crear las páginas de SmartAI, SmartWeb, Precios y Recursos (hoy marcadas como «Pronto»).
6. Decidir si el login y el registro adoptan el fondo azul y el estilo oscuro de la nueva home.
7. Futuro del calendario (V1.5): arrastrar y soltar y redimensionar eventos.
8. Pendientes de fases anteriores: limitar intentos de login, verificación de email, recuperación de contraseña, invitación de usuarios y el panel de actividad real (hoy es un estado vacío).
