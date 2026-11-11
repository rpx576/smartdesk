import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { HeroStage } from "@/components/hero-stage";
import { AlertIcon, ArrowRightIcon, ClockIcon, LockIcon, MessageIcon, SearchIcon, TrendingIcon, WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SERVICE_ICONS } from "@/components/service-icon";
import { CheckList, Eyebrow, FaqList, Section, SectionHeading, Steps, primaryButton, secondaryButton, whatsappButton } from "@/components/ui";
import { CASE_STUDIES, HOME } from "@/content/home";
import { SERVICES } from "@/content/services";
import { BRAND, quoteHref, whatsappUrl } from "@/content/site";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: HOME.metaTitle, description: HOME.metaDescription, path: "/" });

const problemIcons = [ClockIcon, SearchIcon, AlertIcon, LockIcon, TrendingIcon, MessageIcon];

export default function Home() {
  return (
    <main className="flex-1 overflow-hidden">
      <RevealOnScroll />
      <JsonLd data={faqJsonLd(HOME.faq)} />

      {/* 1. Hero: the interactive banner and the value proposition. */}
      <section aria-labelledby="hero-title" className="relative isolate pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10" />
        <span aria-hidden="true" className="sh-blob pointer-events-none absolute -left-40 -top-40 -z-10 size-[34rem] rounded-full bg-blue-700/25 blur-3xl" />
        <span aria-hidden="true" className="sh-blob pointer-events-none absolute -right-40 top-40 -z-10 size-[30rem] rounded-full bg-cyan-500/10 blur-3xl [animation-delay:-7s]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto w-full max-w-6xl" style={{ width: "min(100%, calc(56svh * 1672 / 941))" }}>
            <HeroStage />
          </div>
          <div className="mx-auto mt-10 max-w-4xl text-center sm:mt-12">
            <h1 id="hero-title" className="sh-enter sh-delay-1 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {BRAND.headline.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{BRAND.headline.split(" ").at(-1)}</span>
            </h1>
            <p className="sh-enter sh-delay-2 mx-auto mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">
              {BRAND.subheadline} Creación web, mantenimiento, SEO y ciberseguridad para empresas, autónomos y negocios.
            </p>
            <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap justify-center gap-3 max-sm:[&>*]:flex-1">
              <Link href={quoteHref()} className={primaryButton}>
                Pedir presupuesto
                <ArrowRightIcon className="size-4" />
              </Link>
              <a href="#servicios" className={secondaryButton}>
                Ver servicios
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={whatsappButton}>
                <WhatsAppIcon className="size-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Presentation */}
      <Section labelledBy="intro-title" tone="raised">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading id="intro-title" eyebrow={HOME.intro.eyebrow} title={HOME.intro.title} text={HOME.intro.text} />
          <ul data-reveal className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {HOME.intro.points.map((point) => (
              <li key={point.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-lg font-semibold text-white">{point.title}</p>
                <p className="mt-1 text-sm text-slate-400">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3. The four services */}
      <Section id="servicios" labelledBy="servicios-title">
        <SectionHeading id="servicios-title" eyebrow="Servicios" title="Todo lo que tu presencia online necesita" text="Cuatro servicios especializados que puedes contratar por separado o combinados." center />
        <ul className="sh-stagger mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id];
            return (
              <li key={service.id} data-reveal className="sh-lift group relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/40 to-slate-950 p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">
                  <Link href={service.href} className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-blue-400">
                    {service.name}
                  </Link>
                </h3>
                <p className="mt-2 text-slate-400">{service.summary}</p>
                <CheckList items={service.items.slice(0, 4).map((item) => item.title)} className="mt-5" />
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 group-hover:text-white">
                  Ver {service.name.toLowerCase() === "seo" ? "SEO" : service.name.toLowerCase()}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 4. Problems we solve */}
      <Section labelledBy="problemas-title" tone="raised">
        <SectionHeading id="problemas-title" eyebrow={HOME.problems.eyebrow} title={HOME.problems.title} />
        <ul className="sh-stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOME.problems.items.map((problem, index) => {
            const Icon = problemIcons[index % problemIcons.length];
            return (
              <li key={problem.title} data-reveal className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icon className="size-6 shrink-0 text-cyan-300" />
                <div>
                  <h3 className="font-semibold text-white">{problem.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{problem.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 5. Differentiators */}
      <Section labelledBy="diferencias-title">
        <SectionHeading id="diferencias-title" eyebrow={HOME.differentiators.eyebrow} title={HOME.differentiators.title} />
        <ul className="sh-stagger mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {HOME.differentiators.items.map((item, index) => (
            <li key={item.title} data-reveal className="sh-value flex flex-col p-6 sm:p-7">
              <span aria-hidden="true" className="sh-value__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 6. Methodology */}
      <Section labelledBy="metodo-title" tone="raised">
        <SectionHeading id="metodo-title" eyebrow={HOME.method.eyebrow} title={HOME.method.title} />
        <Steps steps={HOME.method.steps} />
      </Section>

      {/* 7. Case studies: only real, publishable ones. Hidden while there are none. */}
      {CASE_STUDIES.length > 0 && (
        <Section labelledBy="casos-title">
          <SectionHeading id="casos-title" eyebrow={HOME.cases.eyebrow} title={HOME.cases.title} />
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CASE_STUDIES.map((item) => (
              <li key={item.client} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Eyebrow>{item.service}</Eyebrow>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.client}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.summary}</p>
                <p className="mt-3 text-sm font-semibold text-cyan-300">{item.result}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-blue-300 hover:text-white">
                    Ver proyecto
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 8. FAQ */}
      <Section labelledBy="faq-title">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="faq-title" eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" center />
          <FaqList items={HOME.faq} />
        </div>
      </Section>

      {/* 9. Final call to action (the footer comes from the layout) */}
      <CtaBand title={HOME.cta.title} text={HOME.cta.text} />
    </main>
  );
}
