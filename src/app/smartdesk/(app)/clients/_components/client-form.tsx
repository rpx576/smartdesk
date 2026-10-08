"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { clientStatusLabels } from "@/lib/format";
import { CLIENT_STATUSES } from "@/server/domain/client";
import { AlertIcon } from "../../_components/icons";
import { buttonClass, Card } from "../../_components/ui";
import type { ClientFormState } from "../actions";
import type { ClientFormField, ClientFormValues } from "../form-data";

type Props = {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  /** Current values when editing; empty when creating. */
  initial?: ClientFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30 disabled:opacity-60";

function Field({
  name,
  label,
  hint,
  errors,
  children,
  className = "",
}: {
  name: ClientFormField;
  label: string;
  hint?: string;
  errors?: string[];
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}) {
  const id = `client-${name}`;
  const describedBy = [hint && `${id}-hint`, errors && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({ id, "aria-invalid": errors ? true : undefined, "aria-describedby": describedBy || undefined })}
      {hint && !errors && (
        <p id={`${id}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}
      {errors && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {errors[0]}
        </p>
      )}
    </div>
  );
}

/** Create/edit form for a client. Validation and authorization run on the server. */
export function ClientForm({ action, initial, submitLabel, pendingLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;
  // After a failed submit, refill with what the user typed; otherwise show the stored values.
  const value = (field: ClientFormField) => state?.values?.[field] ?? initial?.[field] ?? "";

  // Move focus to the first invalid field (or the error banner) after a failed submit.
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} aria-busy={pending} noValidate>
      <Card>
        {state?.error && (
          <div
            role="alert"
            tabIndex={-1}
            data-form-error
            className="m-5 mb-0 flex items-start gap-2.5 rounded-lg bg-danger-soft px-3.5 py-3 text-sm text-danger outline-none"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </div>
        )}
        {errors && !state?.error && (
          <p role="alert" className="sr-only">
            Revisa los campos marcados.
          </p>
        )}

        <fieldset disabled={pending} className="grid gap-5 p-5 sm:grid-cols-2">
          <legend className="sr-only">Datos del cliente</legend>
          <Field name="name" label="Nombre *" errors={errors?.name} className="sm:col-span-2">
            {(props) => (
              <input
                {...props}
                name="name"
                defaultValue={value("name")}
                autoComplete="off"
                maxLength={200}
                placeholder="Ej. Bodegas Rioja"
                className={inputClass}
              />
            )}
          </Field>
          <Field name="email" label="Email" errors={errors?.email}>
            {(props) => (
              <input
                {...props}
                name="email"
                type="email"
                defaultValue={value("email")}
                autoComplete="off"
                maxLength={254}
                placeholder="contacto@empresa.com"
                className={inputClass}
              />
            )}
          </Field>
          <Field name="phone" label="Teléfono" errors={errors?.phone}>
            {(props) => (
              <input
                {...props}
                name="phone"
                type="tel"
                defaultValue={value("phone")}
                autoComplete="off"
                maxLength={50}
                placeholder="+34 600 000 000"
                className={inputClass}
              />
            )}
          </Field>
          <Field name="company" label="Empresa" errors={errors?.company}>
            {(props) => (
              <input
                {...props}
                name="company"
                defaultValue={value("company")}
                autoComplete="off"
                maxLength={200}
                placeholder="Razón social"
                className={inputClass}
              />
            )}
          </Field>
          <Field name="status" label="Estado" errors={errors?.status}>
            {(props) => (
              // Keyed by value: React applies a <select> defaultValue only on mount and resets
              // the form to it after each action, which would drop the user's choice.
              <select key={value("status")} {...props} name="status" defaultValue={value("status") || "ACTIVE"} className={inputClass}>
                {CLIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {clientStatusLabels[status]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            name="notes"
            label="Notas"
            hint="Información interna, solo visible para tu equipo."
            errors={errors?.notes}
            className="sm:col-span-2"
          >
            {(props) => (
              <textarea
                {...props}
                name="notes"
                defaultValue={value("notes")}
                rows={4}
                maxLength={5000}
                className={`${inputClass} resize-y`}
              />
            )}
          </Field>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Link href={cancelHref} className={buttonClass.secondary} aria-disabled={pending}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending} className={`${buttonClass.primary} disabled:cursor-wait disabled:opacity-70`}>
            {pending && (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            )}
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </Card>
    </form>
  );
}
