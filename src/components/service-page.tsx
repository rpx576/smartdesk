import Link from "next/link";
import type { ReactNode } from "react";
import { getSiteConfig } from "@/config/env";
import type { Service } from "@/content/services";
import { quoteHref, whatsappUrl } from "@/content/site";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { CtaBand } from "./cta-band";
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from "./icons";
import { ServiceIllustration } from "./illustrations";
import { JsonLd } from "./json-ld";
import { RevealOnScroll } from "./reveal-on-scroll";
import { SERVICE_ICONS } from "./service-icon";
import { accentStyle } from "./service-theme";
import { Eyebrow, FaqList, Section, SectionHeading, primaryButton, whatsappButton } from "./ui";

/**
 * Shared layout of the four service pages, so they stay consistent while each
 * one has its own accent and illustration (`service-theme.ts`, `illustrations.tsx`).
 * The sections alternate their layout: split hero with the illustration, grid
 * of what is included, an optional section of their own (plans, examples...),
 * benefits as an editorial list, the process as a band of joined steps, FAQ
 * and the final call to action.
 */
export function ServicePage({ service, children }: { service: Service; children?: ReactNode }) {
  const { url } = getSiteConfig();
  const Icon = SERVICE_ICONS[service.id];
  return (
    <main className="flex-1 overflow-hidden" style={accentStyle(service.id)}>
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
        <span aria-hidden="true" className="acc-blob sh-blob pointer-events-none absolute -right-32 -top-32 -z-10 size-[30rem] rounded-full blur-3xl" />
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
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <div className="sh-enter flex items-center gap-3">
                <span className="acc-badge grid size-11 place-items-center rounded-2xl">
                  <Icon className="size-6" />
                </span>
                <Eyebrow>{service.eyebrow}</Eyebrow>
              </div>
              <h1 id="servicio-title" className="sh-enter sh-delay-1 mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {service.title}
              </h1>
              <p className="sh-enter sh-delay-2 mt-5 max-w-2xl text-lg text-slate-300">{service.intro}</p>
              <ul className="sh-enter sh-delay-2 mt-6 flex flex-wrap gap-2">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-3.5 text-sm font-medium text-slate-200">
                    <CheckIcon className="acc-icon size-4" />
                    {highlight}
                  </li>
                ))}
              </ul>
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
            <div className="acc-visual sh-enter sh-delay-2 mx-auto w-full max-w-xl p-4 sm:p-6">
              <ServiceIllustration id={service.id} />
            </div>
          </div>
        </div>
      </section>

      <Section id="incluye" labelledBy="incluye-title" tone="raised">
        <SectionHeading id="incluye-title" eyebrow="Qué incluye" title={service.itemsTitle} />
        <ul className="sh-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((item, index) => (
            <li key={item.title} data-reveal className="acc-card p-6">
              <span aria-hidden="true" className="acc-text font-mono text-xs tracking-widest">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {children}

      <Section labelledBy="beneficios-title">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading id="beneficios-title" eyebrow="Beneficios" title={service.benefitsTitle} />
          </div>
          <ul className="sh-stagger divide-y divide-white/10 border-y border-white/10">
            {service.benefits.map((benefit) => (
              <li key={benefit.title} data-reveal className="flex gap-5 py-6">
                <span aria-hidden="true" className="acc-chip mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl">
                  <CheckIcon className="size-4" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <section aria-labelledby="proceso-title" className="relative isolate border-y border-white/10 py-20 sm:py-24">
        <div aria-hidden="true" className="acc-visual absolute inset-0 -z-10 rounded-none border-0 opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading id="proceso-title" eyebrow="Proceso" title="Cómo trabajamos" />
          <ol className="acc-steps sh-stagger mt-12 grid gap-8 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none lg:gap-5">
            {service.process.map((step, index) => (
              <li key={step.title} data-reveal className="acc-step">
                <span aria-hidden="true" className="acc-step-dot">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section labelledBy="faq-title" tone="raised">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading id="faq-title" eyebrow="Preguntas frecuentes" title="Dudas frecuentes" />
            <p data-reveal className="mt-4 text-sm text-slate-400">
              ¿No encuentras tu pregunta?{" "}
              <a href={whatsappUrl(`Hola, tengo una duda sobre ${service.name}.`)} target="_blank" rel="noopener noreferrer" className="acc-text font-semibold underline underline-offset-4 hover:text-white">
                Escríbenos por WhatsApp
              </a>
              .
            </p>
          </div>
          <div className="lg:-mt-10">
            <FaqList items={service.faq} />
          </div>
        </div>
      </Section>

      <CtaBand title="Pide tu presupuesto sin compromiso" text="Cuéntanos tu caso y te enviamos una propuesta por escrito." service={service.id} />
    </main>
  );
}
