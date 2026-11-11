import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from "@/lib/consent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de cookies | Advanthor",
  description: "Qué cookies y tecnologías similares usa la web de Advanthor y cómo puedes aceptarlas, rechazarlas o cambiar tu elección.",
  path: "/politica-de-cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies" intro="Las cookies son pequeños archivos que una web guarda en tu navegador. Aquí te explicamos cuáles usa esta web, con qué fin y cómo gestionarlas.">
      <h2>1. Cookies y almacenamiento que usamos</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{CONSENT_COOKIE}</td>
            <td>Propia, técnica</td>
            <td>Recordar tu elección sobre las cookies</td>
            <td>{CONSENT_MAX_AGE_DAYS} días</td>
          </tr>
          <tr>
            <td>smarthub.blog.saved (localStorage)</td>
            <td>Propia, técnica</td>
            <td>Guardar los artículos del blog que marcas, solo en tu navegador</td>
            <td>Hasta que los borres</td>
          </tr>
          <tr>
            <td>Cloudflare Turnstile</td>
            <td>Tercero, técnica</td>
            <td>Comprobar que el formulario lo envía una persona (solo si está activado)</td>
            <td>Sesión</td>
          </tr>
          <tr>
            <td>_ga, _ga_*</td>
            <td>Tercero (Google), analítica</td>
            <td>Estadísticas de uso. Solo se instalan si las aceptas y si la analítica está activada</td>
            <td>Hasta 2 años</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ahora mismo la web no instala cookies de analítica ni de publicidad. Si en el futuro se activan, se pedirá tu
        consentimiento antes de cargarlas. [PENDIENTE: actualizar esta tabla si se añaden servicios de terceros.]
      </p>
      <h2>2. Cómo aceptar, rechazar o cambiar tu elección</h2>
      <p>
        Puedes cambiar tu elección en cualquier momento desde la <Link href="/configuracion-cookies">configuración de
        cookies</Link>, enlazada en el pie de todas las páginas. También puedes borrar las cookies desde la configuración
        de tu navegador.
      </p>
      <h2>3. Más información</h2>
      <p>
        Consulta la <Link href="/politica-de-privacidad">política de privacidad</Link> para saber cómo tratamos tus datos
        personales.
      </p>
    </LegalPage>
  );
}
