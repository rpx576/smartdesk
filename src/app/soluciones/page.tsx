import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "../smartdesk/(app)/_components/icons";
import { RevealOnScroll } from "../_home/effects";
import { BotIcon, DeskIcon, GlobeIcon, LogoIcon } from "../_home/icons";
import { SiteHeader } from "../_home/site-header";
import { NeedsFinder } from "./needs-finder";
import { SolutionVisual } from "./solution-visuals";
import { solutions, type SolutionId } from "./solutions";
import "./soluciones.css";

export const metadata: Metadata = {
  title: "Soluciones · SmartHub",
  description:
    "SmartDesk para gestionar tu empresa, SmartAI para automatizar con inteligencia artificial y SmartWeb para tener una web que vende. Descubre cuál encaja contigo.",
};

const icons: Record<SolutionId, ComponentType<SVGProps<SVGSVGElement>>> = {
  smartdesk: DeskIcon,
  smartai: BotIcon,
  smartweb: GlobeIcon,
};

const flow = [
  { id: "smartweb", step: "Atrae", text: "Tu web aparece en Google y el cliente te pide presupuesto." },
  { id: "smartai", step: "Responde", text: "SmartAI contesta al momento y prepara la propuesta por ti." },
  { id: "smartdesk", step: "Organiza", text: "SmartDesk lo convierte en cliente, proyecto, tareas y fechas." },
] as const;

const steps = [
  { title: "Nos cuentas tu caso", text: "Una conversación sin compromiso para entender cómo trabajas hoy." },
  { title: "Te proponemos un plan", text: "Qué servicio empezar, qué incluye y cuánto cuesta, por escrito." },
  { title: "Lo ponemos en marcha", text: "Diseñamos, configuramos y te enseñamos a sacarle partido." },
  { title: "Crecemos contigo", text: "Soporte, mejoras y nuevas piezas cuando tu negocio las necesite." },
];

const faqs = [
  {
    q: "¿Tengo que contratar los tres servicios?",
    a: "No. Cada servicio funciona por separado. Puedes empezar por el que más te urge y sumar otros cuando quieras; están pensados para encajar entre sí.",
  },
  {
    q: "¿Cómo empiezo con SmartDesk?",
    a: "Crea tu cuenta de SmartHub, entra en SmartDesk y crea tu organización. En unos minutos puedes dar de alta clientes, proyectos y tareas e invitar a tu equipo.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Nos encargamos de la parte técnica y te lo dejamos listo para usar. Si algo no queda claro, te lo explicamos.",
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tus datos son tuyos. En SmartDesk cada organización solo ve su información y los permisos dependen del rol de cada persona.",
  },
  {
    q: "¿Cuánto cuesta un proyecto de SmartAI o SmartWeb?",
    a: "Depende de lo que necesites. Tras la primera conversación te enviamos una propuesta cerrada con el precio, sin sorpresas.",
  },
];

/** Hero illustration: the SmartHub core with its three services orbiting around it. */
function SolutionsOrbit() {
  return (
    <div className="so-orbit mx-auto w-full max-w-[26rem]">
      <div className="so-orbit__glow" aria-hidden="true" />
      {solutions.map((solution, index) => {
        const Icon = icons[solution.id];
        return (
          <div key={solution.id} className={`so-ring so-ring--${index + 1}`}>
            <a href={`#${solution.id}`} className={`so-planet so-planet--${solution.id}`}>
              <span className="so-planet__body">
                <Icon className="size-5" />
                <span className="text-xs font-semibold">{solution.name}</span>
              </span>
            </a>
          </div>
        );
      })}
      <div className="so-core" aria-hidden="true">
        <LogoIcon className="size-9 text-white" />
        <span className="mt-1 text-xs font-bold tracking-wide">SmartHub</span>
      </div>
    </div>
  );
}

/** "Soluciones" page: the services of SmartHub explained for the customer. */
export default function SolutionsPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-x-clip bg-[#05061a] font-sans text-slate-100">
      <div className="so-bg" aria-hidden="true">
        <div className="sh-stars absolute inset-0 opacity-60" />
        <div className="so-aurora so-aurora--a" />
        <div className="so-aurora so-aurora--b" />
      </div>
      <SiteHeader />
      <RevealOnScroll />

      <main className="flex-1">
        {/* Hero */}
        <section aria-labelledby="soluciones-title" className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-300 outline-none transition-colors hover:border-indigo-400/40 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            <span aria-hidden="true">←</span>
            Volver al inicio
          </Link>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="sh-enter">
              <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-200">
                Tres soluciones · Un mismo ecosistema
              </p>
              <h1 id="soluciones-title" className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
                Gestiona, automatiza y <span className="so-gradient-text">haz crecer</span> tu negocio.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Organiza tu día a día con <strong className="text-blue-300">SmartDesk</strong>, deja que la
                inteligencia artificial trabaje por ti con <strong className="text-violet-300">SmartAI</strong> y
                consigue clientes con una web hecha por <strong className="text-emerald-300">SmartWeb</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#reto" className="so-btn">
                  Descubrir cuál necesito
                  <ArrowRightIcon className="size-4" />
                </a>
                <Link href="/contacto" className="so-btn so-btn--ghost">
                  Hablar con nosotros
                </Link>
              </div>
            </div>
            <div className="sh-enter sh-delay-2">
              <SolutionsOrbit />
            </div>
          </div>

          {/* In a nutshell */}
          <ul className="sh-stagger mt-16 grid gap-4 md:grid-cols-3">
            {solutions.map((solution) => {
              const Icon = icons[solution.id];
              return (
                <li key={solution.id} data-reveal>
                  <a href={`#${solution.id}`} className={`so-mini so-mini--${solution.id} group`}>
                    <span className="so-mini__icon">
                      <Icon className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-white">{solution.name}</span>
                      <span className="block text-sm text-slate-400">{solution.tagline}</span>
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Needs finder */}
        <section id="reto" aria-labelledby="reto-title" className="scroll-mt-20 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto mb-10 max-w-2xl text-center">
              <p className="so-kicker">¿Por dónde empiezo?</p>
              <h2 id="reto-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ¿Qué te frena hoy?
              </h2>
              <p className="mt-3 text-slate-400">
                Elige los retos que te suenan y te mostramos al momento qué solución encaja con tu negocio.
              </p>
            </div>
            <div data-reveal>
              <NeedsFinder />
            </div>
          </div>
        </section>

        {/* One chapter per service */}
        {solutions.map((solution, index) => {
          const Icon = icons[solution.id];
          const reversed = index % 2 === 1;
          return (
            <section
              key={solution.id}
              id={solution.id}
              aria-labelledby={`${solution.id}-title`}
              className={`so-chapter so-chapter--${solution.id} scroll-mt-20 py-20`}
            >
              <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div data-reveal className={reversed ? "lg:order-2" : undefined}>
                  <div className="flex items-center gap-3">
                    <span className="so-chapter__number">0{index + 1}</span>
                    <span className="so-chapter__icon">
                      <Icon className="size-6" />
                    </span>
                  </div>
                  <h2 id={`${solution.id}-title`} className="mt-5 text-4xl font-bold tracking-tight text-white">
                    {solution.name}
                  </h2>
                  <p className="so-chapter__tagline mt-2 text-xl font-semibold">{solution.tagline}</p>
                  <p className="mt-4 text-base leading-relaxed text-slate-300">{solution.summary}</p>
                  <p className="mt-4 text-sm text-slate-400">
                    <span className="font-semibold text-slate-200">Ideal para: </span>
                    {solution.audience}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/80">Antes</p>
                      <p className="mt-1.5 text-sm text-slate-400">{solution.before}</p>
                    </div>
                    <div className="so-after rounded-2xl p-4">
                      <p className="so-chapter__tagline text-xs font-semibold uppercase tracking-wide">Con {solution.name}</p>
                      <p className="mt-1.5 text-sm text-slate-200">{solution.after}</p>
                    </div>
                  </div>
                </div>
                <div data-reveal className={reversed ? "lg:order-1" : undefined}>
                  <SolutionVisual id={solution.id} />
                </div>
              </div>

              <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
                <ul className="sh-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {solution.features.map((feature) => (
                    <li key={feature.title} data-reveal className="so-feature rounded-2xl p-5">
                      <p className="flex items-center gap-2 font-semibold text-white">
                        <CheckCircleIcon className="so-chapter__tagline size-5 shrink-0" />
                        {feature.title}
                      </p>
                      <p className="mt-1.5 text-sm text-slate-400">{feature.text}</p>
                    </li>
                  ))}
                </ul>
                <div
                  data-reveal
                  className="so-availability mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
                >
                  <p className="text-sm text-slate-300">{solution.availability}</p>
                  <Link href={solution.cta.href} className="so-btn so-btn--accent shrink-0">
                    {solution.cta.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        {/* Better together */}
        <section aria-labelledby="juntos-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="so-kicker">Mejor juntos</p>
              <h2 id="juntos-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Del primer clic al proyecto entregado
              </h2>
              <p className="mt-3 text-slate-400">
                Cada servicio funciona solo, pero combinados cubren todo el recorrido de tu cliente.
              </p>
            </div>
            <ol className="so-flow sh-stagger mt-14 grid gap-6 md:grid-cols-3">
              {flow.map((item, index) => {
                const Icon = icons[item.id];
                const solution = solutions.find((s) => s.id === item.id)!;
                return (
                  <li key={item.id} data-reveal className={`so-flow__step so-flow__step--${item.id} text-center`}>
                    <span className="so-flow__node mx-auto">
                      <Icon className="size-7" />
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Paso {index + 1} · {solution.name}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">{item.step}</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">{item.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* How we work */}
        <section aria-labelledby="proceso-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-2xl">
              <p className="so-kicker">Cómo trabajamos</p>
              <h2 id="proceso-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Cuatro pasos, cero complicaciones
              </h2>
            </div>
            <ol className="sh-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal className="so-step rounded-2xl p-5">
                  <span className="so-step__number">{index + 1}</span>
                  <p className="mt-4 font-semibold text-white">{step.title}</p>
                  <p className="mt-1.5 text-sm text-slate-400">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 id="faq-title" data-reveal className="text-center text-3xl font-bold tracking-tight text-white">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 flex flex-col gap-3">
              {faqs.map((faq) => (
                <details key={faq.q} data-reveal className="so-faq group rounded-2xl px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60">
                    {faq.q}
                    <span aria-hidden="true" className="text-xl text-indigo-300 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6">
          <div data-reveal className="so-cta mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center sm:px-12">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Hablamos de tu proyecto?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Cuéntanos qué necesitas y te proponemos la combinación que más sentido tiene para tu negocio.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contacto" className="so-btn">
                Contactar
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link href="/register" className="so-btn so-btn--ghost">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <nav aria-label="Pie de página" className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <LogoIcon className="size-5 text-indigo-300" />
            SmartHub
          </Link>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li><Link href="/" className="hover:text-white">Inicio</Link></li>
            <li><Link href="/smartdesk" className="hover:text-white">SmartDesk</Link></li>
            <li><Link href="/smartai" className="hover:text-white">SmartAI</Link></li>
            <li><Link href="/smartweb" className="hover:text-white">SmartWeb</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
