import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { Section, SectionHeading } from "@/components/ui";
import { WebExamples } from "@/components/web-examples";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const service = getService("creacion-web");

export const metadata: Metadata = pageMetadata({ title: service.metaTitle, description: service.metaDescription, path: service.href });

export default function CreacionWebPage() {
  return (
    <ServicePage service={service}>
      <Section labelledBy="ejemplos-title">
        <SectionHeading
          id="ejemplos-title"
          eyebrow="Ejemplos"
          title="Tipos de web que creamos"
          text="Ilustraciones del tipo de proyecto, no trabajos de clientes. Cada web se diseña a medida de su negocio."
        />
        <WebExamples />
      </Section>
    </ServicePage>
  );
}
