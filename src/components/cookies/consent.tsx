"use client";

import Link from "next/link";
import Script from "next/script";
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { publicConfig } from "@/config/env";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS, isAnalyticsCookie, parseConsent, readCookie, serializeConsent, type Consent } from "@/lib/consent";

type ConsentState = {
  /** `undefined` until the browser has been read, `null` when there is no choice yet. */
  consent: Consent | null | undefined;
  /** True when the site uses any optional cookie (today: Google Analytics, if configured). */
  hasOptional: boolean;
  save: (analytics: boolean) => void;
};

const ConsentContext = createContext<ConsentState | null>(null);

export function useConsent(): ConsentState {
  const value = use(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside <ConsentProvider>");
  return value;
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

/** Keeps the visitor's choice and loads optional scripts only after consent. */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const hasOptional = Boolean(publicConfig.gaId);

  useEffect(() => {
    // The cookie only exists in the browser, so it is read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(parseConsent(readCookie(document.cookie, CONSENT_COOKIE)));
  }, []);

  const save = useCallback((analytics: boolean) => {
    const next = { analytics, decidedAt: Date.now() };
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=${serializeConsent(next)}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86_400}; Path=/; SameSite=Lax${secure}`;
    const hadAnalytics = consent?.analytics === true;
    setConsent(next);
    if (!analytics && hadAnalytics) {
      removeAnalyticsCookies();
      // A loaded analytics script cannot be unloaded: start a clean page.
      window.location.reload();
    }
  }, [consent]);

  return (
    <ConsentContext value={{ consent, hasOptional, save }}>
      {children}
      {hasOptional && consent?.analytics && <Analytics id={publicConfig.gaId as string} />}
      {hasOptional && consent === null && <ConsentBanner />}
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

const choiceButton =
  "min-h-11 flex-1 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:flex-none";

/** First-layer banner: accept, reject and configure with the same prominence. */
function ConsentBanner() {
  const { save } = useConsent();
  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-900/95 p-5 text-sm text-slate-300 shadow-2xl backdrop-blur-md md:bottom-4"
    >
      <p className="font-semibold text-white">Usamos cookies de analítica solo si las aceptas</p>
      <p className="mt-1.5">
        Las cookies técnicas son necesarias para que la web funcione. Con tu permiso, usaremos también cookies de
        analítica para saber cómo se usa la web y mejorarla. Más información en la{" "}
        <Link href="/politica-de-cookies" className="text-blue-300 underline underline-offset-2 hover:text-white">
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => save(false)} className={`${choiceButton} bg-white/10 text-white hover:bg-white/15`}>
          Rechazar
        </button>
        <Link href="/configuracion-cookies" className={`${choiceButton} border border-white/20 text-center text-white hover:bg-white/5`}>
          Configurar
        </Link>
        <button type="button" onClick={() => save(true)} className={`${choiceButton} bg-white/10 text-white hover:bg-white/15`}>
          Aceptar
        </button>
      </div>
    </div>
  );
}

/** Second layer: the choice per category, always reachable from the footer. */
export function ConsentSettings() {
  const { consent, hasOptional, save } = useConsent();
  const [analytics, setAnalytics] = useState<boolean | null>(null);
  const checked = analytics ?? consent?.analytics ?? false;
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <fieldset>
        <legend className="text-lg font-semibold text-white">Tus preferencias</legend>
        <div className="mt-5 flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <p className="font-semibold text-white">Técnicas (necesarias)</p>
            <p className="mt-1 text-sm text-slate-400">
              Guardan tu elección de cookies y permiten funciones que pides, como los artículos guardados del blog. No
              se pueden desactivar.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">Siempre activas</span>
        </div>
        <label className="mt-5 flex items-start justify-between gap-6">
          <span>
            <span className="block font-semibold text-white">Analítica</span>
            <span className="mt-1 block text-sm text-slate-400">
              {hasOptional
                ? "Google Analytics: estadísticas de uso de la web. Solo se cargan si las aceptas."
                : "Ahora mismo la web no usa cookies de analítica. Si se activan, podrás elegir aquí."}
            </span>
          </span>
          <input
            type="checkbox"
            checked={checked}
            disabled={!hasOptional}
            onChange={(event) => {
              setAnalytics(event.target.checked);
              setSaved(false);
            }}
            className="mt-1 size-5 shrink-0 accent-blue-500"
          />
        </label>
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!hasOptional}
          onClick={() => {
            save(checked);
            setSaved(true);
          }}
          className="min-h-11 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guardar preferencias
        </button>
        <p role="status" className="text-sm text-emerald-300">
          {saved ? "Preferencias guardadas." : ""}
        </p>
      </div>
      {consent && (
        <p className="mt-4 text-xs text-slate-400">
          Última elección: {new Date(consent.decidedAt).toLocaleString("es-ES")} · analítica {consent.analytics ? "aceptada" : "rechazada"}.
        </p>
      )}
    </div>
  );
}
