# Advanthor · web

Web de **Advanthor, soluciones digitales avanzadas**: empresa de servicios de creación web, mantenimiento web, SEO y ciberseguridad para empresas, autónomos y negocios.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod. Sin base de datos. Despliegue en Netlify.

> El antiguo SaaS SmartDesk y los productos SmartAI/SmartWeb se retiraron de esta web. Su último estado está en la rama `archivo/smartdesk-saas` y en la etiqueta `smartdesk-final`.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000
```

Antes de cada commit: `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` (la CI de `.github/workflows/ci.yml` ejecuta los cuatro).

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio: hero interactivo con el banner, servicios, problemas, diferenciadores, metodología, casos (ocultos hasta tener casos reales), FAQ y CTA |
| `/creacion-web`, `/mantenimiento-web`, `/seo`, `/ciberseguridad` | Páginas de servicio con la plantilla común `src/components/service-page.tsx` |
| `/sobre-nosotros` | Empresa, valores y método |
| `/blog` | Noticias con fuentes, filtros y guardados en el navegador |
| `/contacto` | Formulario de consulta y presupuesto (`?servicio=seo&tipo=presupuesto` lo rellena), WhatsApp, teléfono y reservas si se configuran |
| `/gracias` | Confirmación tras enviar el formulario (noindex) |
| `/aviso-legal`, `/politica-de-privacidad`, `/politica-de-cookies`, `/condiciones-de-contratacion` | Textos legales con marcadores `[PENDIENTE]` |
| `/configuracion-cookies` | Preferencias de cookies (noindex) |
| `POST /api/contacto` | Valida, filtra spam y envía los correos del formulario |

Las direcciones antiguas (`/smartweb`, `/smartai`, `/soluciones`, `/smartdesk/*`, `/login`, `/register`, `/cuenta`, `/en/*`, `/es/*`) redirigen con 301 (`next.config.ts`).

## Dónde se edita el contenido

- `src/content/site.ts`: marca, WhatsApp, menús y enlaces.
- `src/content/services.ts`: los cuatro servicios (textos, listas, beneficios, proceso, FAQ, SEO).
- `src/content/plans.ts`: planes de mantenimiento, modalidades SEO y bloques de ciberseguridad. **Los precios están a `null`** («Precio a consultar») hasta que se fijen.
- `src/content/home.ts`: textos de la home y `CASE_STUDIES` (vacío a propósito).
- `src/content/company.ts`: datos del titular para las páginas legales (todo `null` hasta confirmarlo) y proveedores que tratan datos.
- `public/brand/`: logo y banner. `src/app/icon.png`, `apple-icon.png`, `favicon.ico` y `opengraph-image.jpg` se generan a partir de ellos.

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Para qué |
| --- | --- |
| `SITE_URL` | Dirección pública (canonical, sitemap). Netlify da `URL` por sí mismo |
| `SITE_INDEXING=on` | Abre la web a buscadores. Sin ella todo es `noindex` (hace falta volver a desplegar) |
| `GOOGLE_SITE_VERIFICATION` | Verificación de Search Console |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Envío real de correos del formulario. Sin las tres, el formulario avisa y ofrece WhatsApp |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Antispam de Cloudflare (opcional) |
| `NEXT_PUBLIC_BOOKING_URL` | Botón «Reservar una reunión» (opcional) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4, solo tras aceptar cookies (opcional; activa el banner) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo visible en la web (opcional) |

## Vista previa en Netlify

Cada pull request puede tener su propia vista previa (`deploy-preview-N--<sitio>.netlify.app`), construida con `netlify.toml`. Para que aparezca:

- El sitio de Netlify debe estar enlazado al repositorio `rpx576/smartdesk` (Site configuration > Build & deploy > Continuous deployment > Repository).
- En Deploy Previews debe estar elegido «Any pull request». Si solo se previsualizan los PR contra la rama de producción (`main`), los PR contra `develop` no tienen vista previa.

Netlify solo construye cuando llega un commit nuevo: tras cambiar estos ajustes, hay que subir un commit al PR para obtener la vista previa.

## Seguridad

- Cabeceras en `next.config.ts`: CSP, HSTS (producción), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP.
- Formulario: validación Zod estricta en servidor, campo trampa, tiempo mínimo de rellenado, límite por IP (en memoria, por instancia), Turnstile opcional, HTML de los correos escapado, logs sin datos personales.
- Ningún secreto en el código: todo por variables de entorno.
