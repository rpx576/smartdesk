import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, OwnerData } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Condiciones de contratación | Advanthor",
  description: "Condiciones generales de contratación de los servicios de creación web, mantenimiento, SEO y ciberseguridad de Advanthor.",
  path: "/condiciones-de-contratacion",
});

export default function CondicionesPage() {
  return (
    <LegalPage
      title="Condiciones de contratación"
      intro="Estas condiciones generales se aplican a los servicios que se contratan con el titular. Cada encargo se concreta en una propuesta o presupuesto aceptado por escrito, que prevalece en lo que regule de forma específica."
    >
      <h2>1. Prestador del servicio</h2>
      <OwnerData />
      <h2>2. Servicios</h2>
      <p>
        Creación web, mantenimiento web, SEO y ciberseguridad, con el alcance descrito en cada propuesta. Los servicios de
        auditoría y análisis de vulnerabilidades solo se realizan sobre sistemas del cliente y con su autorización expresa
        por escrito.
      </p>
      <h2>3. Presupuesto, precio y forma de pago</h2>
      <p>[PENDIENTE: validez de los presupuestos, impuestos aplicables, forma y plazos de pago, anticipos.]</p>
      <h2>4. Plazos y entregas</h2>
      <p>[PENDIENTE: cómo se fijan los plazos, qué pasa si el cliente no entrega contenidos a tiempo, revisiones incluidas.]</p>
      <h2>5. Servicios recurrentes (mantenimiento y SEO mensual)</h2>
      <p>[PENDIENTE: duración, renovación, permanencia mínima si la hay, preaviso de baja y cambios de plan.]</p>
      <h2>6. Obligaciones del cliente</h2>
      <p>[PENDIENTE: facilitar accesos y contenidos, titularidad de los materiales que aporta, autorizaciones.]</p>
      <h2>7. Propiedad intelectual y entrega de accesos</h2>
      <p>[PENDIENTE: a quién pertenecen el diseño y el código, licencias de terceros, entrega de accesos al terminar.]</p>
      <h2>8. Responsabilidad</h2>
      <p>
        [PENDIENTE: límites de responsabilidad. No se garantizan posiciones concretas en buscadores ni la imposibilidad
        absoluta de incidentes de seguridad.]
      </p>
      <h2>9. Protección de datos</h2>
      <p>
        Cuando el servicio implique acceder a datos personales del cliente, se firmará un contrato de encargo del
        tratamiento (art. 28 RGPD). Más información en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
      </p>
      <h2>10. Desistimiento</h2>
      <p>
        [PENDIENTE: si se contrata con consumidores a distancia, informar del derecho de desistimiento de 14 días y sus
        excepciones (Real Decreto Legislativo 1/2007).]
      </p>
      <h2>11. Legislación y jurisdicción</h2>
      <p>[PENDIENTE: revisión jurídica.]</p>
    </LegalPage>
  );
}
