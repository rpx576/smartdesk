import type { Metadata } from "next";
import { LegalPage, OwnerData } from "@/components/legal-page";
import { COMPANY, PROCESSORS, pending } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad | Advanthor",
  description: "Cómo trata Advanthor los datos personales de quienes contactan a través de su web y cómo ejercer tus derechos.",
  path: "/politica-de-privacidad",
});

export default function PrivacidadPage() {
  const contact = pending(COMPANY.email, "correo para ejercer derechos");
  return (
    <LegalPage title="Política de privacidad" intro="Te explicamos qué datos personales tratamos cuando usas esta web, para qué, durante cuánto tiempo y cuáles son tus derechos, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).">
      <h2>1. Responsable del tratamiento</h2>
      <OwnerData />
      <p>Delegado de protección de datos: {pending(COMPANY.dpo, "indicar si existe; si no, eliminar este párrafo")}.</p>

      <h2>2. Qué datos tratamos y para qué</h2>
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
            <td>Nombre, empresa, correo, teléfono, servicio de interés y mensaje</td>
            <td>Responder a tu consulta y, si lo pides, preparar un presupuesto</td>
            <td>Tu consentimiento y la aplicación de medidas precontractuales a tu petición (art. 6.1.a y 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>WhatsApp y teléfono</td>
            <td>Número de teléfono, nombre y lo que nos escribas</td>
            <td>Atender la conversación que inicias</td>
            <td>Tu consentimiento y medidas precontractuales (art. 6.1.a y 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Seguridad del formulario</td>
            <td>Dirección IP (temporalmente, en memoria) y la verificación antispam</td>
            <td>Evitar envíos automáticos y abusos</td>
            <td>Interés legítimo en proteger la web (art. 6.1.f RGPD)</td>
          </tr>
          <tr>
            <td>Analítica (solo si se activa y la aceptas)</td>
            <td>Datos de navegación seudonimizados</td>
            <td>Conocer el uso de la web y mejorarla</td>
            <td>Tu consentimiento (art. 6.1.a RGPD)</td>
          </tr>
        </tbody>
      </table>
      <p>No tomamos decisiones automatizadas ni elaboramos perfiles con tus datos.</p>

      <h2>3. Cuánto tiempo conservamos tus datos</h2>
      <p>
        Los datos de contacto se conservan mientras se gestiona tu consulta y, si no llegas a ser cliente,{" "}
        [PENDIENTE: plazo, por ejemplo 12 meses]. Si contratas un servicio, se conservan durante la relación y los plazos
        legales posteriores. [PENDIENTE: confirmar plazos con asesoría.]
      </p>

      <h2>4. Destinatarios y encargados del tratamiento</h2>
      <p>No cedemos tus datos a terceros salvo obligación legal. Para prestar el servicio usamos estos proveedores:</p>
      <ul>
        {PROCESSORS.map((processor) => (
          <li key={processor.name}>
            <strong>{processor.name}</strong>: {processor.purpose}. Ubicación: {processor.location}.
          </li>
        ))}
      </ul>
      <p>
        Cuando un proveedor está fuera del Espacio Económico Europeo, la transferencia se ampara en una decisión de
        adecuación (como el Marco de Privacidad de Datos UE-EE. UU.) o en cláusulas contractuales tipo. [PENDIENTE:
        verificar el mecanismo de cada proveedor y firmar sus contratos de encargo del tratamiento.]
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad, y retirar tu consentimiento en cualquier momento, escribiendo a {contact} e indicando el derecho que
        quieres ejercer. Responderemos en el plazo de un mes.
      </p>
      <p>
        Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de
        Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger tus datos: conexión cifrada (HTTPS), validación y
        protección antispam del formulario, y acceso restringido a la información.
      </p>
    </LegalPage>
  );
}
