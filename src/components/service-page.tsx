import Link from "next/link";
import type { ReactNode } from "react";
import { getSiteConfig } from "@/config/env";
import type { Service } from "@/content/services";
import { quoteHref, whatsappUrl } from "@/content/site";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { CtaBand } from "./cta-band";
import { ArrowRightIcon, CheckCircleIcon, WhatsAppIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { RevealOnScroll } from "./reveal-on-scroll";
import { SERVICE_ICONS } from "./service-icon";
import { Eyebrow, FaqList, Section, SectionHeading, Steps, primaryButton, whatsappButton } from "./ui";

/**
 * Shared layout of the four service pages, so they stay consistent:
 * hero, what is included, an optional section of their own (plans, examples...),
 * benefits, work process, FAQ and the final call to action.
 */
export function ServicePage({ service, children }: { service: Service; children?: ReactNode }) {
  const { url } = getSiteConfig();
  const Icon = SERVICE_ICONS[service.id];
  return (
    <main className="flex-1 overflow-hidden">
      <RevealOnScroll />
      <JsonLd
        data={[
          serviceJsonLd(service, url),
          faqJsonLd(service.faq),
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: service.name, path: service.href }], url),
        ]}
      />

      <section aria-labelledby="servicio-title" className="relative isolate pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <span aria-hidden="true" className="sh-blob pointer-events-none absolute -right-32 -top-32 -z-10 size-[30rem] rounded-full bg-blue-700/25 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav aria-label="Ruta de navegación" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-200">
                {service.name}
              </li>
            </ol>
          </nav>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="sh-enter flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <Icon className="size-6" />
                </span>
                <Eyebrow>{service.eyebrow}</Eyebrow>
              </div>
              <h1 id="servicio-title" className="sh-enter sh-delay-1 mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {service.title}
              </h1>
              <p className="sh-enter sh-delay-2 mt-5 max-w-2xl text-lg text-slate-300">{service.intro}</p>
              <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3 max-sm:[&>*]:flex-1">
                <Link href={quoteHref(service.id)} className={primaryButton}>
                  Pedir presupuesto
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a href={whatsappUrl(`Hola, me interesa el servicio de ${service.name}.`)} target="_blank" rel="noopener noreferrer" className={whatsappButton}>
                  <WhatsAppIcon className="size-5" />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
            <ul className="sh-enter sh-delay-2 grid gap-3">
              {service.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
                  <CheckCircleIcon className="size-6 shrink-0 text-cyan-300" />
                  <span className="font-semibold text-white">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Section id="incluye" labelledBy="incluye-title" tone="raised">
        <SectionHeading id="incluye-title" eyebrow="Servicios" title={service.itemsTitle} />
        <ul className="sh-stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((item) => (
            <li key={item.title} data-reveal className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <CheckCircleIcon className="size-6 text-cyan-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {children}

      <Section labelledBy="beneficios-title" tone="raised">
        <SectionHeading id="beneficios-title" eyebrow="Beneficios" title={service.benefitsTitle} />
        <ul className="sh-stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {service.benefits.map((benefit) => (
            <li key={benefit.title} data-reveal className="sh-value p-6">
              <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="proceso-title">
        <SectionHeading id="proceso-title" eyebrow="Proceso" title="Cómo trabajamos" />
        <Steps steps={service.process} />
      </Section>

      <Section labelledBy="faq-title" tone="raised">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="faq-title" eyebrow="Preguntas frecuentes" title="Dudas frecuentes" center />
          <FaqList items={service.faq} />
        </div>
      </Section>

      <CtaBand title="Pide tu presupuesto sin compromiso" text="Cuéntanos tu caso y te enviamos una propuesta por escrito." service={service.id} />
    </main>
  );
}
