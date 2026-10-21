import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { getDictionary, localizeHref, type Dictionary, type Locale } from "@/i18n";
import { ArrowRightIcon, CheckCircleIcon, UsersIcon } from "../smartdesk/(app)/_components/icons";
import { RevealOnScroll } from "./effects";
import { BotIcon, ChartIcon, DeskIcon, GlobeIcon, LogoIcon, RocketIcon, ShieldCheckIcon } from "./icons";
import { ChaosToOrder, EcosystemHub } from "./idea-visuals";
import { SMARTAI_HREF, SMARTDESK_HREF, SMARTWEB_HREF, getNavigation } from "./navigation";
import { ParticleSphere } from "./particle-sphere";
import { SiteHeader } from "./site-header";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

/*
 * Look of the content blocks (icons, colours, links). The words of every
 * block come from the dictionary of the language (src/i18n/dictionaries),
 * in the same order as these lists. Previews are decorative: they never show real data.
 */

const highlightStyles: { icon: IconType; tone: string }[] = [
  { icon: ShieldCheckIcon, tone: "text-emerald-400" },
  { icon: RocketIcon, tone: "text-cyan-300" },
  { icon: ShieldCheckIcon, tone: "text-blue-400" },
];

const valueStyles: { icon: IconType; wide?: boolean }[] = [
  { icon: RocketIcon, wide: true },
  { icon: UsersIcon },
  { icon: ShieldCheckIcon },
  { icon: BotIcon },
  { icon: ChartIcon, wide: true },
];

/** Decorative preview of the SmartDesk dashboard (not real data). */
function DashboardPreview({ copy }: { copy: Dictionary["home"]["previews"]["dashboard"] }) {
  const figures = [
    ["24", "+12%", "text-green-600"],
    ["18", "+8%", "text-green-600"],
    ["56", "-2%", "text-red-600"],
    ["12", "+20%", "text-green-600"],
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
          <p className="mb-2 text-sm font-semibold text-ink">{copy.title}</p>
          <div className="grid grid-cols-4 gap-2">
            {figures.map(([value, delta, tone], index) => (
              <div key={copy.cards[index]} className="rounded-lg border border-line p-2">
                <p className="truncate text-[9px] text-ink-muted">{copy.cards[index]}</p>
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

function AssistantPreview({ copy }: { copy: Dictionary["home"]["previews"]["assistant"] }) {
  return (
    <div aria-hidden="true" className="rounded-xl border border-line bg-surface p-3 text-left shadow-lg">
      <p className="flex items-center gap-2 text-xs font-semibold text-ink">
        <BotIcon className="size-5 text-violet-600" />
        {copy.greeting}
      </p>
      <p className="mb-2 ml-7 text-[10px] text-ink-muted">{copy.question}</p>
      {copy.chips.map((text) => (
        <p key={text} className="mt-1 rounded-md bg-surface-muted px-2 py-1.5 text-[10px] text-ink-muted">
          {text}
        </p>
      ))}
    </div>
  );
}

function WebsitePreview({ copy }: { copy: Dictionary["home"]["previews"]["website"] }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-xl border border-line bg-surface text-left shadow-lg">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-[9px] text-ink-muted">
        <span className="font-semibold text-ink">{copy.brand}</span>
        <span>{copy.menu}</span>
      </div>
      <div className="relative h-28 bg-gradient-to-r from-surface via-surface to-sky-200 p-3 dark:to-sky-900">
        <p className="text-sm font-bold leading-tight text-ink">
          {copy.headline[0]}
          <br />
          {copy.headline[1]}
        </p>
        <span className="mt-2 inline-block rounded bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white">{copy.button}</span>
        <span className="absolute bottom-0 right-4 h-20 w-16 rounded-t-md bg-gradient-to-b from-slate-300 to-slate-500 dark:from-slate-600 dark:to-slate-800" />
        <span className="absolute bottom-0 right-16 h-14 w-10 rounded-t-md bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900" />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
      {children}
    </span>
  );
}

/** Home page of SmartHub in a language (Spanish at `/`, English at `/en`). */
export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.home;
  const navigation = getNavigation(locale);

  const services = [
    {
      name: dict.nav.smartdesk.label,
      icon: DeskIcon,
      href: SMARTDESK_HREF,
      card: "from-blue-50 to-surface dark:from-blue-950/40",
      badge: "bg-blue-600",
      check: "text-blue-600",
      preview: <DashboardPreview copy={t.previews.dashboard} />,
    },
    {
      name: dict.nav.smartai.label,
      icon: BotIcon,
      href: SMARTAI_HREF,
      card: "from-violet-50 to-surface dark:from-violet-950/40",
      badge: "bg-violet-600",
      check: "text-violet-600",
      preview: <AssistantPreview copy={t.previews.assistant} />,
    },
    {
      name: dict.nav.smartweb.label,
      icon: GlobeIcon,
      href: SMARTWEB_HREF,
      card: "from-green-50 to-surface dark:from-green-950/40",
      badge: "bg-green-600",
      check: "text-green-600",
      preview: <WebsitePreview copy={t.previews.website} />,
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-canvas font-sans text-ink">
      <SiteHeader locale={locale} />
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
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
            <div className="relative z-10">
              <div className="sh-enter">
                <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  {t.hero.badge}
                </span>
              </div>
              <h1 className="sh-enter sh-delay-1 mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {t.hero.titleStart}{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{t.hero.titleEmphasis}</span>
              </h1>
              <p className="sh-enter sh-delay-2 mt-5 max-w-xl text-lg text-slate-300">{t.hero.text}</p>
              <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3 max-sm:[&>*]:min-h-12 max-sm:[&>*]:flex-1">
                <Link href="/register" className={primaryButton}>
                  {t.hero.primary}
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href="#soluciones"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t.hero.secondary}
                </a>
              </div>
              <ul className="sh-enter sh-delay-3 mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-5">
                {t.hero.highlights.map(({ title, text }, index) => {
                  const { icon: Icon, tone } = highlightStyles[index];
                  return (
                    <li key={title} className="flex flex-col items-start gap-2 sm:flex-row sm:gap-3">
                      <Icon className={`size-7 shrink-0 ${tone}`} />
                      <span>
                        <span className="block text-sm font-semibold text-white">{title}</span>
                        <span className="text-xs text-slate-400">{text}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Phones: only the top of the sphere rises from the bottom of the hero, fading out, so the text stays clean. */}
            <div className="sh-enter sh-delay-2 max-lg:-mb-6 max-lg:h-52 max-lg:overflow-hidden max-lg:[mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
              <ParticleSphere className="mx-auto aspect-square w-full max-w-sm max-lg:w-[22rem] max-lg:max-w-none sm:max-w-md lg:max-w-xl" />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="soluciones" aria-labelledby="soluciones-title" className="scroll-mt-16 bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel>{t.services.label}</SectionLabel>
              <h2 id="soluciones-title" className="mt-4 text-3xl font-bold tracking-tight text-ink">
                {t.services.title}
              </h2>
              <p className="mt-3 text-ink-muted">{t.services.text}</p>
            </div>
            <ul className="sh-stagger mt-10 grid gap-6 max-md:-mx-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:px-4 max-md:pb-4 max-md:[scrollbar-width:none] sm:mt-12 lg:grid-cols-3">
              {services.map((service, index) => {
                const copy = t.services.items[index];
                return (
                  <li
                    key={service.name}
                    data-reveal
                    className={`sh-lift group flex flex-col rounded-2xl border border-line bg-gradient-to-b p-6 max-md:w-[84%] max-md:shrink-0 max-md:snap-center ${service.card}`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`grid size-12 shrink-0 place-items-center rounded-full text-white ${service.badge}`}>
                        <service.icon className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-ink">{service.name}</h3>
                        <p className="text-sm text-ink-muted">{copy.subtitle}</p>
                      </div>
                      <Link
                        href={service.href}
                        aria-label={copy.linkLabel}
                        title={copy.linkLabel}
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-sm outline-none transition-transform group-hover:translate-x-1 group-hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <ArrowRightIcon className="size-4" />
                      </Link>
                    </div>
                    <p className="mt-5 text-sm text-ink-muted">{copy.description}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {copy.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-ink">
                          <CheckCircleIcon className={`size-4 shrink-0 ${service.check}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex-1 content-end">{service.preview}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* The idea: from scattered tools to one place */}
        <section id="idea" aria-labelledby="idea-title" className="scroll-mt-16 bg-canvas py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div data-reveal>
              <SectionLabel>{t.idea.label}</SectionLabel>
              <h2 id="idea-title" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t.idea.titleStart}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{t.idea.titleEmphasis}</span>
              </h2>
              <p className="mt-5 text-lg text-ink-muted">{t.idea.p1}</p>
              <p className="mt-4 text-ink-muted">{t.idea.p2}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {t.idea.points.map(({ title, text }) => (
                  <li key={title} className="border-l-2 border-blue-600 pl-3">
                    <span className="block text-sm font-semibold text-ink">{title}</span>
                    <span className="text-xs text-ink-muted">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal>
              <ChaosToOrder copy={t.chaos} />
            </div>
          </div>
        </section>

        {/* What SmartHub covers */}
        <div aria-hidden="true" className="border-y border-white/10 bg-slate-950 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          <div className="sh-marquee">
            {[0, 1].map((copy) => (
              <ul key={copy} className="sh-marquee__track">
                {t.scope.map((item) => (
                  <li key={item} className="flex items-center gap-10 whitespace-nowrap">
                    {item}
                    <span className="size-1.5 rounded-full bg-blue-500" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* Ecosystem */}
        <section id="ecosistema" aria-labelledby="ecosistema-title" className="relative scroll-mt-16 overflow-hidden bg-slate-950 py-20 text-white">
          <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 opacity-60" />
          <span aria-hidden="true" className="sh-blob pointer-events-none absolute -right-40 top-10 size-[28rem] rounded-full bg-blue-700/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                {t.ecosystem.label}
              </span>
              <h2 id="ecosistema-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.ecosystem.title}
              </h2>
              <p className="mt-3 text-slate-400">{t.ecosystem.text}</p>
            </div>
            <div data-reveal className="mt-14">
              <EcosystemHub copy={t.ecosystem} names={[dict.nav.smartweb.label, dict.nav.smartdesk.label, dict.nav.smartai.label]} />
            </div>
          </div>
        </section>

        {/* Values */}
        <section id="valores" aria-labelledby="valores-title" className="scroll-mt-16 bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div data-reveal className="max-w-2xl">
              <SectionLabel>{t.values.label}</SectionLabel>
              <h2 id="valores-title" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t.values.title}
              </h2>
            </div>
            <ul className="sh-stagger mt-12 grid gap-5 md:grid-cols-3">
              {t.values.items.map(({ title, text }, index) => {
                const { icon: Icon, wide } = valueStyles[index];
                return (
                  <li key={title} data-reveal className={`sh-value flex flex-col p-6 sm:p-8 ${wide ? "md:col-span-2" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                        <Icon className="size-6" />
                      </span>
                      <span aria-hidden="true" className="sh-value__number">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-ink">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Call to action */}
        <section id="contacto" aria-labelledby="contacto-title" className="scroll-mt-16 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-blue-600/30 px-3 py-1 text-xs font-medium text-blue-200">
                {t.cta.badge}
              </span>
              <h2 id="contacto-title" className="mt-4 text-3xl font-bold tracking-tight">
                {t.cta.title}
              </h2>
              <p className="mt-3 max-w-lg text-slate-300">{t.cta.text}</p>
              <div className="sh-enter sh-delay-3 mt-8 flex flex-wrap gap-3">
                <Link href="/register" className={primaryButton}>
                  {t.cta.primary}
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href="mailto:contacto@smarthub.example"
                  className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t.cta.secondary}
                </a>
              </div>
            </div>
            <div aria-hidden="true" data-reveal className="mx-auto w-full max-w-md">
              <div className="rounded-t-2xl border-4 border-slate-700 bg-gradient-to-br from-slate-900 to-blue-950 p-10 text-center">
                <LogoIcon className="mx-auto size-12 text-blue-400" />
                <p className="mt-3 text-2xl font-bold">SmartHub</p>
                <p className="mt-1 text-sm text-blue-200">{t.cta.tagline}</p>
              </div>
              <div className="mx-auto h-3 w-[110%] -translate-x-[4.5%] rounded-b-xl bg-slate-700" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href={localizeHref(locale, "/")} className="flex items-center gap-2 text-lg font-bold text-white">
            <LogoIcon className="size-6 text-blue-400" />
            SmartHub
          </Link>
          <nav aria-label={dict.nav.footerAria}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {navigation
                .filter((entry) => entry.label !== dict.nav.home)
                .map((entry) => (
                  <li key={entry.label}>
                    {entry.href ? (
                      <Link href={entry.href} className="hover:text-white">
                        {entry.label}
                      </Link>
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
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SmartHub. {dict.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
