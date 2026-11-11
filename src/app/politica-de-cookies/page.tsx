import type { Metadata } from "next";
import Link from "next/link";
import { ConsentSettings } from "@/components/cookies/consent";
import { LegalPage } from "@/components/legal-page";
import { publicConfig } from "@/config/env";
import { COMPANY } from "@/content/company";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from "@/lib/consent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de cookies | Advanthor",
  description: "Qué cookies y tecnologías similares usa la web de Advanthor, con qué finalidad, cuánto duran y cómo puedes aceptarlas, rechazarlas o retirar tu consentimiento.",
  path: "/politica-de-cookies",
});

/** Whether each optional third party is switched on in this build (they are configured through the environment). */
const ANALYTICS_ON = Boolean(publicConfig.gaId);
const TURNSTILE_ON = Boolean(publicConfig.turnstileSiteKey);

const status = (on: boolean) => (on ? "Activo en esta web" : "No activo actualmente: no se instala");

const BROWSERS = [
  { name: "Google Chrome", href: "https://support.google.com/chrome/answer/95647?hl=es" },
  { name: "Mozilla Firefox", href: "https://support.mozilla.org/es/kb/Borrar%20cookies" },
  { name: "Safari", href: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
  { name: "Microsoft Edge", href: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      intro="En esta política te explicamos qué son las cookies, cuáles usa esta web, para qué sirven, cuánto tiempo se conservan y cómo puedes aceptarlas, rechazarlas o cambiar tu decisión en cualquier momento."
    >
      <h2>1. Introducción y normativa aplicable</h2>
      <p>
        La web de Advanthor (en adelante, «la web») utiliza cookies y otras tecnologías de almacenamiento similares. Para
        simplificar, en este documento llamamos «cookies» a todas ellas. Esta política se ha redactado conforme al artículo
        22.2 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), al
        Reglamento (UE) 2016/679 general de protección de datos (RGPD), a la Ley Orgánica 3/2018 de protección de datos
        personales y garantía de los derechos digitales (LOPDGDD) y a la Guía sobre el uso de las cookies de la Agencia
        Española de Protección de Datos (AEPD).
      </p>
      <p>
        El responsable de las cookies propias es el titular de la web, cuyos datos de identificación figuran en el{" "}
        <Link href="/aviso-legal">aviso legal</Link>. Las cookies de terceros son responsabilidad de cada proveedor, que se
        indica en la tabla del apartado 5.
      </p>

      <h2>2. ¿Qué son las cookies y tecnologías similares?</h2>
      <p>
        Una cookie es un pequeño archivo de texto que una web guarda en tu navegador cuando la visitas. En visitas
        posteriores, el navegador puede devolver esa información a la web que la instaló o a un tercero, lo que permite,
        por ejemplo, recordar tus preferencias o saber cómo se usa la web.
      </p>
      <p>Además de las cookies, existen otras tecnologías con una función parecida:</p>
      <ul>
        <li>
          <strong>Almacenamiento local (localStorage):</strong> guarda datos en tu navegador que no se envían
          automáticamente a ningún servidor.
        </li>
        <li>
          <strong>Scripts:</strong> fragmentos de código que hacen que la web funcione y sea interactiva. Algunos, como los
          de analítica, pueden leer o instalar cookies.
        </li>
        <li>
          <strong>Balizas web o píxeles:</strong> imágenes invisibles que permiten medir visitas. Esta web no utiliza
          balizas publicitarias ni píxeles de seguimiento.
        </li>
      </ul>

      <h2>3. Tipos de cookies según su finalidad</h2>
      <h3>3.1. Cookies técnicas o necesarias</h3>
      <p>
        Permiten que la web funcione correctamente y que se cumplan las funciones que pides de forma expresa, como
        recordar tu decisión sobre las cookies, guardar artículos del blog o proteger el formulario de contacto frente al
        spam. Están exentas de consentimiento conforme al artículo 22.2 de la LSSI, por lo que no pueden desactivarse desde
        el panel de configuración, aunque sí puedes borrarlas desde tu navegador.
      </p>
      <h3>3.2. Cookies de análisis o estadísticas</h3>
      <p>
        Permiten saber, de forma agregada, cuántas personas visitan la web, qué páginas consultan y cómo llegan a ella,
        para mejorar sus contenidos y su funcionamiento. Solo se instalan si las aceptas.
      </p>
      <h3>3.3. Cookies de publicidad, marketing o redes sociales</h3>
      <p>
        Esta web <strong>no utiliza</strong> cookies de publicidad comportamental, de seguimiento con fines de marketing ni
        cookies de redes sociales, y no elabora perfiles de usuario. Tampoco incrusta contenidos de redes sociales que
        instalen cookies.
      </p>

      <h2>4. Cookies propias y de terceros</h2>
      <p>
        Según quién las gestiona, las cookies pueden ser <strong>propias</strong>, si las instala la propia web, o{" "}
        <strong>de terceros</strong>, si las instala otra entidad que presta un servicio a la web. Según su duración,
        pueden ser <strong>de sesión</strong>, si se borran al cerrar el navegador, o <strong>persistentes</strong>, si se
        conservan durante el plazo indicado.
      </p>

      <h2>5. Cookies que utiliza esta web</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Titular</th>
              <th>Tipo</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{CONSENT_COOKIE}</td>
              <td>Propia</td>
              <td>Técnica (cookie)</td>
              <td>Guardar tu decisión sobre las cookies de análisis para no volver a preguntarte en cada visita.</td>
              <td>{CONSENT_MAX_AGE_DAYS} días</td>
            </tr>
            <tr>
              <td>smarthub.blog.saved</td>
              <td>Propia</td>
              <td>Técnica (localStorage)</td>
              <td>
                Recordar los artículos del blog que marcas para leer más tarde. Se guarda solo en tu navegador y no se envía
                a ningún servidor.
              </td>
              <td>Hasta que la borres</td>
            </tr>
            <tr>
              <td>Cloudflare Turnstile</td>
              <td>Cloudflare, Inc.</td>
              <td>Técnica de seguridad</td>
              <td>
                Comprobar que el formulario de contacto lo envía una persona y no un programa automático. Solo se carga en
                la página de contacto. {status(TURNSTILE_ON)}.
              </td>
              <td>Durante la verificación</td>
            </tr>
            <tr>
              <td>_ga</td>
              <td>Google Ireland Ltd.</td>
              <td>Análisis</td>
              <td>
                Distinguir visitantes de forma seudónima para elaborar estadísticas de uso de la web. Requiere tu
                consentimiento. {status(ANALYTICS_ON)}.
              </td>
              <td>2 años</td>
            </tr>
            <tr>
              <td>_ga_*</td>
              <td>Google Ireland Ltd.</td>
              <td>Análisis</td>
              <td>
                Mantener el estado de la sesión de Google Analytics 4 para medir las visitas. Requiere tu consentimiento.{" "}
                {status(ANALYTICS_ON)}.
              </td>
              <td>2 años</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Servicios externos sin cookies de seguimiento.</strong> Algunas fotografías del blog se sirven desde los
        servidores de Unsplash, y el botón de WhatsApp es un enlace normal que solo abre WhatsApp si lo pulsas. Esta web no
        les pide instalar cookies. Al cargar una imagen externa, tu navegador se conecta a ese servidor, que recibe datos
        técnicos como tu dirección IP. Si decides abrir WhatsApp, se aplicará la política de privacidad de Meta.
      </p>
      <p>
        Si en el futuro la web incorpora nuevas cookies o servicios, actualizaremos esta tabla antes de activarlos y, cuando
        requieran consentimiento, te lo volveremos a pedir.
      </p>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Google y Cloudflare pueden tratar datos en Estados Unidos. Ambas empresas están adheridas al Marco de Privacidad de
        Datos UE-EE. UU. (EU-US Data Privacy Framework), reconocido por la Comisión Europea mediante su decisión de
        adecuación de 10 de julio de 2023, y aplican además cláusulas contractuales tipo. Puedes consultar sus políticas en{" "}
        <a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">
          policies.google.com/privacy
        </a>{" "}
        y{" "}
        <a href="https://www.cloudflare.com/es-es/privacypolicy/" target="_blank" rel="noopener noreferrer">
          cloudflare.com/privacypolicy
        </a>
        .
      </p>

      <h2>7. Consentimiento</h2>
      <p>
        Cuando la web usa cookies que requieren consentimiento, en tu primera visita aparece un aviso con tres opciones con
        el mismo protagonismo: <strong>Aceptar</strong>, <strong>Rechazar</strong> y <strong>Configurar</strong>. Hasta que
        elijas, solo se usan las cookies técnicas. Seguir navegando, desplazarte por la página o cerrar el aviso no se
        considera aceptación.
      </p>
      <p>
        Tu decisión se guarda durante {CONSENT_MAX_AGE_DAYS} días. Pasado ese plazo te volveremos a preguntar. Rechazar las
        cookies de análisis no limita el acceso a ningún contenido ni servicio de la web.
      </p>
      <h3>7.1. Gestiona tu consentimiento</h3>
      <p>
        Puedes aceptar o retirar tu consentimiento aquí mismo o, en cualquier momento, desde la{" "}
        <Link href="/configuracion-cookies">configuración de cookies</Link>, enlazada en el pie de todas las páginas.
        Retirarlo es tan fácil como darlo: al desactivar el análisis, borramos las cookies de Google Analytics de tu
        navegador.
      </p>
      <div className="mt-5">
        <ConsentSettings />
      </div>

      <h2>8. Cómo bloquear o eliminar las cookies desde tu navegador</h2>
      <p>
        Además del panel anterior, puedes permitir, bloquear o eliminar las cookies desde la configuración de tu navegador.
        También puedes configurarlo para que te avise cada vez que una web intente instalar una cookie. Estas son las
        instrucciones de los navegadores más habituales:
      </p>
      <ul>
        {BROWSERS.map((browser) => (
          <li key={browser.name}>
            <a href={browser.href} target="_blank" rel="noopener noreferrer">
              {browser.name}
            </a>
          </li>
        ))}
      </ul>
      <p>
        Si bloqueas todas las cookies, algunas funciones, como recordar tu decisión sobre las cookies o tus artículos
        guardados, dejarán de funcionar. Si las borras, te volveremos a pedir el consentimiento en tu próxima visita.
      </p>

      <h2>9. Tus derechos</h2>
      <p>
        Las cookies de análisis pueden tratar datos personales seudonimizados, como identificadores en línea. Respecto a
        ellos, puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad, así como retirar tu consentimiento en cualquier momento sin que ello afecte a la licitud del
        tratamiento previo. En la <Link href="/politica-de-privacidad">política de privacidad</Link> te explicamos cómo
        ejercerlos.
      </p>
      <p>
        Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la Agencia
        Española de Protección de Datos en{" "}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        .
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política cuando cambien las cookies que usa la web o la normativa aplicable. La fecha de la
        última actualización figura al principio de la página. Si los cambios afectan a cookies que requieren tu
        consentimiento, te lo volveremos a pedir.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier pregunta sobre esta política de cookies, puedes escribirnos a través del{" "}
        <Link href="/contacto">formulario de contacto</Link> o llamarnos al{" "}
        <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>.
      </p>
    </LegalPage>
  );
}
