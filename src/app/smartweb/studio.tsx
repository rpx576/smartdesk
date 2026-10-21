"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  activeModules,
  BUSINESS_NAME_MAX,
  buildProposalMessage,
  calculateQuote,
  clampPages,
  configForSector,
  defaultConfig,
  EXTRA_PAGE_PRICE,
  extras,
  formatEuros,
  getProjectType,
  maintenancePlans,
  MAX_PAGES,
  moduleGroups,
  normalizeConfig,
  palettes,
  PROJECT_TYPE_IDS,
  projectTypes,
  sectors,
  siteStyles,
  webModules,
  webScore,
  type ModuleId,
  type ProjectTypeId,
  type WebConfig,
} from "@/lib/smartweb";
import { ArrowRightIcon, CheckCircleIcon } from "../smartdesk/(app)/_components/icons";
import { CheckIcon, CopyIcon, RefreshIcon } from "../smartai/icons";
import { whatsappUrl } from "../contacto/whatsapp";
import { ChatBubbleIcon, extraIcons, LockIcon, moduleIcons, MonitorIcon, ShuffleIcon, SmartphoneIcon } from "./icons";
import { previewName, SitePreview, slugOf, type PreviewDevice } from "./site-preview";

const STORAGE_KEY = "smartweb:config";

const steps = [
  { id: "negocio", label: "Negocio" },
  { id: "tipo", label: "Tipo de web" },
  { id: "funciones", label: "Funciones" },
  { id: "diseno", label: "Diseño" },
  { id: "entrega", label: "Entrega" },
] as const;
type StepId = (typeof steps)[number]["id"];

function readSaved(): WebConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeConfig(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function save(config: WebConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable (private mode): the configuration lasts for this visit only.
  }
}

/** Switching type keeps a custom page count and drops modules the new type already includes. */
function withType(config: WebConfig, type: ProjectTypeId): WebConfig {
  const previous = getProjectType(config.type);
  const next = getProjectType(type);
  const pages = config.pages === previous.pagesIncluded ? next.pagesIncluded : config.pages;
  return {
    ...config,
    type,
    pages: clampPages(type, pages),
    modules: config.modules.filter((id) => !next.includes.includes(id)),
  };
}

function priceLabel(amount: number): string {
  return amount === 0 ? "Gratis" : `+${formatEuros(amount)}`;
}

/** Ring showing the SmartWeb index. */
function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const length = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 100 100" className="sw-ring" aria-hidden="true">
      <circle cx="50" cy="50" r={radius} className="sw-ring__track" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="sw-ring__value"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - score / 100)}
      />
    </svg>
  );
}

/**
 * SmartWeb Studio: the visitor configures their website step by step and sees
 * it built live, with an itemised quote, delivery time and the SmartWeb index.
 * The configuration is kept in this browser and can be sent to SmartHub by
 * WhatsApp with one tap. `?tipo=tienda` (or another type) preselects the type.
 */
export function SmartWebStudio() {
  const [config, setConfig] = useState<WebConfig>(defaultConfig);
  const [step, setStep] = useState<StepId>("negocio");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [copied, setCopied] = useState(false);
  const baseId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Saved configuration and ?tipo= are read after hydration (the server has neither).
    const saved = readSaved();
    const tipo = new URLSearchParams(window.location.search).get("tipo");
    const type = PROJECT_TYPE_IDS.find((id) => id === tipo);
    if (!saved && !type) return;
    const next = type ? withType(saved ?? defaultConfig, type) : saved!;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(next);
    if (type) setStep("tipo");
  }, []);

  function update(next: WebConfig) {
    setConfig(next);
    setCopied(false);
    save(next);
  }

  function toggleModule(id: ModuleId) {
    const modules = config.modules.includes(id) ? config.modules.filter((m) => m !== id) : [...config.modules, id];
    update({ ...config, modules });
  }

  const type = getProjectType(config.type);
  const modules = activeModules(config);
  const quote = calculateQuote(config);
  const { score, tips } = webScore(config);
  const name = previewName(config);
  const proposal = buildProposalMessage(config);
  const stepIndex = steps.findIndex((s) => s.id === step);

  async function copyProposal() {
    try {
      await navigator.clipboard.writeText(proposal);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  /** Previous / next: bring the step tabs back into view after a long step. */
  function goTo(next: StepId) {
    setStep(next);
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function reset() {
    update(defaultConfig);
    setStep("negocio");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* Configurator */}
        <div ref={panelRef} className="sw-panel flex flex-col rounded-3xl">
          <div role="tablist" aria-label="Pasos del configurador" className="sw-steps">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${s.id}`}
                aria-selected={step === s.id}
                aria-controls={`${baseId}-panel`}
                onClick={() => setStep(s.id)}
                className={`sw-step ${step === s.id ? "is-active" : ""} ${i < stepIndex ? "is-done" : ""}`}
              >
                <span className="sw-step__n">{i < stepIndex ? <CheckIcon className="size-3" /> : i + 1}</span>
                <span className="sw-step__label">{s.label}</span>
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${step}`}
            className="flex-1 px-5 pb-5 pt-4 sm:px-6"
          >
            {step === "negocio" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor={`${baseId}-name`} className="sw-label">
                    Nombre de tu negocio
                  </label>
                  <input
                    id={`${baseId}-name`}
                    className="sw-input mt-2"
                    value={config.businessName}
                    maxLength={BUSINESS_NAME_MAX}
                    placeholder={`Ej.: ${name}`}
                    autoComplete="organization"
                    onChange={(event) => update({ ...config, businessName: event.target.value })}
                  />
                </div>
                <fieldset>
                  <legend className="sw-label">Sector</legend>
                  <p className="mt-1 text-xs text-slate-400">Te proponemos el tipo de web y las funciones que mejor funcionan en tu sector.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {sectors.map((sector) => (
                      <label key={sector.id} className={`sw-chip ${config.sector === sector.id ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name={`${baseId}-sector`}
                          className="sr-only"
                          checked={config.sector === sector.id}
                          onChange={() => update(configForSector(sector.id, config))}
                        />
                        {sector.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === "tipo" && (
              <fieldset className="flex flex-col gap-3">
                <legend className="sw-label mb-3">¿Qué web necesitas?</legend>
                {projectTypes.map((option) => (
                  <label key={option.id} className={`sw-option ${config.type === option.id ? "is-active" : ""}`}>
                    <input
                      type="radio"
                      name={`${baseId}-type`}
                      className="sr-only"
                      checked={config.type === option.id}
                      onChange={() => update(withType(config, option.id))}
                    />
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-white">{option.name}</span>
                      <span className="shrink-0 text-sm font-semibold text-emerald-300">desde {formatEuros(option.price)}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">{option.description}</span>
                    <span className="mt-2 block text-[11px] font-medium text-slate-500">
                      {option.weeks} {option.weeks === 1 ? "semana" : "semanas"} · {option.idealFor}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

            {step === "funciones" && (
              <div className="flex flex-col gap-5">
                {moduleGroups.map((group) => (
                  <fieldset key={group.id}>
                    <legend className="sw-label">{group.name}</legend>
                    <div className="mt-2 flex flex-col gap-2">
                      {webModules
                        .filter((webModule) => webModule.group === group.id)
                        .map((webModule) => {
                          const Icon = moduleIcons[webModule.id];
                          const included = type.includes.includes(webModule.id);
                          const on = modules.has(webModule.id);
                          return (
                            <label key={webModule.id} className={`sw-toggle ${on ? "is-on" : ""} ${included ? "is-locked" : ""}`}>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={on}
                                disabled={included}
                                onChange={() => toggleModule(webModule.id)}
                              />
                              <span className="sw-toggle__icon">
                                <Icon className="size-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-white">{webModule.name}</span>
                                <span className="block text-xs text-slate-400">{webModule.description}</span>
                              </span>
                              <span className="sw-toggle__price">{included ? "Incluido" : priceLabel(webModule.price)}</span>
                              <span className="sw-switch" aria-hidden="true" />
                            </label>
                          );
                        })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            {step === "diseno" && (
              <div className="flex flex-col gap-6">
                <fieldset>
                  <legend className="sw-label">Colores</legend>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {palettes.map((palette) => (
                      <label key={palette.id} className={`sw-swatch ${config.palette === palette.id ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name={`${baseId}-palette`}
                          className="sr-only"
                          checked={config.palette === palette.id}
                          onChange={() => update({ ...config, palette: palette.id })}
                        />
                        <span className="sw-swatch__colors" aria-hidden="true">
                          <i style={{ background: palette.primary }} />
                          <i style={{ background: palette.accent }} />
                        </span>
                        {palette.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="sw-label">Estilo</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {siteStyles.map((siteStyle) => (
                      <label key={siteStyle.id} className={`sw-option sw-option--sm ${config.style === siteStyle.id ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name={`${baseId}-style`}
                          className="sr-only"
                          checked={config.style === siteStyle.id}
                          onChange={() => update({ ...config, style: siteStyle.id })}
                        />
                        <span className={`sw-style-name sw-style-name--${siteStyle.id}`}>{siteStyle.name}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{siteStyle.description}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <p className="sw-label">Titular de portada</p>
                  <button
                    type="button"
                    className="sw-btn sw-btn--ghost mt-3 w-full justify-center"
                    onClick={() => update({ ...config, headline: (config.headline + 1) % 3 })}
                  >
                    <ShuffleIcon className="size-4" />
                    Probar otro titular
                  </button>
                </div>
              </div>
            )}

            {step === "entrega" && (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="sw-label" id={`${baseId}-pages`}>
                    Número de páginas
                  </p>
                  <div className="mt-3 flex items-center gap-3" role="group" aria-labelledby={`${baseId}-pages`}>
                    <button
                      type="button"
                      className="sw-icon-btn"
                      aria-label="Una página menos"
                      disabled={type.fixedPages || config.pages <= 3}
                      onClick={() => update({ ...config, pages: clampPages(config.type, config.pages - 1) })}
                    >
                      −
                    </button>
                    <output className="min-w-12 text-center text-2xl font-bold text-white" aria-live="polite">
                      {config.pages}
                    </output>
                    <button
                      type="button"
                      className="sw-icon-btn"
                      aria-label="Una página más"
                      disabled={type.fixedPages || config.pages >= MAX_PAGES}
                      onClick={() => update({ ...config, pages: clampPages(config.type, config.pages + 1) })}
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-400">
                      {type.fixedPages
                        ? "Una landing es una sola página."
                        : `${type.pagesIncluded} incluidas · ${formatEuros(EXTRA_PAGE_PRICE)} cada extra`}
                    </span>
                  </div>
                </div>

                <fieldset>
                  <legend className="sw-label">Te lo damos hecho</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {extras.map((extra) => {
                      const Icon = extraIcons[extra.id];
                      const on = config.extras.includes(extra.id);
                      return (
                        <label key={extra.id} className={`sw-toggle ${on ? "is-on" : ""}`}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={on}
                            onChange={() =>
                              update({
                                ...config,
                                extras: on ? config.extras.filter((e) => e !== extra.id) : [...config.extras, extra.id],
                              })
                            }
                          />
                          <span className="sw-toggle__icon">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-white">{extra.name}</span>
                            <span className="block text-xs text-slate-400">{extra.description}</span>
                          </span>
                          <span className="sw-toggle__price">{priceLabel(extra.price)}</span>
                          <span className="sw-switch" aria-hidden="true" />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="sw-label">Plazo</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "estandar", name: "Estándar", text: "Calendario normal" },
                        { id: "express", name: "Exprés", text: "~30 % antes · +20 %" },
                      ] as const
                    ).map((option) => (
                      <label key={option.id} className={`sw-option sw-option--sm ${config.speed === option.id ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name={`${baseId}-speed`}
                          className="sr-only"
                          checked={config.speed === option.id}
                          onChange={() => update({ ...config, speed: option.id })}
                        />
                        <span className="font-semibold text-white">{option.name}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="sw-label">Mantenimiento</legend>
                  <div className="mt-3 flex flex-col gap-2">
                    {maintenancePlans.map((plan) => (
                      <label key={plan.id} className={`sw-option sw-option--sm ${config.maintenance === plan.id ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name={`${baseId}-maintenance`}
                          className="sr-only"
                          checked={config.maintenance === plan.id}
                          onChange={() => update({ ...config, maintenance: plan.id })}
                        />
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold text-white">{plan.name}</span>
                          <span className="text-sm font-semibold text-emerald-300">
                            {plan.monthly ? `${formatEuros(plan.monthly)}/mes` : "0 €"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{plan.description}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-4 sm:px-6">
            <button
              type="button"
              className="sw-link"
              disabled={stepIndex === 0}
              onClick={() => goTo(steps[Math.max(0, stepIndex - 1)].id)}
            >
              Anterior
            </button>
            {stepIndex < steps.length - 1 ? (
              <button type="button" className="sw-btn" onClick={() => goTo(steps[stepIndex + 1].id)}>
                Siguiente: {steps[stepIndex + 1].label}
                <ArrowRightIcon className="size-4" />
              </button>
            ) : (
              <a href="#presupuesto" className="sw-btn">
                Ver mi presupuesto
                <ArrowRightIcon className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="sw-window flex min-w-0 flex-col rounded-3xl lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3">
            <span className="hidden gap-1.5 sm:flex" aria-hidden="true">
              <i className="size-2.5 rounded-full bg-rose-400/70" />
              <i className="size-2.5 rounded-full bg-amber-400/70" />
              <i className="size-2.5 rounded-full bg-emerald-400/70" />
            </span>
            <span className="sw-address min-w-0 flex-1">
              <LockIcon className="size-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">www.{slugOf(name)}.es</span>
            </span>
            <div className="sw-segmented" role="group" aria-label="Ver como">
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} title="Ordenador">
                <MonitorIcon className="size-4" />
                <span className="sr-only">Ordenador</span>
              </button>
              <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")} title="Móvil">
                <SmartphoneIcon className="size-4" />
                <span className="sr-only">Móvil</span>
              </button>
            </div>
          </div>
          <div className="sw-viewport">
            <div className={`sw-device sw-device--${device}`}>
              <SitePreview config={config} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-4 py-3 text-sm">
            <p className="text-slate-300">
              <span className="font-semibold text-white">{type.name}</span> · {modules.size}{" "}
              {modules.size === 1 ? "función" : "funciones"} · {quote.weeks} {quote.weeks === 1 ? "semana" : "semanas"}
            </p>
            <a href="#presupuesto" className="sw-price-pill" aria-live="polite">
              {formatEuros(quote.subtotal)} <span className="text-emerald-200/70">+ IVA</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quote */}
      <section id="presupuesto" aria-labelledby="presupuesto-title" className="scroll-mt-24 grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="sw-panel rounded-3xl p-6">
          <h3 id="presupuesto-title" className="text-lg font-bold text-white">
            Tu presupuesto
          </h3>
          <p className="mt-1 text-xs text-slate-400">Precio orientativo, IVA no incluido salvo donde se indica.</p>
          <ul className="mt-5 flex flex-col gap-2.5 text-sm">
            {quote.lines.map((line) => (
              <li key={line.label} className="flex items-baseline justify-between gap-3">
                <span className="text-slate-300">
                  {line.label}
                  {line.note && <span className="block text-[11px] text-slate-500">{line.note}</span>}
                </span>
                <span className="shrink-0 font-medium text-white">{formatEuros(line.amount)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Base imponible</dt>
              <dd className="text-white">{formatEuros(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">IVA (21 %)</dt>
              <dd className="text-white">{formatEuros(quote.vat)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold text-white">Total</dt>
              <dd className="sw-gradient-text text-3xl font-bold">{formatEuros(quote.total)}</dd>
            </div>
            <div className="flex justify-between text-xs">
              <dt className="text-slate-400">Para empezar (40 %)</dt>
              <dd className="text-slate-200">{formatEuros(quote.deposit)}</dd>
            </div>
            {quote.monthly > 0 && (
              <div className="flex justify-between text-xs">
                <dt className="text-slate-400">Mantenimiento</dt>
                <dd className="text-slate-200">{formatEuros(quote.monthly)}/mes + IVA</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="sw-panel flex flex-col rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white">Índice SmartWeb</h3>
          <p className="mt-1 text-xs text-slate-400">Cuántas de las palancas que más clientes traen incluye tu web.</p>
          <div className="relative mx-auto mt-4 size-36">
            <ScoreRing score={score} />
            <p className="absolute inset-0 grid place-items-center text-center">
              <span>
                <span className="block text-4xl font-bold text-white">{score}</span>
                <span className="text-[11px] text-slate-400">de 100</span>
              </span>
            </p>
          </div>
          {tips.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-2">
              {tips.map((tip) => (
                <li key={tip.id}>
                  <button type="button" className="sw-tip" onClick={() => toggleModule(tip.id)}>
                    <span>Añadir {tip.name}</span>
                    <span className="font-semibold text-emerald-300">+{tip.points}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircleIcon className="size-4" /> Tu web lo tiene todo para captar clientes.
            </p>
          )}
          <p className="mt-auto pt-4 text-[11px] text-slate-500">Orientativo: no es una promesa de resultados.</p>
        </div>

        <div className="sw-cta-card flex flex-col rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white">¿Lo hacemos realidad?</h3>
          <p className="mt-2 text-sm text-slate-300">
            Envíanos tu configuración y en 72 horas te enseñamos la propuesta de diseño de{" "}
            <strong className="text-white">{name}</strong>. Sin compromiso: no pagas nada hasta aceptarla.
          </p>
          <ul className="mt-4 flex flex-col gap-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-emerald-300" /> Entrega en unas {quote.weeks}{" "}
              {quote.weeks === 1 ? "semana" : "semanas"}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-emerald-300" /> Precio cerrado antes de empezar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-emerald-300" /> La web y el dominio son tuyos
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-2">
            <a href={whatsappUrl(proposal)} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn--wa justify-center">
              <ChatBubbleIcon className="size-4" />
              Enviar por WhatsApp
            </a>
            <button type="button" className="sw-btn sw-btn--ghost justify-center" onClick={copyProposal}>
              {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
              {copied ? "Resumen copiado" : "Copiar resumen"}
            </button>
            <Link href="/contacto" className="sw-link text-center">
              Prefiero que me llaméis
            </Link>
          </div>
          <button type="button" className="sw-link mt-auto inline-flex items-center justify-center gap-1.5 pt-4 text-xs" onClick={reset}>
            <RefreshIcon className="size-3.5" />
            Empezar de cero
          </button>
        </div>
      </section>
    </div>
  );
}
