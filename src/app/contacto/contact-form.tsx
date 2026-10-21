"use client";

import { useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import { DEFAULT_LOCALE, getDictionary, type Locale } from "@/i18n";
import { BuildingIcon, ChatPhoneIcon, DoubleCheckIcon, MailIcon, SendIcon, UserIcon } from "./contact-icons";
import {
  CONTACT_TOPICS,
  MESSAGE_MAX,
  NAME_MAX,
  WHATSAPP_DISPLAY,
  buildContactMessage,
  validateContact,
  whatsappUrl,
  type ContactCopy,
  type ContactErrors,
  type ContactInput,
} from "./whatsapp";

const empty: ContactInput = { name: "", company: "", email: "", topic: "SmartDesk", message: "" };

const inputClass =
  "w-full bg-transparent py-3 text-[15px] text-white outline-none placeholder:text-slate-500";

type FieldProps = {
  id: keyof ContactInput;
  optionalLabel: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
};

function Field({ id, label, icon: FieldIcon, value, onChange, error, optional, optionalLabel, type = "text", ...rest }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-slate-200">
        {label}
        {optional && <span className="text-xs font-normal text-slate-500">{optionalLabel}</span>}
      </label>
      <div className={`ct-input flex items-center gap-3 rounded-xl px-3.5 ${error ? "ct-input--error" : ""}`}>
        <FieldIcon className="size-5 shrink-0 text-emerald-300/70" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
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

/** Live preview of the message as it will arrive on WhatsApp. */
function ChatPreview({ text, copy }: { text: string; copy: ContactCopy }) {
  const time = new Intl.DateTimeFormat(copy.timeLocale, { hour: "2-digit", minute: "2-digit" }).format(new Date());
  return (
    <div className="ct-phone mx-auto w-full max-w-[22rem]" aria-label={copy.previewAria}>
      <div className="ct-phone__screen">
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#0b2a26] px-4 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-500 text-sm font-bold text-emerald-950">
            SH
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">SmartHub</p>
            <p className="flex items-center gap-1.5 text-xs text-emerald-300">
              <span className="ct-pulse size-1.5 rounded-full bg-emerald-400" />
              {WHATSAPP_DISPLAY}
            </p>
          </div>
        </div>
        <div className="ct-chat flex min-h-72 flex-col justify-end gap-2 p-4">
          <p className="mx-auto rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-slate-300">{copy.today}</p>
          <div className="ct-bubble ml-auto max-w-[88%] rounded-2xl rounded-tr-sm px-3 pb-1.5 pt-2 text-[13px] leading-snug text-white">
            <p className="whitespace-pre-wrap break-words">{text}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-100/70">
              <span suppressHydrationWarning>{time}</span>
              <DoubleCheckIcon className="size-3.5 text-sky-300" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Contact form: on submit it opens WhatsApp (app on mobile, WhatsApp Web on a
 * computer) with SmartHub's chat and the message already written.
 */
export function ContactForm({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const copy = getDictionary(locale).contact.form;
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const message = buildContactMessage(values, copy);

  function update<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact(values, copy);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = (["name", "email", "message"] as const).find((key) => found[key]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    const url = whatsappUrl(message);
    // A new tab keeps this page open; if the browser blocks it, go in the same tab.
    if (!window.open(url, "_blank", "noopener,noreferrer")) window.location.href = url;
    setSentUrl(url);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
      <div className="ct-card rounded-3xl p-6 sm:p-8">
        {sentUrl ? (
          <div className="flex flex-col items-center py-10 text-center" role="status">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40">
              <DoubleCheckIcon className="size-8" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-white">{copy.sentTitle}</h2>
            <p className="mt-2 max-w-sm text-slate-300">
              {copy.sentText}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="ct-btn">
                <ChatPhoneIcon className="size-5" />
                {copy.openAgain}
              </a>
              <button
                type="button"
                onClick={() => {
                  setValues(empty);
                  setSentUrl(null);
                }}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              >
                {copy.writeAnother}
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold text-white">{copy.heading}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {copy.sub}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="name"
                label={copy.name}
                optionalLabel={copy.optional}
                icon={UserIcon}
                value={values.name}
                onChange={(value) => update("name", value)}
                error={errors.name}
                autoComplete="name"
                placeholder={copy.namePlaceholder}
                maxLength={NAME_MAX}
              />
              <Field
                id="company"
                label={copy.company}
                optionalLabel={copy.optional}
                icon={BuildingIcon}
                value={values.company}
                onChange={(value) => update("company", value)}
                optional
                autoComplete="organization"
                placeholder={copy.companyPlaceholder}
                maxLength={NAME_MAX}
              />
            </div>

            <Field
              id="email"
              label={copy.email}
              optionalLabel={copy.optional}
              icon={MailIcon}
              type="email"
              value={values.email}
              onChange={(value) => update("email", value)}
              error={errors.email}
              optional
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
            />

            <fieldset>
              <legend className="text-sm font-medium text-slate-200">{copy.topicLegend}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTACT_TOPICS.map((topic) => (
                  <label key={topic} className="ct-chip">
                    <input
                      type="radio"
                      name="topic"
                      value={topic}
                      checked={values.topic === topic}
                      onChange={() => update("topic", topic)}
                      className="sr-only"
                    />
                    {copy.topics[topic]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-slate-200">
                {copy.message}
              </label>
              <div className={`ct-input rounded-xl px-3.5 ${errors.message ? "ct-input--error" : ""}`}>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={(event) => update("message", event.target.value)}
                  maxLength={MESSAGE_MAX}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? "message-error message-count" : "message-count"}
                  placeholder={copy.messagePlaceholder}
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
                <span id="message-count" className="shrink-0 text-xs text-slate-500">
                  {values.message.length}/{MESSAGE_MAX}
                </span>
              </div>
            </div>

            <button type="submit" className="ct-btn mt-1 w-full sm:w-auto sm:self-start">
              <SendIcon className="size-5" />
              {copy.submit}
            </button>
          </form>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
          {copy.previewTitle}
        </p>
        <ChatPreview text={message} copy={copy} />
      </aside>
    </div>
  );
}
