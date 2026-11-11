import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, OwnerData, legalEmail } from "@/components/legal-page";
import { PROCESSORS } from "@/content/company";
import { publicConfig } from "@/config/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad | Advanthor",
  description: "Cómo trata Advanthor los datos personales de quienes contactan a través de su web, con qué base legal, durante cuánto tiempo y cómo ejercer tus derechos.",
  path: "/politica-de-privacidad",
});

/** Providers in use: the optional ones only when they are configured. */
function activeProcessors() {
  return PROCESSORS.filter((processor) => {
    if (!processor.optional) return true;
    if (processor.name.includes("Turnstile")) return Boolean(publicConfig.turnstileSiteKey);
    if (processor.name.includes("Analytics")) return Boolean(publicConfig.gaId);
    return false;
  });
}

export default function PrivacidadPage() {
  const email = legalEmail();
  return (
    <LegalPage
      title="Política de privacidad"
      intro="En Advanthor tratamos tus datos personales con transparencia y solo para lo que necesitamos. Esta política explica qué datos recogemos a través de esta web, para qué, con qué base legal, durante cuánto tiempo y cómo ejercer tus derechos, conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) y la Ley 34/2002 (LSSI)."
    >
      <h2>1. Responsable del tratamiento</h2>
      <OwnerData />
      <p>
        Puedes escribirnos sobre cualquier cuestión de privacidad a {email}. Advanthor no ha designado delegado de
        protección de datos, ya que su actividad no está entre los supuestos en los que es obligatorio (artículo 37 del
        RGPD y artículo 34 de la LOPDGDD).
      </p>

      <h2>2. Qué datos tratamos, para qué y con qué base legal</h2>
      <table>
        <thead>
          <tr>
            <th>Tratamiento</th>
            <th>Datos</th>
            <th>Finalidad</th>
            <th>Base jurídica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Formulario de contacto y presupuesto</td>
            <td>Nombre, empresa (opcional), correo, teléfono (opcional), servicio de interés, presupuesto y plazo orientativos y mensaje</td>
            <td>Responder a tu consulta y, si lo pides, preparar y enviarte un presupuesto</td>
            <td>Aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD) y tu consentimiento al enviar el formulario (art. 6.1.a RGPD)</td>
          </tr>
          <tr>
            <td>WhatsApp, teléfono y correo</td>
            <td>Número de teléfono o correo, nombre y el contenido de la conversación</td>
            <td>Atender la conversación que inicias</td>
            <td>Medidas precontractuales a petición tuya (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Clientes</td>
            <td>Datos de contacto, de facturación y los necesarios para prestar el servicio</td>
            <td>Prestar el servicio contratado, facturarlo y cumplir las obligaciones contables y fiscales</td>
            <td>Ejecución del contrato (art. 6.1.b RGPD) y obligación legal (art. 6.1.c RGPD)</td>
          </tr>
          <tr>
            <td>Seguridad de la web</td>
            <td>Dirección IP y datos técnicos del navegador</td>
            <td>Evitar envíos automáticos, abusos y ataques</td>
            <td>Interés legítimo en proteger la web y a sus usuarios (art. 6.1.f RGPD)</td>
          </tr>
          <tr>
            <td>Estadísticas de uso</td>
            <td>Datos de navegación seudonimizados</td>
            <td>Conocer cómo se usa la web y mejorarla. Solo si aceptas las cookies de analítica</td>
            <td>Tu consentimiento (art. 6.1.a RGPD y art. 22.2 LSSI)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Los campos marcados como obligatorios en el formulario son necesarios para atender tu solicitud; si no los
        completas, no podremos responderte por esa vía. No enviamos comunicaciones comerciales sin tu consentimiento
        expreso, no tomamos decisiones automatizadas ni elaboramos perfiles con tus datos.
      </p>

      <h2>3. Cuánto tiempo conservamos tus datos</h2>
      <ul>
        <li>
          <strong>Consultas y presupuestos que no se convierten en encargo:</strong> el tiempo necesario para atenderlos y
          un máximo de 12 meses desde el último contacto, por si quieres retomar la propuesta.
        </li>
        <li>
          <strong>Clientes:</strong> mientras dure la relación y, después, durante los plazos legales: seis años para la
          documentación mercantil (artículo 30 del Código de Comercio) y los plazos de prescripción fiscales.
        </li>
        <li>
          <strong>Datos técnicos de seguridad:</strong> la dirección IP se usa solo en memoria para limitar el número de
          envíos y no se guarda en ninguna base de datos.
        </li>
      </ul>
      <p>Pasados esos plazos, los datos se suprimen o se bloquean durante el tiempo en que puedan exigirse responsabilidades.</p>

      <h2>4. Destinatarios y encargados del tratamiento</h2>
      <p>
        No vendemos ni cedemos tus datos a terceros, salvo obligación legal (por ejemplo, a la Agencia Tributaria o a
        jueces y tribunales). Para prestar el servicio contamos con estos proveedores, que actúan como encargados del
        tratamiento con un contrato conforme al artículo 28 del RGPD:
      </p>
      <ul>
        {activeProcessors().map((processor) => (
          <li key={processor.name}>
            <strong>{processor.name}</strong>: {processor.purpose}. Ubicación: {processor.location}.
          </li>
        ))}
      </ul>
      <p>
        Cuando un proveedor trata datos fuera del Espacio Económico Europeo, la transferencia se ampara en el Marco de
        Privacidad de Datos UE-EE. UU., si el proveedor está adherido, o en las cláusulas contractuales tipo aprobadas por
        la Comisión Europea e incluidas en su contrato (artículos 45 y 46 del RGPD).
      </p>

      <h2>5. Tus derechos</h2>
      <p>Puedes ejercer en cualquier momento, sin coste, los siguientes derechos:</p>
      <ul>
        <li><strong>Acceso</strong>: saber si tratamos tus datos y obtener una copia.</li>
        <li><strong>Rectificación</strong>: corregir datos inexactos o incompletos.</li>
        <li><strong>Supresión</strong>: pedir que borremos tus datos cuando ya no sean necesarios.</li>
        <li><strong>Oposición</strong>: oponerte a un tratamiento basado en nuestro interés legítimo.</li>
        <li><strong>Limitación</strong>: pedir que conservemos tus datos sin tratarlos mientras se resuelve una reclamación.</li>
        <li><strong>Portabilidad</strong>: recibir tus datos en un formato estructurado y de uso común.</li>
        <li><strong>Retirar tu consentimiento</strong> en cualquier momento, sin que afecte a la licitud del tratamiento anterior.</li>
      </ul>
      <p>
        Para ejercerlos, escríbenos a {email} indicando el derecho que quieres ejercer. Si tenemos dudas razonables sobre
        tu identidad, podremos pedirte información adicional para confirmarla. Te responderemos en el plazo de un mes,
        ampliable en dos meses más en casos complejos, como prevé el artículo 12 del RGPD.
      </p>
      <p>
        Si consideras que no hemos atendido bien tu solicitud o que el tratamiento no se ajusta a la normativa, puedes
        presentar una reclamación ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
      </p>

      <h2>6. Menores de edad</h2>
      <p>
        La web está dirigida a empresas, autónomos y profesionales. No recogemos de forma consciente datos de menores de
        14 años, que no pueden prestar su consentimiento por sí mismos (artículo 7 de la LOPDGDD). Si detectamos que se
        nos han facilitado, los suprimiremos.
      </p>

      <h2>7. Exactitud de los datos</h2>
      <p>
        Garantizas que los datos que nos facilitas son veraces y te comprometes a comunicarnos cualquier cambio. Si nos
        das datos de otra persona, debes haberla informado y contar con su permiso.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas al riesgo para proteger tus datos frente a pérdidas, accesos
        no autorizados o alteraciones: conexión cifrada (HTTPS), validación y protección antispam del formulario,
        cabeceras de seguridad, acceso restringido a la información y proveedores con garantías de seguridad. Si se
        produjera una brecha de seguridad, actuaríamos conforme a los artículos 33 y 34 del RGPD.
      </p>

      <h2>9. Cookies</h2>
      <p>
        El uso de cookies y tecnologías similares se explica en la <Link href="/politica-de-cookies">política de
        cookies</Link>, y puedes cambiar tu elección en la <Link href="/configuracion-cookies">configuración de
        cookies</Link>.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para adaptarla a cambios legales o de la web. La versión vigente es la publicada
        en esta página, con la fecha de su última actualización. Si el cambio es relevante, lo indicaremos de forma
        visible en la web.
      </p>
    </LegalPage>
  );
}
