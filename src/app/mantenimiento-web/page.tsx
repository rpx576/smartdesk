import type { Metadata } from "next";
import { PlanCards } from "@/components/plan-cards";
import { ServicePage } from "@/components/service-page";
import { Section, SectionHeading } from "@/components/ui";
import { MAINTENANCE_PLANS } from "@/content/plans";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("mantenimiento-web");

export const metadata: Metadata = pageMetadata({ title: service.metaTitle, description: service.metaDescription, path: service.href });

export default function MantenimientoWebPage() {
  return (
    <ServicePage service={service}>
      <Section id="planes" labelledBy="planes-title">
        <SectionHeading id="planes-title" eyebrow="Planes" title="Elige la cobertura que necesitas" text="Tres niveles de mantenimiento mensual. Te ayudamos a elegir según tu web." center />
        <PlanCards plans={MAINTENANCE_PLANS} service={service.id} note="Las condiciones de cada plan (frecuencias, horas incluidas y permanencia) se detallan en la propuesta y en el contrato del servicio." />
      </Section>
    </ServicePage>
  );
}
