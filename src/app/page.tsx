import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowRightIcon, CheckCircleIcon, ClockIcon, UsersIcon } from "./(app)/_components/icons";
import {
  BotIcon,
  ChartIcon,
  DeskIcon,
  GlobeIcon,
  LogoIcon,
  RocketIcon,
  ShieldCheckIcon,
  StarIcon,
} from "./_home/icons";
import { SMARTDESK_HREF, siteNavigation } from "./_home/navigation";
import { CountUp, RevealOnScroll } from "./_home/effects";
import { ParticleSphere } from "./_home/particle-sphere";
import { SiteHeader } from "./_home/site-header";

export const metadata: Metadata = {
  title: "SmartHub · Soluciones digitales para empresas",
  description:
    "Gestión empresarial, automatización e inteligencia artificial y desarrollo web en una única plataforma.",
};

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

/* Content of the website. Figures and testimonials are sample texts: replace them with real ones before publishing. */

const highlights: { icon: IconType; title: string; text: string; tone: string }[] = [
  { icon: ShieldCheckIcon, title: "Fácil de usar", text: "Sin complicaciones", tone: "text-emerald-400" },
  { icon: RocketIcon, title: "Escalable", text: "Crece con tu negocio", tone: "text-cyan-300" },
  { icon: ShieldCheckIcon, title: "Seguro", text: "Tus datos protegidos", tone: "text-blue-400" },
];

type Service = {
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: IconType;
  href: string;
  linkLabel: string;
  card: string;
  badge: string;
  check: string;
  preview: ReactNode;
};

const stats = [
  { icon: UsersIcon, value: "+500", label: "Empresas confían en nosotros" },
  { icon: ChartIcon, value: "+10.000", label: "Usuarios activos" },
  { icon: StarIcon, value: "99%", label: "Satisfacción de clientes" },
  { icon: ClockIcon, value: "24/7", label: "Soporte técnico" },
];

const testimonials = [
  {
    quote:
      "SmartDesk ha transformado la forma en que gestionamos nuestros proyectos. Ahora todo está organizado y nuestro equipo es más eficiente.",
    name: "Laura Martínez",
    role: "CEO, Acme S.L.",
  },
  {
    quote: "La automatización con SmartAI nos ha ahorrado horas de trabajo cada semana. Una herramienta imprescindible.",
    name: "Carlos Ruiz",
    role: "Director, TechCorp",
  },
  {
    quote:
      "El equipo de SmartHub nos desarrolló una web increíble que ha impulsado nuestro negocio. Profesionales y muy atentos.",
    name: "Miguel Torres",
    role: "Fundador, InnovaDigital",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

/** Decorative preview of the SmartDesk dashboard (not real data). */
function DashboardPreview() {
  const cards = [
    ["Clientes", "24", "+12%", "text-green-600"],
    ["Proyectos", "18", "+8%", "text-green-600"],
    ["Tareas", "56", "-2%", "text-red-600"],
    ["Eventos", "12", "+20%", "text-green-600"],
  ];
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-2xl shadow-blue-900/10">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <DeskIcon className="size-4 text-blue-600" />
          SmartDesk
        </span>
        <span className="flex items-center gap-2 text-[10px] text-ink-muted">
          <span className="grid size-6 place-items-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">RG</span>
          Raúl García
        </span>
      </div>
      <div className="flex">
        <div className="min-w-0 flex-1 p-3">
          <p className="mb-2 text-sm font-semibold text-ink">Dashboard</p>
          <div className="grid grid-cols-4 gap-2">
            {cards.map(([label, value, delta, tone]) => (
              <div key={label} className="rounded-lg border border-line p-2">
                <p className="truncate text-[9px] text-ink-muted">{label}</p>
                <p className="text-base font-bold text-ink">{value}</p>
                <p className={`text-[9px] ${tone}`}>{delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantPreview() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-line bg-surface p-3 text-left shadow-lg">
      <p className="flex items-center gap-2 text-xs font-semibold text-ink">
        <BotIcon className="size-5 text-violet-600" />
        Hola, soy tu asistente de IA
      </p>
      <p className="mb-2 ml-7 text-[10px] text-ink-muted">¿En qué puedo ayudarte hoy?</p>
      {["Generar un presupuesto", "Analizar datos del proyecto", "Resumir conversaciones"].map((text) => (
        <p key={text} className="mt-1 rounded-md bg-surface-muted px-2 py-1.5 text-[10px] text-ink-muted">
          {text}
        </p>
      ))}
    </div>
  );
}

function WebsitePreview() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-xl border border-line bg-surface text-left shadow-lg">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-[9px] text-ink-muted">
        <span className="font-semibold text-ink">Tu Empresa</span>
        <span>Inicio · Servicios · Contacto</span>
      </div>
      <div className="relative h-28 bg-gradient-to-r from-surface via-surface to-sky-200 p-3 dark:to-sky-900">
        <p className="text-sm font-bold leading-tight text-ink">
          Tu negocio
          <br />
          en el mundo digital
        </p>
        <span className="mt-2 inline-block rounded bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white">Empezar ahora</span>
        <span className="absolute bottom-0 right-4 h-20 w-16 rounded-t-md bg-gradient-to-b from-slate-300 to-slate-500 dark:from-slate-600 dark:to-slate-800" />
        <span className="absolute bottom-0 right-16 h-14 w-10 rounded-t-md bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900" />
      </div>
    </div>
  );
}

const services: Service[] = [
  {
    name: "SmartDesk",
    subtitle: "Gestión empresarial",
    description: "Organiza clientes, proyectos, tareas y equipos desde una única plataforma.",
    features: ["Clientes y proyectos", "Tareas y calendario", "Documentos y equipo", "Dashboard e informes", "Integración con IA"],
    icon: DeskIcon,
    href: SMARTDESK_HREF,
    linkLabel: "Abrir SmartDesk",
    card: "from-blue-50 to-surface dark:from-blue-950/40",
    badge: "bg-blue-600",
    check: "text-blue-600",
    preview: <DashboardPreview />,
  },
  {
    name: "SmartAI",
    subtitle: "Automatización e IA",
    description: "Automatiza procesos, genera documentos y aprovecha la inteligencia artificial para ahorrar tiempo y mejorar resultados.",
    features: [
      "Asistentes personalizados",
      "Generación de documentos",
      "Análisis de datos",
      "Automatización de tareas",
      "Integración con tus herramientas",
    ],
    icon: BotIcon,
    href: "#contacto",
    linkLabel: "Información sobre SmartAI",
    card: "from-violet-50 to-surface dark:from-violet-950/40",
    badge: "bg-violet-600",
    check: "text-violet-600",
    preview: <AssistantPreview />,
  },
  {
    name: "SmartWeb",
    subtitle: "Desarrollo digital",
    description: "Diseñamos y desarrollamos páginas web modernas, rápidas y adaptadas a las necesidades de tu negocio.",
    features: ["Páginas corporativas", "Tiendas online", "Landing pages", "Aplicaciones web", "Mantenimiento y soporte"],
    icon: GlobeIcon,
    href: "#contacto",
    linkLabel: "Información sobre SmartWeb",
    card: "from-green-50 to-surface dark:from-green-950/40",
    badge: "bg-green-600",
    check: "text-green-600",
    preview: <WebsitePreview />,
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-canvas font-sans text-ink">
      <SiteHeader />
      <RevealOnScroll />

      <main className="flex-1">
        {/* Hero */}
        <section
          id="inicio"
          className="relative scroll-mt-16 overflow-hidden bg-slate-950 text-white"
        >
          {/* Night sky: twinkling stars and slow blue glows behind the content. */}
          <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0" />
          <span aria-hidden="true" className="sh-blob pointer-events-none absolute -left-32 -top-32 size-[30rem] rounded-full bg-blue-700/25 blur-3xl" />
          <span aria-hidden="true" className="sh-blob pointer-events-none absolute -bottom-40 right-0 size-[32rem] rounded-full bg-cyan-500/10 blur-3xl [animation-delay:-7s]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20">
            <div>
              <div className="sh-enter">
                <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  Soluciones digitales para empresas
                </span>
              </div>
              <h1 className="sh-enter sh-delay-1 mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Todo lo que necesita tu empresa para{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">trabajar mejor.</span>
              </h1>
              <p className="sh-enter sh-delay-2 mt-5 max-w-xl text-lg text-slate-300">
                Gestión empresarial, automatización e inteligencia artificial en una única plataforma. Soluciones
                digitales diseñadas para hacer crecer tu negocio.
              </p>
              <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3">
                <Link href="/register" className={primaryButton}>
                  Empezar ahora
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href="#soluciones"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                  Ver soluciones
                </a>
              </div>
              <ul className="sh-enter sh-delay-3 mt-10 grid gap-5 sm:grid-cols-3">
                {highlights.map(({ icon: Icon, title, text, tone }) => (
                  <li key={title} className="flex items-start gap-3">
                    <Icon className={`size-7 shrink-0 ${tone}`} />
                    <span>
                      <span className="block text-sm font-semibold text-white">{title}</span>
                      <span className="text-xs text-slate-400">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sh-enter sh-delay-2">
              <ParticleSphere className="mx-auto aspect-square w-full max-w-sm sm:max-w-md lg:max-w-xl" />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="soluciones" aria-labelledby="soluciones-title" className="scroll-mt-16 bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel>Nuestras soluciones</SectionLabel>
              <h2 id="soluciones-title" className="mt-4 text-3xl font-bold tracking-tight text-ink">
                Servicios digitales para impulsar tu negocio
              </h2>
              <p className="mt-3 text-ink-muted">
                Herramientas y soluciones diseñadas para mejorar la productividad, automatizar procesos y llevar tu
                empresa al siguiente nivel.
              </p>
            </div>
            <ul className="sh-stagger mt-12 grid gap-6 lg:grid-cols-3">
              {services.map((service) => (
                <li
                  key={service.name}
                  data-reveal
                  className={`sh-lift group flex flex-col rounded-2xl border border-line bg-gradient-to-b p-6 ${service.card}`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`grid size-12 shrink-0 place-items-center rounded-full text-white ${service.badge}`}>
                      <service.icon className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-ink">{service.name}</h3>
                      <p className="text-sm text-ink-muted">{service.subtitle}</p>
                    </div>
                    <Link
                      href={service.href}
                      aria-label={service.linkLabel}
                      title={service.linkLabel}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-sm outline-none transition-transform group-hover:translate-x-1 group-hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </div>
                  <p className="mt-5 text-sm text-ink-muted">{service.description}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-ink">
                        <CheckCircleIcon className={`size-4 shrink-0 ${service.check}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex-1 content-end">{service.preview}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Figures */}
        <section aria-label="SmartHub en cifras" className="border-y border-line bg-canvas">
          <ul className="sh-stagger mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} data-reveal className="flex items-center gap-4">
                <Icon className="size-8 shrink-0 text-blue-600" />
                <span>
                  <CountUp value={value} className="block text-2xl font-bold text-ink" />
                  <span className="text-sm text-ink-muted">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Testimonials */}
        <section id="opiniones" aria-labelledby="opiniones-title" className="scroll-mt-16 bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div data-reveal className="text-center">
              <SectionLabel>Lo que dicen nuestros clientes</SectionLabel>
              <h2 id="opiniones-title" className="mt-4 text-3xl font-bold tracking-tight text-ink">
                Empresas que ya confían en SmartHub
              </h2>
            </div>
            <ul className="sh-stagger mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map(({ quote, name, role }) => (
                <li key={name} data-reveal className="sh-lift flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-sm">
                  <figure className="flex flex-1 flex-col">
                    <div className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {initials(name)}
                      </span>
                      <blockquote className="text-sm text-ink-muted">&ldquo;{quote}&rdquo;</blockquote>
                    </div>
                    <figcaption className="mt-5 flex items-end justify-between gap-3">
                      <span>
                        <span className="block text-sm font-semibold text-ink">{name}</span>
                        <span className="text-xs text-ink-muted">{role}</span>
                      </span>
                      <span role="img" aria-label="5 de 5 estrellas" className="flex text-amber-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <StarIcon key={i} className="size-4" />
                        ))}
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to action */}
        <section id="contacto" aria-labelledby="contacto-title" className="scroll-mt-16 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-blue-600/30 px-3 py-1 text-xs font-medium text-blue-200">
                ¿Listo para empezar?
              </span>
              <h2 id="contacto-title" className="mt-4 text-3xl font-bold tracking-tight">
                Lleva tu empresa al siguiente nivel
              </h2>
              <p className="mt-3 max-w-lg text-slate-300">
                Únete a cientos de empresas que ya confían en SmartHub y descubre todo lo que podemos hacer por ti.
              </p>
              <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3">
                <Link href="/register" className={primaryButton}>
                  Empezar ahora
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href="mailto:contacto@smarthub.example"
                  className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                  Contactar con ventas
                </a>
              </div>
            </div>
            <div aria-hidden="true" data-reveal className="mx-auto w-full max-w-md">
              <div className="rounded-t-2xl border-4 border-slate-700 bg-gradient-to-br from-slate-900 to-blue-950 p-10 text-center">
                <LogoIcon className="mx-auto size-12 text-blue-400" />
                <p className="mt-3 text-2xl font-bold">SmartHub</p>
                <p className="mt-1 text-sm text-blue-200">Soluciones digitales para un futuro mejor</p>
              </div>
              <div className="mx-auto h-3 w-[110%] -translate-x-[4.5%] rounded-b-xl bg-slate-700" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <LogoIcon className="size-6 text-blue-400" />
            SmartHub
          </Link>
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {siteNavigation
                .filter((entry) => entry.label !== "Inicio")
                .map((entry) => (
                  <li key={entry.label}>
                    {entry.href ? (
                      <a href={entry.href} className="hover:text-white">
                        {entry.label}
                      </a>
                    ) : entry.items?.[0]?.href ? (
                      <Link href={entry.items[0].href} className="hover:text-white">
                        {entry.label}
                      </Link>
                    ) : (
                      <span className="opacity-70">{entry.label}</span>
                    )}
                  </li>
                ))}
            </ul>
          </nav>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} SmartHub. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}