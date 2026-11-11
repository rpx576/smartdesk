import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SERVICE_ICONS } from "@/components/service-icon";
import { Eyebrow, Section, SectionHeading, Steps } from "@/components/ui";
import { HOME } from "@/content/home";
import { SERVICES } from "@/content/services";
import { BRAND } from "@/content/site";
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
      <section aria-labelledby="about-title" className="relative isolate pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <span aria-hidden="true" className="sh-blob pointer-events-none absolute -left-32 -top-32 -z-10 size-[30rem] rounded-full bg-blue-700/25 blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="sh-enter">
            <Eyebrow>Sobre nosotros</Eyebrow>
          </div>
          <h1 id="about-title" className="sh-enter sh-delay-1 mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            {BRAND.name}: {BRAND.tagline.toLowerCase()}
          </h1>
          <p className="sh-enter sh-delay-2 mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Ayudamos a empresas, autónomos y negocios a tener una presencia online profesional: la creamos, la mantenemos,
            la hacemos visible en buscadores y la protegemos. Todo desde un mismo equipo y con una forma de trabajar clara.
          </p>
        </div>
      </section>

      <Section labelledBy="que-hacemos-title" tone="raised">
        <SectionHeading id="que-hacemos-title" eyebrow="Qué hacemos" title="Especialistas en cuatro áreas" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id];
            return (
              <li key={service.id} data-reveal className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Icon className="size-7 text-cyan-300" />
                <h3 className="mt-4 text-lg font-semibold text-white">{service.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{service.summary}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="valores-title">
        <SectionHeading id="valores-title" eyebrow="Valores" title="Cómo entendemos nuestro trabajo" />
        <ul className="sh-stagger mt-12 grid gap-5 md:grid-cols-2">
          {VALUES.map((value) => (
            <li key={value.title} data-reveal className="sh-value p-7">
              <h3 className="text-lg font-bold text-white">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{value.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="metodo-title" tone="raised">
        <SectionHeading id="metodo-title" eyebrow={HOME.method.eyebrow} title={HOME.method.title} />
        <Steps steps={HOME.method.steps} />
      </Section>

      <CtaBand title="¿Trabajamos juntos?" text="Cuéntanos tu proyecto y te respondemos con una propuesta clara." />
    </main>
  );
}
