"use client";

import Link from "next/link";
import Script from "next/script";
import { createContext, use, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { publicConfig } from "@/config/env";
import { COOKIE_CATEGORIES, type CookieCategory, type CookieEntry } from "@/content/cookies";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_DAYS,
  effectiveConsent,
  isAnalyticsCookie,
  parseConsent,
  readCookie,
  serializeConsent,
  type Consent,
} from "@/lib/consent";
import { ChevronDownIcon, CloseIcon, ShieldCheckIcon } from "../icons";

type ConsentState = {
  /** `undefined` until the browser has been read, `null` when there is no valid choice yet. */
  consent: Consent | null | undefined;
  /** True when the site uses any optional cookie (today: Google Analytics, if configured). */
  hasOptional: boolean;
  save: (analytics: boolean) => void;
  openPreferences: () => void;
};

const ConsentContext = createContext<ConsentState | null>(null);

export function useConsent(): ConsentState {
  const value = use(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside <ConsentProvider>");
  return value;
}

/** Whether a third party of the cookie list is configured in this build. */
function isServiceOn(service: CookieEntry["service"]): boolean {
  if (service === "analytics") return Boolean(publicConfig.gaId);
  if (service === "turnstile") return Boolean(publicConfig.turnstileSiteKey);
  return true;
}

function removeAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!isAnalyticsCookie(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

/**
 * Keeps the visitor's choice and loads optional scripts only after consent.
 * Every first visit shows the notice, even while the site only uses necessary
 * cookies: nothing optional loads until the visitor decides.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const hasOptional = Boolean(publicConfig.gaId);

  useEffect(() => {
    // The cookie only exists in the browser, so it is read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(effectiveConsent(parseConsent(readCookie(document.cookie, CONSENT_COOKIE)), hasOptional));
  }, [hasOptional]);

  const save = useCallback(
    (analytics: boolean) => {
      const next: Consent = { analytics: hasOptional && analytics, offered: hasOptional, decidedAt: Date.now() };
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${CONSENT_COOKIE}=${serializeConsent(next)}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86_400}; Path=/; SameSite=Lax${secure}`;
      const hadAnalytics = consent?.analytics === true;
      setConsent(next);
      setPanelOpen(false);
      if (!next.analytics && hadAnalytics) {
        removeAnalyticsCookies();
        // A loaded analytics script cannot be unloaded: start a clean page.
        window.location.reload();
      }
    },
    [consent, hasOptional],
  );

  const openPreferences = useCallback(() => setPanelOpen(true), []);

  return (
    <ConsentContext value={{ consent, hasOptional, save, openPreferences }}>
      {/* First in the document so keyboard users reach it before the page. */}
      {consent === null && !panelOpen && <ConsentBanner />}
      {children}
      {hasOptional && consent?.analytics && <Analytics id={publicConfig.gaId as string} />}
      {panelOpen && <PreferencesDialog onClose={() => setPanelOpen(false)} />}
    </ConsentContext>
  );
}

/** Google Analytics 4, only rendered after the visitor accepts analytics cookies. */
function Analytics({ id }: { id: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
    </>
  );
}

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
/** Accept, reject and configure share this look: same size and weight (AEPD guide). */
const choiceButton = `min-h-11 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1.5 text-[13px] font-semibold leading-tight sm:text-sm text-white transition-colors hover:bg-white/15 ${focusRing}`;
const policyLink = "font-medium text-blue-300 underline underline-offset-2 hover:text-white";

/**
 * First layer: what is used, and accept, reject or configure with the same
 * prominence. Not a wall: the page stays usable behind it. Closing it rejects.
 */
function ConsentBanner() {
  const { hasOptional, save, openPreferences } = useConsent();
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="sh-consent fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-slate-900/95 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 text-sm text-slate-300 shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[30rem] sm:rounded-3xl sm:border sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-2xl border border-blue-400/30 bg-blue-500/10 text-blue-300">
          <ShieldCheckIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Privacidad</p>
          <h2 id={titleId} className="mt-0.5 text-base font-semibold text-white">
            Tu privacidad, bajo tu control
          </h2>
        </div>
        <button
          type="button"
          onClick={() => save(false)}
          aria-label="Cerrar y rechazar las cookies opcionales"
          title="Cerrar (equivale a rechazar)"
          className={`-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <p className="mt-4 leading-relaxed">
        {hasOptional
          ? "Usamos cookies técnicas, necesarias para que la web funcione, y, solo si las aceptas, cookies de análisis para saber cómo se usa la web y mejorarla. "
          : "Usamos solo cookies técnicas, necesarias para que la web funcione. No usamos cookies de análisis ni de publicidad; si algún día las añadimos, te pediremos permiso antes. "}
        Más información en la{" "}
        <Link href="/politica-de-cookies" className={policyLink}>
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => save(false)} className={choiceButton}>
          Rechazar todas
        </button>
        <button type="button" onClick={openPreferences} className={choiceButton}>
          Configurar
        </button>
        <button type="button" onClick={() => save(true)} className={choiceButton}>
          Aceptar todas
        </button>
      </div>
    </section>
  );
}

/** Toggle drawn as a switch; disabled ones show their fixed state. */
function Switch({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange?: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed ${
        checked ? "border-blue-400/60 bg-blue-600" : "border-white/20 bg-white/10"
      } ${disabled ? "opacity-60" : ""} ${focusRing}`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function CookieList({ category }: { category: CookieCategory }) {
  return (
    <details className="group mt-3">
      <summary className={`inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-xs font-semibold text-blue-300 hover:text-white ${focusRing}`}>
        Ver cookies ({category.cookies.length})
        <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {category.cookies.map((cookie) => (
          <li key={cookie.name} className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-semibold text-white">{cookie.name}</span>
              <span className="text-slate-400">{cookie.duration}</span>
            </div>
            <p className="mt-1 text-slate-400">
              {cookie.provider} · {cookie.purpose}
            </p>
            {!isServiceOn(cookie.service) && <p className="mt-1 font-medium text-amber-300/90">No activo actualmente: no se instala.</p>}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Second layer: the choice per category, with the cookies of each one. Shared by the dialog and /configuracion-cookies. */
function PreferencesForm({ onDone }: { onDone?: () => void }) {
  const { consent, hasOptional, save } = useConsent();
  // Nothing comes pre-ticked: analytics starts off unless the visitor already accepted it.
  const [choice, setAnalytics] = useState<boolean | null>(null);
  const analytics = choice ?? consent?.analytics ?? false;
  const [saved, setSaved] = useState(false);

  function decide(value: boolean) {
    save(value);
    setAnalytics(value);
    setSaved(true);
    onDone?.();
  }

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {COOKIE_CATEGORIES.map((category) => {
          const isAnalytics = category.id === "analitica";
          return (
            <li key={category.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{category.description}</p>
                </div>
                {!isAnalytics ? (
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <Switch checked disabled label="Cookies técnicas: siempre activas" />
                    <span className="text-[11px] font-semibold text-emerald-300">Siempre activas</span>
                  </span>
                ) : hasOptional ? (
                  <Switch checked={analytics} onChange={(value) => { setAnalytics(value); setSaved(false); }} label="Cookies de análisis" />
                ) : (
                  <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">No utilizado actualmente</span>
                )}
              </div>
              <CookieList category={category} />
            </li>
          );
        })}
      </ul>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => decide(false)} className={choiceButton}>
          Rechazar todas
        </button>
        <button type="button" onClick={() => decide(analytics)} className={`min-h-11 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 ${focusRing}`}>
          Guardar preferencias
        </button>
        <button type="button" onClick={() => decide(true)} className={choiceButton}>
          Aceptar todas
        </button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-sm text-emerald-300">
        {saved && !onDone ? "Preferencias guardadas." : ""}
      </p>
      {consent && (
        <p className="text-xs text-slate-400">
          Última elección: {new Date(consent.decidedAt).toLocaleString("es-ES")}
          {hasOptional && ` · análisis ${consent.analytics ? "aceptado" : "rechazado"}`}.
        </p>
      )}
    </div>
  );
}

/** "Configurar" from the banner or the footer: a dialog over the page, opened by the visitor. */
function PreferencesDialog({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      // Keep the focus inside the dialog.
      const items = panelRef.current.querySelectorAll<HTMLElement>("a, button:not(:disabled), summary");
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" onClick={onClose} className="sh-consent-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sh-consent relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Centro de preferencias</p>
            <h2 id={titleId} className="mt-0.5 text-lg font-semibold text-white">
              Configuración de cookies
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar configuración" className={`grid size-9 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}>
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6">
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            Elige qué cookies aceptas. Puedes cambiar tu decisión cuando quieras desde «Configuración de cookies», en el pie de
            todas las páginas. Detalles en la{" "}
            <Link href="/politica-de-cookies" onClick={onClose} className={policyLink}>
              política de cookies
            </Link>{" "}
            y la{" "}
            <Link href="/politica-de-privacidad" onClick={onClose} className={policyLink}>
              política de privacidad
            </Link>
            .
          </p>
          <PreferencesForm onDone={onClose} />
        </div>
      </div>
    </div>
  );
}

/** The preferences on a page of their own (/configuracion-cookies and the cookie policy). */
export function ConsentSettings() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
      <PreferencesForm />
    </div>
  );
}
