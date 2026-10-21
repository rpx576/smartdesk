import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { assistants } from "@/lib/smartai";
import { smartAiService } from "@/server/services/smartai.service";
import { ArrowRightIcon, CheckCircleIcon } from "../smartdesk/(app)/_components/icons";
import { RevealOnScroll } from "../_home/effects";
import { LogoIcon } from "../_home/icons";
import { SiteHeader } from "../_home/site-header";
import { assistantIcons, BuildingIcon, ClockIcon, PlugIcon, ShieldIcon, SparklesIcon } from "./icons";
import { SmartAiStudio } from "./studio";
import "./smartai.css";

export const metadata: Metadata = {
  title: "SmartAI · Asistente de IA para tu negocio · SmartHub",
  description:
    "Presupuestos, respuestas a clientes, resúmenes con tareas, publicaciones para redes y respuestas a reseñas en segundos. Prueba SmartAI gratis, sin registrarte.",
};

const heroChips = [
  { text: "Presupuesto listo · 2.178 €", tone: "violet" },
  { text: "3 tareas creadas", tone: "sky" },
  { text: "Respuesta enviada por WhatsApp", tone: "emerald" },
  { text: "Reseña respondida ★★★★★", tone: "amber" },
] as const;

const steps = [
  {
    icon: BuildingIcon,
    title: "Cuéntale cómo es tu negocio",
    text: "Nombre, sector y cómo habláis con vuestros clientes. SmartAI escribe como lo haríais vosotros.",
  },
  {
    icon: SparklesIcon,
    title: "Elige un asistente",
    text: "Rellena dos o tres datos, o pega el mensaje que te han enviado. Nada de instrucciones complicadas.",
  },
  {
    icon: CheckCircleIcon,
    title: "Revisa y envía",
    text: "Copia, descarga o envía por WhatsApp. Tú decides siempre qué sale y qué no.",
  },
];

const sectors = [
  { name: "Talleres", example: "Presupuestos de reparación y avisos de recogida del coche." },
  { name: "Clínicas", example: "Respuestas a pacientes y reseñas de Google con tacto." },
  { name: "Reformas", example: "Presupuestos desglosados por partidas con IVA calculado." },
  { name: "Comercio", example: "Publicaciones de ofertas para Instagram y Google Business." },
  { name: "Asesorías", example: "Resúmenes de reuniones con tareas y fechas para el equipo." },
  { name: "Hostelería", example: "Contestar reservas, quejas y reseñas en minutos." },
];

const plans = [
  {
    name: "Prueba",
    price: "Gratis",
    text: "El SmartAI Studio de esta página, para que veas lo que puede hacer por ti.",
    features: ["5 asistentes listos", "Personalizado con tu negocio", "Sin registro"],
    cta: { label: "Probar ahora", href: "#estudio" },
  },
  {
    name: "Equipo",
    price: "Plan mensual",
    text: "SmartAI dentro de tu día a día, con tu marca, tu tono y tus plantillas.",
    features: ["Asistentes con tus precios y servicios", "Historial y plantillas del equipo", "Conectado con SmartDesk"],
    cta: { label: "Pedir información", href: "/contacto" },
    featured: true,
  },
  {
    name: "A medida",
    price: "Proyecto",
    text: "Automatizaciones y asistentes conectados con tus herramientas y documentos.",
    features: ["Asistente con tus documentos", "WhatsApp, correo y formularios", "Integración con tu software"],
    cta: { label: "Hablar con nosotros", href: "/contacto" },
  },
];

const faqs = [
  {
    q: "¿Necesito saber de inteligencia artificial?",
    a: "No. Cada asistente pide solo los datos necesarios y devuelve el texto listo para usar. Si sabes escribir un WhatsApp, sabes usar SmartAI.",
  },
  {
    q: "¿Qué pasa con los datos que escribo?",
    a: "Se usan solo para generar tu respuesta: SmartAI no los guarda en ninguna base de datos. El perfil de tu negocio se queda en tu navegador. No escribas datos sensibles de terceros que no necesites.",
  },
  {
    q: "¿Qué IA hay detrás?",
    a: "SmartAI usa modelos de Claude, de Anthropic, con instrucciones preparadas para pymes españolas: euros, IVA, tono local y textos listos para enviar.",
  },
  {
    q: "¿Puedo usarlo con mis precios y mis servicios?",
    a: "Sí. En los planes Equipo y A medida configuramos SmartAI con tu catálogo, tus condiciones y tus plantillas para que cada presupuesto salga ya con tus datos reales.",
  },
  {
    q: "¿Se conecta con SmartDesk?",
    a: "Ese es el siguiente paso: las tareas de un resumen se convierten en tareas de SmartDesk y los presupuestos quedan en la ficha del cliente. Si te interesa, cuéntanoslo.",
  },
];

/** Hero illustration: a glowing AI core with finished work floating around it. */
function HeroVisual() {
  return (
    <div className="ai-hero-visual mx-auto w-full max-w-[28rem]" aria-hidden="true">
      <div className="ai-hero-visual__glow" />
      <div className="ai-hero-visual__ring ai-hero-visual__ring--1" />
      <div className="ai-hero-visual__ring ai-hero-visual__ring--2" />
      <div className="ai-core">
        <SparklesIcon className="size-10 text-white" />
        <span className="mt-1 text-xs font-bold tracking-wide text-white">SmartAI</span>
      </div>
      {heroChips.map((chip, i) => (
        <span key={chip.text} className={`ai-float ai-float--${i + 1} ai-float--${chip.tone}`}>
          <CheckCircleIcon className="size-4 shrink-0" />
          {chip.text}
        </span>
      ))}
    </div>
  );
}

/** SmartAI: product page with the live SmartAI Studio. */
export default async function SmartAiPage() {
  // The mode (AI or demo) depends on the server configuration at request time.
  await connection();
  const mode = smartAiService.mode();
  const totalMinutes = assistants.reduce((sum, a) => sum + a.minutesSaved, 0);

  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-x-clip bg-[#07041a] font-sans text-slate-100">
      <div className="ai-bg" aria-hidden="true">
        <div className="sh-stars absolute inset-0 opacity-50" />
        <div className="ai-grid" />
        <div className="ai-aurora ai-aurora--a" />
        <div className="ai-aurora ai-aurora--b" />
      </div>
      <SiteHeader />
      <RevealOnScroll />

      <main className="flex-1">
        {/* Hero */}
        <section aria-labelledby="smartai-title" className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
          <Link
            href="/soluciones#smartai"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-300 outline-none transition-colors hover:border-violet-400/40 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-400/60"
          >
            <span aria-hidden="true">←</span>
            Todas las soluciones
          </Link>
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div className="sh-enter">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3.5 py-1.5 text-xs font-semibold text-violet-200">
                <span className="ai-pulse" aria-hidden="true" />
                SmartAI · Inteligencia artificial para pymes
              </p>
              <h1 id="smartai-title" className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
                El compañero que hace <span className="ai-gradient-text">el papeleo por ti.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Presupuestos, respuestas a clientes, resúmenes con tareas, publicaciones y reseñas. Escritos en
                segundos, con el tono de tu negocio y listos para enviar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#estudio" className="ai-btn ai-btn--lg">
                  <SparklesIcon className="size-4" />
                  Probar gratis ahora
                </a>
                <Link href="/contacto" className="ai-btn ai-btn--ghost ai-btn--lg">
                  Quiero SmartAI en mi empresa
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-slate-400">Asistentes listos</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{assistants.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Minutos ahorrados*</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">~{totalMinutes}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Sin registro</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">0 €</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] text-slate-500">* Estimación al usar una vez cada asistente frente a hacerlo a mano.</p>
            </div>
            <div className="sh-enter sh-delay-2">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* Studio */}
        <section id="estudio" aria-labelledby="estudio-title" className="scroll-mt-20 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto mb-8 max-w-2xl text-center">
              <p className="ai-kicker">Pruébalo aquí mismo</p>
              <h2 id="estudio-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                SmartAI Studio
              </h2>
              <p className="mt-3 text-slate-400">
                Elige un asistente, pulsa <strong className="text-slate-200">Probar con un ejemplo</strong> y mira cómo
                trabaja. Después, hazlo con un caso real de tu negocio.
              </p>
            </div>
            <div data-reveal>
              <SmartAiStudio mode={mode} />
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldIcon className="size-4 text-violet-300" />
                No guardamos lo que escribes
              </li>
              <li className="flex items-center gap-1.5">
                <ClockIcon className="size-4 text-violet-300" />
                Respuestas en segundos
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="size-4 text-violet-300" />
                Español de España, euros e IVA
              </li>
            </ul>
          </div>
        </section>

        {/* Assistants */}
        <section aria-labelledby="asistentes-title" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-2xl">
              <p className="ai-kicker">Cinco asistentes</p>
              <h2 id="asistentes-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Las tareas que más tiempo os roban, resueltas
              </h2>
            </div>
            <ul className="sh-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {assistants.map((assistant) => {
                const Icon = assistantIcons[assistant.id];
                return (
                  <li key={assistant.id} data-reveal className="ai-card flex flex-col rounded-2xl p-5">
                    <span className="ai-card__icon">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-semibold text-white">{assistant.name}</p>
                    <p className="mt-1.5 flex-1 text-sm text-slate-400">{assistant.tagline}</p>
                    <p className="mt-4 text-xs font-semibold text-violet-300">Ahorra ~{assistant.minutesSaved} min cada vez</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="como-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="ai-kicker">Cómo funciona</p>
              <h2 id="como-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                De la idea al texto enviado en tres pasos
              </h2>
            </div>
            <ol className="ai-steps sh-stagger mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} data-reveal className="ai-step text-center">
                    <span className="ai-step__node mx-auto">
                      <Icon className="size-7" />
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Paso {index + 1}</p>
                    <p className="mt-1 text-xl font-bold text-white">{step.title}</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Sectors */}
        <section aria-labelledby="sectores-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-2xl">
              <p className="ai-kicker">Para tu sector</p>
              <h2 id="sectores-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Pensado para el día a día de una pyme
              </h2>
            </div>
            <ul className="sh-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectors.map((sector) => (
                <li key={sector.name} data-reveal className="ai-sector rounded-2xl p-5">
                  <p className="font-semibold text-white">{sector.name}</p>
                  <p className="mt-1.5 text-sm text-slate-400">{sector.example}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Plans */}
        <section id="planes" aria-labelledby="planes-title" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="ai-kicker">Llévalo a tu empresa</p>
              <h2 id="planes-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Empieza gratis, crece cuando lo necesites
              </h2>
              <p className="mt-3 text-slate-400">Te enviamos una propuesta cerrada, sin permanencia ni sorpresas.</p>
            </div>
            <ul className="sh-stagger mt-12 grid gap-5 md:grid-cols-3">
              {plans.map((plan) => (
                <li
                  key={plan.name}
                  data-reveal
                  className={`ai-plan flex flex-col rounded-3xl p-6 ${plan.featured ? "ai-plan--featured" : ""}`}
                >
                  {plan.featured && (
                    <span className="mb-4 w-fit rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                      Recomendado
                    </span>
                  )}
                  <p className="text-lg font-bold text-white">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold text-violet-200">{plan.price}</p>
                  <p className="mt-3 text-sm text-slate-400">{plan.text}</p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-violet-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.cta.href} className={`ai-btn mt-6 justify-center ${plan.featured ? "" : "ai-btn--ghost"}`}>
                    {plan.cta.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
            <p data-reveal className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-slate-400">
              <PlugIcon className="mt-0.5 size-4 shrink-0 text-violet-300" />
              Combínalo con SmartDesk: los resúmenes se convierten en tareas y los presupuestos quedan en la ficha del
              cliente.
            </p>
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
                <details key={faq.q} data-reveal className="ai-faq group rounded-2xl px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60">
                    {faq.q}
                    <span aria-hidden="true" className="text-xl text-violet-300 transition-transform group-open:rotate-45">
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
          <div data-reveal className="ai-cta mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center sm:px-12">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Cuántas horas le devolvemos a tu equipo?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Cuéntanos qué tareas se repiten en tu negocio y te proponemos qué automatizar primero con SmartAI.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contacto" className="ai-btn ai-btn--lg">
                Hablar con nosotros
                <ArrowRightIcon className="size-4" />
              </Link>
              <a href="#estudio" className="ai-btn ai-btn--ghost ai-btn--lg">
                Volver a probar
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <nav aria-label="Pie de página" className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <LogoIcon className="size-5 text-violet-300" />
            SmartHub
          </Link>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li><Link href="/" className="hover:text-white">Inicio</Link></li>
            <li><Link href="/soluciones" className="hover:text-white">Soluciones</Link></li>
            <li><Link href="/smartdesk" className="hover:text-white">SmartDesk</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
