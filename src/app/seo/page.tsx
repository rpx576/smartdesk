import type { Metadata } from "next";
import { PlanCards } from "@/components/plan-cards";
import { ServicePage } from "@/components/service-page";
import { Section, SectionHeading } from "@/components/ui";
import { SEO_PLANS } from "@/content/plans";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("seo");

export const metadata: Metadata = pageMetadata({ title: service.metaTitle, description: service.metaDescription, path: service.href });

export default function SeoPage() {
  return (
    <ServicePage service={service}>
      <Section id="modalidades" labelledBy="modalidades-title">
        <SectionHeading id="modalidades-title" eyebrow="Modalidades" title="Cómo puedes contratar el SEO" text="Desde una auditoría puntual hasta un trabajo continuo mes a mes." center />
        <PlanCards plans={SEO_PLANS} service={service.id} note="No garantizamos posiciones concretas en Google: nadie puede hacerlo. Nos comprometemos con el plan de trabajo y con informes claros." />
      </Section>
    </ServicePage>
  );
}
