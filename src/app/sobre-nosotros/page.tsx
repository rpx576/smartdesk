import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { ArrowRightIcon } from "@/components/icons";
import { AboutOrbitIllustration, AboutTeamIllustration } from "@/components/illustrations";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SERVICE_ICONS } from "@/components/service-icon";
import { accentStyle } from "@/components/service-theme";
import { Eyebrow, Section, SectionHeading, Steps, primaryButton, secondaryButton } from "@/components/ui";
import { HOME } from "@/content/home";
import { SERVICES } from "@/content/services";
import { BRAND, quoteHref } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sobre nosotros | Advanthor",
  description: "Conoce Advanthor: servicios de creación web, mantenimiento, SEO y ciberseguridad para empresas, autónomos y negocios, y nuestra forma de trabajar.",
  path: "/sobre-nosotros",
});

const VALUES = [
  { title: "Claridad", text: "Explicamos qué hacemos, cuánto cuesta y cuánto tarda antes de empezar." },
  { title: "Honestidad", text: "Solo ofrecemos lo que sabemos hacer bien y decimos que no cuando algo no encaja." },
  { title: "Rigor técnico", text: "Buenas prácticas de rendimiento, accesibilidad, SEO y seguridad en cada proyecto." },
  { title: "Cercanía", text: "Comunicación directa y respuesta a tus dudas sin intermediarios." },
];

export default function SobreNosotrosPage() {
  return (
    <main className="flex-1 overflow-hidden">
      <RevealOnScroll />
      <section aria-labelledby="about-title" className="relative isolate pb-16 pt-12 sm:pb-24 sm:pt-16">
        <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <span aria-hidden="true" className="sh-blob pointer-events-none absolute -left-32 -top-32 -z-10 size-[30rem] rounded-full bg-blue-700/25 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <div className="sh-enter">
              <Eyebrow>Sobre nosotros</Eyebrow>
            </div>
            <h1 id="about-title" className="sh-enter sh-delay-1 mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {BRAND.name}: {BRAND.tagline.toLowerCase()}
            </h1>
            <p className="sh-enter sh-delay-2 mt-6 max-w-2xl text-lg text-slate-300">
              Ayudamos a empresas, autónomos y negocios a tener una presencia online profesional: la creamos, la mantenemos,
              la hacemos visible en buscadores y la protegemos. Todo desde un mismo equipo y con una forma de trabajar clara.
            </p>
            <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3 max-sm:[&>*]:flex-1">
              <Link href={quoteHref()} className={primaryButton}>
                Pedir presupuesto
                <ArrowRightIcon className="size-4" />
              </Link>
              <a href="#que-hacemos" className={secondaryButton}>
                Qué hacemos
              </a>
            </div>
          </div>
          <div className="acc-visual sh-enter sh-delay-2 mx-auto w-full max-w-xl p-4 sm:p-6">
            <AboutOrbitIllustration />
          </div>
        </div>
      </section>

      <Section id="que-hacemos" labelledBy="que-hacemos-title" tone="raised">
        <SectionHeading
          id="que-hacemos-title"
          eyebrow="Qué hacemos"
          title="Cuatro especialidades, un mismo equipo"
          text="Cada área tiene su propio método, pero todas comparten el mismo objetivo: que tu web funcione y te traiga clientes."
        />
        <ul className="sh-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id];
            return (
              <li key={service.id} data-reveal style={accentStyle(service.id)} className="acc-card">
                <Link href={service.href} className="group flex h-full flex-col rounded-[1.25rem] p-6 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
                  <span className="acc-chip grid size-11 place-items-center rounded-2xl">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{service.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{service.summary}</p>
                  <span className="acc-text mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Ver servicio
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="valores-title">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div data-reveal className="acc-visual order-last mx-auto w-full max-w-lg p-4 sm:p-6 lg:order-first">
            <AboutTeamIllustration />
          </div>
          <div>
            <SectionHeading id="valores-title" eyebrow="Valores" title="Cómo entendemos nuestro trabajo" />
            <dl className="sh-stagger mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {VALUES.map((value, index) => (
                <div key={value.title} data-reveal className="border-l border-blue-400/40 pl-5">
                  <dt className="flex items-baseline gap-3 text-lg font-bold text-white">
                    <span aria-hidden="true" className="acc-text font-mono text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {value.title}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-400">{value.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section labelledBy="metodo-title" tone="raised">
        <SectionHeading id="metodo-title" eyebrow={HOME.method.eyebrow} title={HOME.method.title} />
        <Steps steps={HOME.method.steps} />
      </Section>

      <CtaBand title="¿Trabajamos juntos?" text="Cuéntanos tu proyecto y te respondemos con una propuesta clara." />
    </main>
  );
}
