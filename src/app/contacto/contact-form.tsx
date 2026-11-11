"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState, type ComponentType, type FormEvent, type ReactNode, type SVGProps } from "react";
import { publicConfig } from "@/config/env";
import { BUDGETS, DEADLINES, MESSAGE_MAX, NAME_MAX, REQUEST_TYPES, SERVICE_OPTIONS, serviceLabel } from "@/content/contact-options";
import { BuildingIcon, ChatPhoneIcon, MailIcon, PhoneIcon, SendIcon, UserIcon } from "./contact-icons";
import { whatsappDraftUrl } from "./whatsapp";

type RequestType = keyof typeof REQUEST_TYPES;
type Values = {
  requestType: RequestType;
  service: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  budget: string;
  deadline: string;
  message: string;
  privacy: boolean;
  website: string;
};
type FieldName = "name" | "email" | "phone" | "message" | "privacy" | "service";
type Errors = Partial<Record<FieldName, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string; offerWhatsApp: boolean };

const inputClass = "w-full bg-transparent py-3 text-[15px] text-white outline-none placeholder:text-slate-400";
const ORDER: FieldName[] = ["service", "name", "email", "phone", "message", "privacy"];

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

function initialValues(params: URLSearchParams): Values {
  const service = params.get("servicio");
  return {
    requestType: params.get("tipo") === "presupuesto" ? "presupuesto" : "contacto",
    service: SERVICE_OPTIONS.some((option) => option.id === service) ? (service as string) : "",
    name: "",
    company: "",
    email: "",
    phone: "",
    budget: "",
    deadline: "",
    message: "",
    privacy: false,
    website: "",
  };
}

/** Same rules as the server (src/server/contact/schema.ts), checked first in the browser for instant feedback. */
function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.service) errors.service = "Elige el servicio que te interesa.";
  if (!values.name.trim()) errors.name = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Revisa el correo electrónico.";
  if (values.phone.trim() && !/^[+\d][\d\s().-]{5,}$/.test(values.phone.trim())) errors.phone = "Revisa el teléfono (o déjalo vacío).";
  if (values.message.trim().length < 10) errors.message = "Cuéntanos un poco más (mínimo 10 caracteres).";
  if (!values.privacy) errors.privacy = "Necesitamos que aceptes la política de privacidad para responderte.";
  return errors;
}

type FieldProps = {
  id: "name" | "company" | "email" | "phone";
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
};

function Field({ id, label, icon: FieldIcon, value, onChange, error, optional, type = "text", ...rest }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-slate-200">
        <span>
          {label}
          {!optional && <span aria-hidden="true" className="text-blue-300"> *</span>}
        </span>
        {optional && <span className="text-xs font-normal text-slate-400">Opcional</span>}
      </label>
      <div className={`ct-input flex items-center gap-3 rounded-xl px-3.5 ${error ? "ct-input--error" : ""}`}>
        <FieldIcon className="size-5 shrink-0 text-blue-300/70" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          required={!optional}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClass}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-slate-200">
        {label}
        <span className="text-xs font-normal text-slate-400">Opcional</span>
      </label>
      <div className="ct-input rounded-xl px-3.5">
        <select id={id} name={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} [&>option]:bg-slate-900`}>
          <option value="">Sin indicar</option>
          {Object.entries(options).map(([key, text]) => (
            <option key={key} value={key}>
              {text}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
      {children}
    </div>
  );
}

/**
 * Contact and quote form. It really sends: POST /api/contacto validates it
 * again, checks for spam and emails the team (plus a copy to the visitor).
 * If email is not set up yet or fails, it says so and offers WhatsApp with
 * the same message; it never pretends a message was sent.
 */
export function ContactForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [values, setValues] = useState<Values>(() => initialValues(params));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef(0);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const siteKey = publicConfig.turnstileSiteKey;
  const plan = params.get("plan") ?? params.get("modalidad") ?? undefined;

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function renderTurnstile() {
    if (!siteKey || !turnstileRef.current || !window.turnstile || turnstileId.current) return;
    turnstileId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      language: "es",
      theme: "dark",
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(undefined),
    });
  }

  useEffect(renderTurnstile);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function focusFirst(found: Errors) {
    const first = ORDER.find((key) => found[key]);
    if (first) document.getElementById(first === "service" ? `service-${SERVICE_OPTIONS[0].id}` : first)?.focus();
  }

  const whatsappHref = whatsappDraftUrl({
    name: values.name,
    company: values.company,
    serviceLabel: values.service ? serviceLabel(values.service) : "Información general",
    message: values.message,
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }
    setStatus({ kind: "sending" });
    const isQuote = values.requestType === "presupuesto";
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: values.requestType,
          service: values.service,
          name: values.name,
          company: values.company,
          email: values.email,
          phone: values.phone,
          message: values.message,
          privacy: values.privacy,
          website: values.website,
          startedAt: startedAt.current,
          ...(plan ? { plan } : {}),
          ...(isQuote && values.budget ? { budget: values.budget } : {}),
          ...(isQuote && values.deadline ? { deadline: values.deadline } : {}),
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      if (response.ok) {
        router.push("/gracias");
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string; details?: { path: string; message: string }[] };
      } | null;
      const fieldErrors: Errors = {};
      for (const issue of data?.error?.details ?? []) {
        if ((ORDER as string[]).includes(issue.path)) fieldErrors[issue.path as FieldName] = issue.message;
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setStatus({ kind: "idle" });
        focusFirst(fieldErrors);
        return;
      }
      const code = data?.error?.code;
      setStatus({
        kind: "error",
        message:
          code === "NOT_CONFIGURED"
            ? "El envío por correo todavía no está activado. Puedes mandarnos el mismo mensaje por WhatsApp."
            : data?.error?.message ?? "No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.",
        offerWhatsApp: true,
      });
      if (turnstileId.current) window.turnstile?.reset(turnstileId.current);
      setTurnstileToken(undefined);
    } catch {
      setStatus({ kind: "error", message: "No hay conexión. Revisa tu red o escríbenos por WhatsApp.", offerWhatsApp: true });
    }
  }

  const isQuote = values.requestType === "presupuesto";

  return (
    <form noValidate onSubmit={onSubmit} className="ct-card flex flex-col gap-5 rounded-3xl p-6 sm:p-8" aria-describedby="form-help">
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderTurnstile} />}
      <div>
        <h2 className="text-xl font-semibold text-white">{isQuote ? "Solicita tu presupuesto" : "Cuéntanos qué necesitas"}</h2>
        <p id="form-help" className="mt-1 text-sm text-slate-400">
          Los campos con <span className="text-blue-300">*</span> son obligatorios. Te respondemos por correo o teléfono.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-200">¿Qué quieres hacer?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {(Object.keys(REQUEST_TYPES) as RequestType[]).map((type) => (
            <label key={type} className="ct-toggle">
              <input type="radio" name="requestType" value={type} checked={values.requestType === type} onChange={() => update("requestType", type)} className="sr-only" />
              {type === "presupuesto" ? "Pedir presupuesto" : "Hacer una consulta"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset aria-describedby={errors.service ? "service-error" : undefined}>
        <legend className="text-sm font-medium text-slate-200">
          Servicio de interés <span aria-hidden="true" className="text-blue-300">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((option) => (
            <label key={option.id} className="ct-chip">
              <input
                id={`service-${option.id}`}
                type="radio"
                name="service"
                value={option.id}
                checked={values.service === option.id}
                onChange={() => update("service", option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.service && (
          <p id="service-error" className="mt-1.5 text-sm text-rose-300">
            {errors.service}
          </p>
        )}
        {plan && <p className="mt-2 text-xs text-slate-400">Opción elegida: {plan}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nombre" icon={UserIcon} value={values.name} onChange={(value) => update("name", value)} error={errors.name} autoComplete="name" placeholder="Tu nombre" maxLength={NAME_MAX} />
        <Field id="company" label="Empresa" icon={BuildingIcon} value={values.company} onChange={(value) => update("company", value)} optional autoComplete="organization" placeholder="Nombre de tu empresa" maxLength={120} />
        <Field id="email" label="Correo electrónico" icon={MailIcon} type="email" value={values.email} onChange={(value) => update("email", value)} error={errors.email} autoComplete="email" placeholder="tu@empresa.com" maxLength={254} />
        <Field id="phone" label="Teléfono" icon={PhoneIcon} type="tel" value={values.phone} onChange={(value) => update("phone", value)} error={errors.phone} optional autoComplete="tel" placeholder="600 000 000" maxLength={30} />
      </div>

      {isQuote && (
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="budget" label="Presupuesto orientativo" value={values.budget} onChange={(value) => update("budget", value)} options={BUDGETS} />
          <SelectField id="deadline" label="Plazo" value={values.deadline} onChange={(value) => update("deadline", value)} options={DEADLINES} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-slate-200">
          {isQuote ? "Describe tu proyecto" : "Mensaje"} <span aria-hidden="true" className="text-blue-300">*</span>
        </label>
        <div className={`ct-input rounded-xl px-3.5 ${errors.message ? "ct-input--error" : ""}`}>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            maxLength={MESSAGE_MAX}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "message-error message-count" : "message-count"}
            placeholder={isQuote ? "Qué necesitas, para qué tipo de negocio y cualquier referencia que te guste." : "¿En qué podemos ayudarte?"}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="flex items-start justify-between gap-3 text-sm">
          {errors.message ? (
            <p id="message-error" className="text-rose-300">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span id="message-count" className="shrink-0 text-xs text-slate-400">
            {values.message.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="website">No rellenes este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs leading-relaxed text-slate-400">
        <p className="font-semibold text-slate-300">Información básica sobre protección de datos</p>
        <p className="mt-1">
          <strong className="text-slate-300">Responsable:</strong> el titular de la web (ver{" "}
          <Link href="/aviso-legal" className="text-blue-300 underline">aviso legal</Link>). <strong className="text-slate-300">Finalidad:</strong>{" "}
          responder a tu consulta o preparar tu presupuesto. <strong className="text-slate-300">Legitimación:</strong> tu consentimiento y medidas
          precontractuales. <strong className="text-slate-300">Destinatarios:</strong> no se ceden datos; los tratan proveedores de alojamiento y
          correo. <strong className="text-slate-300">Derechos:</strong> acceso, rectificación, supresión y otros, como se explica en la{" "}
          <Link href="/politica-de-privacidad" className="text-blue-300 underline">política de privacidad</Link>.
        </p>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            id="privacy"
            type="checkbox"
            checked={values.privacy}
            onChange={(event) => update("privacy", event.target.checked)}
            aria-invalid={errors.privacy ? true : undefined}
            aria-describedby={errors.privacy ? "privacy-error" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-blue-500"
          />
          <span>
            He leído y acepto la <Link href="/politica-de-privacidad" className="text-blue-300 underline">política de privacidad</Link>.{" "}
            <span aria-hidden="true" className="text-blue-300">*</span>
          </span>
        </label>
        {errors.privacy && (
          <p id="privacy-error" className="mt-1.5 text-sm text-rose-300">
            {errors.privacy}
          </p>
        )}
      </div>

      {siteKey && <div ref={turnstileRef} className="min-h-[65px]" />}

      {status.kind === "error" && (
        <Notice>
          <p>{status.message}</p>
          {status.offerWhatsApp && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-300 underline">
              <ChatPhoneIcon className="size-4" /> Enviar este mensaje por WhatsApp
            </a>
          )}
        </Notice>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status.kind === "sending" || Boolean(siteKey && !turnstileToken)} className="ct-btn w-full sm:w-auto">
          <SendIcon className="size-5" />
          {status.kind === "sending" ? "Enviando…" : isQuote ? "Solicitar presupuesto" : "Enviar mensaje"}
        </button>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Prefiero enviarlo por WhatsApp
        </a>
      </div>
      <p aria-live="polite" className="sr-only">
        {status.kind === "sending" ? "Enviando el formulario" : ""}
      </p>
    </form>
  );
}
