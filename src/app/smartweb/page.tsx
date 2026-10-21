import type { Metadata } from "next";
import Link from "next/link";
import { formatEuros, projectTypes } from "@/lib/smartweb";
import { ArrowRightIcon, CheckCircleIcon } from "../smartdesk/(app)/_components/icons";
import { RevealOnScroll } from "../_home/effects";
import { BotIcon as HubBotIcon, DeskIcon, LogoIcon } from "../_home/icons";
import { SiteHeader } from "../_home/site-header";
import {
  BoltIcon,
  ChartIcon,
  GaugeIcon,
  LayersIcon,
  LockIcon,
  PenIcon,
  SearchIcon,
  SmartphoneIcon,
  StarIcon,
  WandIcon,
} from "./icons";
import { SmartWebStudio } from "./studio";
import "./smartweb.css";

export const metadata: Metadata = {
  title: "SmartWeb · Webs y tiendas online que traen clientes · SmartHub",
  description:
    "Diseña tu web en SmartWeb Studio y mírala construirse en directo: landing, web corporativa, reservas o tienda online, con presupuesto al momento y propuesta de diseño en 72 horas.",
};

const heroChips = [
  { text: "Reserva confirmada · 19:30", icon: CheckCircleIcon },
  { text: "Nº 1 en Google Maps", icon: SearchIcon },
  { text: "4,9 · 128 reseñas", icon: StarIcon },
];

const included = [
  { icon: SmartphoneIcon, title: "Perfecta en el móvil", text: "Diseñada primero para el móvil, donde están tus clientes." },
  { icon: BoltIcon, title: "Rápida de verdad", text: "Optimizada para cargar en un instante y no perder visitas." },
  { icon: LockIcon, title: "Segura y legal", text: "Certificado SSL, aviso legal, cookies y privacidad (RGPD)." },
  { icon: SearchIcon, title: "Lista para Google", text: "Estructura, títulos y velocidad pensados para buscadores." },
  { icon: ChartIcon, title: "Mide lo que importa", text: "Visitas, llamadas y mensajes que llegan desde tu web." },
  { icon: PenIcon, title: "Tú la editas", text: "Te enseñamos a cambiar textos, fotos y precios sin depender de nadie." },
];

const workflow = [
  { icon: WandIcon, title: "Configúrala", text: "En SmartWeb Studio, en cinco minutos. Ya sabes cuánto cuesta." },
  { icon: LayersIcon, title: "Propuesta en 72 h", text: "Te enseñamos el diseño de tu portada con tus textos y colores." },
  { icon: GaugeIcon, title: "La construimos", text: "Con revisiones contigo en cada fase, sin tecnicismos." },
  { icon: BoltIcon, title: "Lanzamiento", text: "Publicada, en Google y midiendo resultados desde el día uno." },
];

const faqs = [
  {
    q: "¿El precio del configurador es el definitivo?",
    a: "Es un precio orientativo muy cercano al real. Antes de empezar te enviamos una propuesta cerrada por escrito, y no pagas nada hasta aceptarla.",
  },
  {
    q: "¿De quién es la web y el dominio?",
    a: "Tuyos. El dominio se registra a tu nombre y, si un día quieres irte, te entregamos la web completa.",
  },
  {
    q: "¿Puedo cambiar textos y fotos yo mismo?",
    a: "Sí. Te dejamos un panel sencillo y una formación corta. Si prefieres no tocar nada, el plan Crecimiento incluye 2 horas de cambios al mes.",
  },
  {
    q: "¿Qué pasa con mi web actual?",
    a: "La revisamos, aprovechamos los contenidos que funcionan y hacemos la migración sin perder tu posición en Google ni tu correo.",
  },
  {
    q: "¿Cómo se paga?",
    a: "Un 40 % para empezar y el resto en la entrega. El mantenimiento es mensual y sin permanencia.",
  },
];

/** Hero illustration: a website assembling itself, with its results floating around. */
function HeroVisual() {
  return (
    <div className="sw-build mx-auto w-full max-w-[34rem]" aria-hidden="true">
      <div className="sw-build__glow" />
      <div className="sw-build__browser">
        <div className="sw-build__bar">
          <i />
          <i />
          <i />
        </div>
        <div className="sw-build__body">
          <span className="sw-block sw-block--nav" />
          <span className="sw-block sw-block--hero" />
          <span className="sw-block sw-block--row">
            <span />
            <span />
            <span />
          </span>
          <span className="sw-block sw-block--cta" />
        </div>
      </div>
      <div className="sw-build__phone">
        <span />
        <span />
        <span />
        <span />
      </div>
      {heroChips.map((chip, i) => (
        <span key={chip.text} className={`sw-chip-float sw-chip-float--${i + 1}`}>
          <chip.icon className="size-3.5 text-emerald-300" />
          {chip.text}
        </span>
      ))}
    </div>
  );
}

/** SmartWeb: product page with the live SmartWeb Studio configurator. */
export default function SmartWebPage() {
  const cheapest = Math.min(...projectTypes.map((type) => type.price));

  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-x-clip bg-[#020a08] font-sans text-slate-100">
      <div className="sw-bg" aria-hidden="true">
        <div className="sh-stars absolute inset-0 opacity-40" />
        <div className="sw-grid" />
        <div className="sw-aurora sw-aurora--a" />
        <div className="sw-aurora sw-aurora--b" />
        <div className="sw-aurora sw-aurora--c" />
      </div>
      <SiteHeader />
      <RevealOnScroll />

      <main className="flex-1">
        {/* Hero */}
        <section aria-labelledby="smartweb-title" className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
          <Link
            href="/soluciones#smartweb"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-300 outline-none transition-colors hover:border-emerald-400/40 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            <span aria-hidden="true">←</span>
            Todas las soluciones
          </Link>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="sh-enter">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-200">
                <span className="sw-pulse" aria-hidden="true" />
                SmartWeb · Webs y tiendas online
              </p>
              <h1 id="smartweb-title" className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
                Diseña tu web y <span className="sw-gradient-text">mírala nacer en directo.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Elige tu sector, las funciones y el estilo. SmartWeb Studio te enseña cómo quedará, cuánto cuesta y
                cuándo estará lista. Sin llamadas, sin esperas y sin letra pequeña.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#estudio" className="sw-btn sw-btn--lg">
                  <WandIcon className="size-4" />
                  Diseñar mi web gratis
                </a>
                <a href="#planes" className="sw-btn sw-btn--ghost sw-btn--lg">
                  Ver precios
                </a>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-slate-400">Webs desde</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{formatEuros(cheapest)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Propuesta de diseño</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">72 h</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Precio</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">Cerrado</dd>
                </div>
              </dl>
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
              <p className="sw-kicker">Pruébalo aquí mismo</p>
              <h2 id="estudio-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                SmartWeb Studio
              </h2>
              <p className="mt-3 text-slate-400">
                Cada cambio se ve al instante en la vista previa, en ordenador y en móvil. Cuando te guste, envíanoslo
                y te preparamos la propuesta de diseño.
              </p>
            </div>
            <div data-reveal>
              <SmartWebStudio />
            </div>
          </div>
        </section>

        {/* Always included */}
        <section aria-labelledby="incluido-title" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-2xl">
              <p className="sw-kicker">Siempre incluido</p>
              <h2 id="incluido-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Lo que toda web de SmartWeb trae de serie
              </h2>
            </div>
            <ul className="sh-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <li key={item.title} data-reveal className="sw-card rounded-2xl p-5">
                  <span className="sw-card__icon">
                    <item.icon className="size-5" />
                  </span>
                  <p className="mt-4 font-semibold text-white">{item.title}</p>
                  <p className="mt-1.5 text-sm text-slate-400">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section aria-labelledby="proceso-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="sw-kicker">Cómo trabajamos</p>
              <h2 id="proceso-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                De la idea a tu web publicada
              </h2>
            </div>
            <ol className="sw-steps-line sh-stagger mt-14 grid gap-8 md:grid-cols-4">
              {workflow.map((step, index) => (
                <li key={step.title} data-reveal className="text-center">
                  <span className="sw-node mx-auto">
                    <step.icon className="size-6" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Paso {index + 1}</p>
                  <p className="mt-1 text-lg font-bold text-white">{step.title}</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Plans */}
        <section id="planes" aria-labelledby="planes-title" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="sw-kicker">Precios claros</p>
              <h2 id="planes-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Elige tu punto de partida
              </h2>
              <p className="mt-3 text-slate-400">Precios sin IVA. Diseño a medida, hosting y dominio el primer año incluidos.</p>
            </div>
            <ul className="sh-stagger mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {projectTypes.map((type) => {
                const featured = type.id === "reservas";
                return (
                  <li key={type.id} data-reveal className={`sw-plan flex flex-col rounded-3xl p-6 ${featured ? "sw-plan--featured" : ""}`}>
                    {featured && (
                      <span className="mb-4 w-fit rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                        La más pedida
                      </span>
                    )}
                    <p className="text-lg font-bold text-white">{type.name}</p>
                    <p className="mt-1 text-sm text-slate-400">desde</p>
                    <p className="text-3xl font-bold text-emerald-200">{formatEuros(type.price)}</p>
                    <p className="mt-3 flex-1 text-sm text-slate-400">{type.description}</p>
                    <ul className="mt-5 flex flex-col gap-2 text-sm text-slate-200">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        {type.pagesIncluded === 1 ? "1 página" : `Hasta ${type.pagesIncluded} páginas`}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        Lista en {type.weeks} {type.weeks === 1 ? "semana" : "semanas"}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        {type.idealFor}
                      </li>
                    </ul>
                    <a href={`?tipo=${type.id}#estudio`} className={`sw-btn mt-6 justify-center ${featured ? "" : "sw-btn--ghost"}`}>
                      Configurar
                      <ArrowRightIcon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Ecosystem */}
        <section aria-labelledby="ecosistema-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="sw-kicker">Más que una web</p>
              <h2 id="ecosistema-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Tu web, conectada con el resto de SmartHub
              </h2>
              <p className="mt-3 text-slate-400">La web atrae al cliente; SmartDesk y SmartAI hacen que no se pierda ninguno.</p>
            </div>
            <ul className="sh-stagger mt-10 grid gap-4 md:grid-cols-2">
              <li data-reveal className="sw-card flex gap-4 rounded-2xl p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white">
                  <DeskIcon className="size-6" />
                </span>
                <div>
                  <p className="font-semibold text-white">Contactos directos a SmartDesk</p>
                  <p className="mt-1.5 text-sm text-slate-400">
                    Cada formulario o reserva crea el cliente en SmartDesk, listo para seguirlo con tareas y calendario.
                  </p>
                  <Link href="/smartdesk" className="sw-link -ml-3 mt-2 inline-flex items-center gap-1.5">
                    Conocer SmartDesk <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </li>
              <li data-reveal className="sw-card flex gap-4 rounded-2xl p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white">
                  <HubBotIcon className="size-6" />
                </span>
                <div>
                  <p className="font-semibold text-white">Un asistente SmartAI en tu web</p>
                  <p className="mt-1.5 text-sm text-slate-400">
                    Responde dudas, recomienda servicios y recoge contactos las 24 horas, con el tono de tu negocio.
                  </p>
                  <Link href="/smartai" className="sw-link -ml-3 mt-2 inline-flex items-center gap-1.5">
                    Probar SmartAI <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </li>
            </ul>
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
                <details key={faq.q} data-reveal className="sw-faq group rounded-2xl px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
                    {faq.q}
                    <span aria-hidden="true" className="text-xl text-emerald-300 transition-transform group-open:rotate-45">
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
          <div data-reveal className="sw-cta mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center sm:px-12">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tu próxima web empieza con un clic
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Configúrala ahora y en 72 horas tienes la propuesta de diseño. Si no te convence, no pagas nada.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#estudio" className="sw-btn sw-btn--lg">
                <WandIcon className="size-4" />
                Diseñar mi web
              </a>
              <Link href="/contacto" className="sw-btn sw-btn--ghost sw-btn--lg">
                Hablar con nosotros
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <nav aria-label="Pie de página" className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <LogoIcon className="size-5 text-emerald-300" />
            SmartHub
          </Link>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li><Link href="/" className="hover:text-white">Inicio</Link></li>
            <li><Link href="/soluciones" className="hover:text-white">Soluciones</Link></li>
            <li><Link href="/smartdesk" className="hover:text-white">SmartDesk</Link></li>
            <li><Link href="/smartai" className="hover:text-white">SmartAI</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
