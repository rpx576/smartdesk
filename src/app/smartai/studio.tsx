"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  assistants,
  BUSINESS_LIMITS,
  SMARTAI_ERROR_MARKER,
  type AssistantId,
  type BusinessProfile,
  type SmartAiMode,
} from "@/lib/smartai";
import { AnswerView } from "./answer-view";
import {
  assistantIcons,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  RefreshIcon,
  SendIcon,
  SparklesIcon,
  StopIcon,
} from "./icons";
import { toPlainText } from "./markdown";

type Status = "idle" | "streaming" | "done" | "error";

const PROFILE_KEY = "smartai:negocio";
const emptyProfile: BusinessProfile = { name: "", sector: "", tone: "" };

function readProfile(): BusinessProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return emptyProfile;
    const value = JSON.parse(raw) as Partial<BusinessProfile>;
    return {
      name: String(value.name ?? "").slice(0, BUSINESS_LIMITS.name),
      sector: String(value.sector ?? "").slice(0, BUSINESS_LIMITS.sector),
      tone: String(value.tone ?? "").slice(0, BUSINESS_LIMITS.tone),
    };
  } catch {
    return emptyProfile;
  }
}

function saveProfile(profile: BusinessProfile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable (private mode): the profile lasts for this visit only.
  }
}

const initialValues = () =>
  Object.fromEntries(
    assistants.map((assistant) => [
      assistant.id,
      Object.fromEntries(assistant.fields.map((field) => [field.name, field.options?.[0] ?? ""])),
    ]),
  ) as Record<AssistantId, Record<string, string>>;

type ApiError = { error?: { message?: string; details?: { message?: string }[] } };

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  if (response.status === 400) return body.error?.details?.[0]?.message ?? "Revisa los datos del formulario.";
  if (response.status === 429) return body.error?.message ?? "Demasiadas peticiones. Espera un momento.";
  return "SmartAI no está disponible ahora mismo. Inténtalo de nuevo en unos minutos.";
}

const inputClass =
  "ai-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition";

/**
 * SmartAI Studio: pick an assistant, fill a short form and get the answer
 * streamed from /api/smartai. The business profile is remembered in this
 * browser so every answer is written for the visitor's business.
 */
export function SmartAiStudio({ mode }: { mode: SmartAiMode }) {
  const [activeId, setActiveId] = useState<AssistantId>("presupuesto");
  const [values, setValues] = useState(initialValues);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [answeredBy, setAnsweredBy] = useState<{ assistant: AssistantId; mode: SmartAiMode } | null>(null);
  const [minutesSaved, setMinutesSaved] = useState(0);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const assistant = assistants.find((a) => a.id === activeId)!;
  const current = values[activeId];
  const streaming = status === "streaming";

  useEffect(() => {
    // Read the saved profile after hydration (server render has no storage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(readProfile());
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!streaming) return;
    const box = outputRef.current;
    if (box && box.scrollHeight - box.scrollTop - box.clientHeight < 120) box.scrollTop = box.scrollHeight;
  }, [output, streaming]);

  function setField(name: string, value: string) {
    setValues((all) => ({ ...all, [activeId]: { ...all[activeId], [name]: value } }));
  }

  function updateProfile(field: keyof BusinessProfile, value: string) {
    const next = { ...profile, [field]: value };
    setProfile(next);
    saveProfile(next);
  }

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("streaming");
    setOutput("");
    setError("");
    setCopied(false);

    try {
      const response = await fetch("/api/smartai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistant: activeId, inputs: current, business: profile }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        setError(await errorMessage(response));
        setStatus("error");
        return;
      }
      const answerMode = response.headers.get("X-SmartAI-Mode") === "live" ? "live" : "demo";
      setAnsweredBy({ assistant: activeId, mode: answerMode });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const marker = text.indexOf(SMARTAI_ERROR_MARKER);
        setOutput(marker === -1 ? text : text.slice(0, marker));
      }
      text += decoder.decode();
      const marker = text.indexOf(SMARTAI_ERROR_MARKER);
      if (marker !== -1) {
        setOutput(text.slice(0, marker).trim());
        setError(text.slice(marker + SMARTAI_ERROR_MARKER.length));
        setStatus("error");
        return;
      }
      setOutput(text);
      setStatus("done");
      setMinutesSaved((m) => m + assistant.minutesSaved);
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus((s) => (s === "streaming" ? "done" : s));
        return;
      }
      console.error(err);
      setError("No hemos podido conectar con SmartAI. Revisa tu conexión e inténtalo de nuevo.");
      setStatus("error");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toPlainText(output));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Tu navegador no permite copiar automáticamente. Selecciona el texto y cópialo a mano.");
    }
  }

  function download() {
    const blob = new Blob([toPlainText(output)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartai-${answeredBy?.assistant ?? activeId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const shareable = answeredBy && (answeredBy.assistant === "respuesta" || answeredBy.assistant === "marketing");
  const hasProfile = Boolean(profile.name || profile.sector || profile.tone);

  return (
    <div className="ai-window">
      {/* Window bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-rose-400/70" />
            <i className="size-2.5 rounded-full bg-amber-400/70" />
            <i className="size-2.5 rounded-full bg-emerald-400/70" />
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <SparklesIcon className="size-4 text-violet-300" />
            SmartAI Studio
          </span>
        </div>
        {mode === "live" ? (
          <span className="ai-badge ai-badge--live">
            <span className="ai-pulse" aria-hidden="true" />
            IA conectada
          </span>
        ) : (
          <span className="ai-badge ai-badge--demo" title="Respuestas de ejemplo generadas con tus datos, sin modelo de IA">
            Modo demostración
          </span>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        {/* Assistants + business profile */}
        <aside className="min-w-0 border-b border-white/10 p-3 lg:border-b-0 lg:border-r">
          <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Asistentes</p>
          <ul className="ai-assistants flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {assistants.map((item) => {
              const Icon = assistantIcons[item.id];
              const active = item.id === activeId;
              return (
                <li key={item.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveId(item.id)}
                    className={`ai-assistant ${active ? "is-active" : ""}`}
                  >
                    <span className="ai-assistant__icon">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold text-white">{item.name}</span>
                      <span className="hidden text-xs text-slate-400 lg:block">Ahorra ~{item.minutesSaved} min</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="ai-profile mt-3 rounded-2xl p-3">
            <button
              type="button"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
              className="flex w-full items-center gap-2.5 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              <span className="ai-assistant__icon">
                <BuildingIcon className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">Tu negocio</span>
                <span className="block truncate text-xs text-slate-400">
                  {hasProfile ? [profile.name, profile.sector].filter(Boolean).join(" · ") : "Personaliza las respuestas"}
                </span>
              </span>
              <span aria-hidden="true" className={`text-lg text-violet-300 transition-transform ${profileOpen ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            {profileOpen && (
              <div className="mt-3 flex flex-col gap-2.5">
                <label className="text-xs font-medium text-slate-300">
                  Nombre
                  <input
                    className={`${inputClass} mt-1`}
                    value={profile.name}
                    maxLength={BUSINESS_LIMITS.name}
                    placeholder="Talleres Ana"
                    onChange={(e) => updateProfile("name", e.target.value)}
                  />
                </label>
                <label className="text-xs font-medium text-slate-300">
                  Sector
                  <input
                    className={`${inputClass} mt-1`}
                    value={profile.sector}
                    maxLength={BUSINESS_LIMITS.sector}
                    placeholder="Taller mecánico"
                    onChange={(e) => updateProfile("sector", e.target.value)}
                  />
                </label>
                <label className="text-xs font-medium text-slate-300">
                  Cómo habláis
                  <input
                    className={`${inputClass} mt-1`}
                    value={profile.tone}
                    maxLength={BUSINESS_LIMITS.tone}
                    placeholder="De tú, cercanos y directos"
                    onChange={(e) => updateProfile("tone", e.target.value)}
                  />
                </label>
                <p className="text-[11px] text-slate-500">Se guarda solo en este navegador.</p>
              </div>
            )}
          </div>

          <p className="mt-3 flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-slate-400" aria-live="polite">
            <ClockIcon className="size-4 text-violet-300" />
            {minutesSaved > 0 ? (
              <span>
                Hoy te has ahorrado <strong className="text-white">~{minutesSaved} min</strong>
              </span>
            ) : (
              <span>Cada respuesta te ahorra minutos de trabajo</span>
            )}
          </p>
        </aside>

        {/* Form + result */}
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            id={formId}
            onSubmit={onSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !streaming) {
                e.preventDefault();
                e.currentTarget.requestSubmit();
              }
            }}
            className="flex min-w-0 flex-col gap-4 border-b border-white/10 p-5 xl:border-b-0 xl:border-r"
          >
            <div>
              <h3 className="text-lg font-bold text-white">{assistant.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{assistant.tagline}</p>
            </div>

            {assistant.fields.map((field) => {
              const id = `${formId}-${field.name}`;
              const value = current[field.name] ?? "";
              return (
                <div key={`${activeId}-${field.name}`} className="flex flex-col gap-1.5">
                  {field.kind === "select" ? (
                    <span id={id} className="text-sm font-medium text-slate-200">
                      {field.label}
                    </span>
                  ) : (
                    <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-200">
                      <span>
                        {field.label}
                        {field.required && <span className="text-violet-300"> *</span>}
                      </span>
                      {field.kind === "textarea" && (
                        <span className="text-[11px] font-normal text-slate-500">
                          {value.length}/{field.maxLength}
                        </span>
                      )}
                    </label>
                  )}
                  {field.kind === "textarea" ? (
                    <textarea
                      id={id}
                      required={field.required}
                      maxLength={field.maxLength}
                      rows={field.maxLength > 2500 ? 7 : 5}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => setField(field.name, e.target.value)}
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                  ) : field.kind === "select" ? (
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={id}>
                      {field.options!.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={value === option}
                          onClick={() => setField(field.name, option)}
                          className={`ai-chip ${value === option ? "is-active" : ""}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={id}
                      required={field.required}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => setField(field.name, e.target.value)}
                      className={inputClass}
                    />
                  )}
                </div>
              );
            })}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              {streaming ? (
                <button type="button" onClick={() => abortRef.current?.abort()} className="ai-btn ai-btn--ghost">
                  <StopIcon className="size-4" />
                  Detener
                </button>
              ) : (
                <button type="submit" className="ai-btn">
                  <SparklesIcon className="size-4" />
                  {assistant.submitLabel}
                </button>
              )}
              <button
                type="button"
                disabled={streaming}
                onClick={() => setValues((all) => ({ ...all, [activeId]: { ...all[activeId], ...assistant.example } }))}
                className="ai-link"
              >
                Probar con un ejemplo
              </button>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">Consejo: pulsa Ctrl + Enter para generar.</p>
          </form>

          <section aria-label="Resultado" className="flex min-h-[26rem] min-w-0 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
              <p className="text-sm font-semibold text-white">
                Resultado
                {answeredBy && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {assistants.find((a) => a.id === answeredBy.assistant)!.name}
                    {answeredBy.mode === "demo" ? " · demo" : ""}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={copy} disabled={!output || streaming} className="ai-icon-btn" title="Copiar">
                  {copied ? <CheckIcon className="size-4 text-emerald-300" /> : <CopyIcon className="size-4" />}
                  <span className="sr-only">{copied ? "Copiado" : "Copiar"}</span>
                </button>
                <button type="button" onClick={download} disabled={!output || streaming} className="ai-icon-btn" title="Descargar .txt">
                  <DownloadIcon className="size-4" />
                  <span className="sr-only">Descargar como texto</span>
                </button>
                <button
                  type="button"
                  onClick={() => void run()}
                  disabled={streaming || status === "idle"}
                  className="ai-icon-btn"
                  title="Generar otra versión"
                >
                  <RefreshIcon className="size-4" />
                  <span className="sr-only">Generar otra versión</span>
                </button>
                {shareable && output && !streaming && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(toPlainText(output).slice(0, 3000))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-icon-btn"
                    title="Enviar por WhatsApp"
                  >
                    <SendIcon className="size-4" />
                    <span className="sr-only">Enviar por WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div ref={outputRef} className="ai-output flex-1 overflow-y-auto px-5 py-4" aria-busy={streaming}>
              {output ? (
                <>
                  <AnswerView text={output} />
                  {streaming && <span className="ai-caret" aria-hidden="true" />}
                </>
              ) : streaming ? (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="ai-thinking" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  SmartAI está pensando…
                </div>
              ) : (
                !error && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                    <span className="ai-empty-orb" aria-hidden="true">
                      <SparklesIcon className="size-7 text-white" />
                    </span>
                    <p className="max-w-xs text-sm text-slate-400">
                      Rellena el formulario o pulsa <strong className="text-slate-200">Probar con un ejemplo</strong>. El
                      resultado aparecerá aquí, listo para copiar.
                    </p>
                  </div>
                )
              )}
              {error && (
                <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-100">
                  {error}
                </p>
              )}
            </div>
            {answeredBy?.mode === "demo" && output && !streaming && (
              <p className="border-t border-white/10 px-5 py-2.5 text-[11px] text-slate-500">
                Respuesta de demostración creada con reglas a partir de tus datos. Con SmartAI conectado a la IA, cada texto
                se redacta a medida.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
