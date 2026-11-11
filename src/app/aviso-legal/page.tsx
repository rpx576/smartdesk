import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, OwnerData } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Aviso legal | Advanthor",
  description: "Aviso legal del sitio web de Advanthor: datos del titular, condiciones de uso y propiedad intelectual.",
  path: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal" intro="En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se informa de los datos del titular de este sitio web.">
      <h2>1. Datos del titular</h2>
      <OwnerData />
      <h2>2. Objeto</h2>
      <p>
        Este sitio web presenta los servicios de creación web, mantenimiento web, SEO y ciberseguridad que ofrece el
        titular, y permite contactar con él. El acceso a la web es gratuito y atribuye la condición de usuario.
      </p>
      <h2>3. Condiciones de uso</h2>
      <p>
        El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas,
        para introducir código dañino o para intentar acceder sin autorización a sistemas del titular o de terceros.
      </p>
      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos, la marca, el logotipo y el diseño de esta web pertenecen a su titular o se usan con autorización.
        No se permite su reproducción sin permiso, salvo para uso personal y privado. [PENDIENTE: confirmar titularidad o
        registro de la marca «Advanthor».]
      </p>
      <h2>5. Enlaces</h2>
      <p>
        La web puede contener enlaces a sitios de terceros (por ejemplo, las fuentes de los artículos del blog o
        WhatsApp). El titular no se responsabiliza de sus contenidos ni de sus políticas.
      </p>
      <h2>6. Responsabilidad</h2>
      <p>
        El titular procura que la información de la web sea correcta y esté actualizada, pero no garantiza la ausencia de
        errores ni la disponibilidad continua del sitio. Los artículos del blog son informativos y no sustituyen el
        asesoramiento profesional.
      </p>
      <h2>7. Protección de datos y cookies</h2>
      <p>
        El tratamiento de datos personales se explica en la <Link href="/politica-de-privacidad">política de privacidad</Link> y
        el uso de cookies en la <Link href="/politica-de-cookies">política de cookies</Link>.
      </p>
      <h2>8. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. [PENDIENTE: revisión jurídica de la cláusula de jurisdicción,
        que no puede perjudicar los derechos de los consumidores.]
      </p>
    </LegalPage>
  );
}
