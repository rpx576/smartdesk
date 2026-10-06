import Link from "next/link";
import type { ReactNode } from "react";
import { AlertIcon } from "./icons";
import { buttonClass } from "./ui";

/**
 * Shared building blocks for the create/edit forms (projects, tasks). They are
 * presentational only: validation and authorization always run on the server.
 */

export const inputClass =
  "w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30 disabled:opacity-60";

export type FieldA11y = { id: string; "aria-invalid"?: true; "aria-describedby"?: string };

/** Label + control + hint/error, with ids wired for screen readers. */
export function FormField({
  idPrefix,
  name,
  label,
  hint,
  errors,
  children,
  className = "",
}: {
  idPrefix: string;
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
  children: (props: FieldA11y) => ReactNode;
  className?: string;
}) {
  const id = `${idPrefix}-${name}`;
  const describedBy = [hint && `${id}-hint`, errors && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
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

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid min-w-0 gap-5 border-t border-line p-5 first-of-type:border-t-0 sm:grid-cols-2">
      <legend className="float-left mb-1 w-full text-xs font-semibold uppercase tracking-wide text-ink-subtle sm:col-span-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/** General error banner (focusable) or a screen-reader hint when only fields failed. */
export function FormErrors({ error, hasFieldErrors }: { error?: string; hasFieldErrors: boolean }) {
  if (error) {
    return (
      <div
        role="alert"
        tabIndex={-1}
        data-form-error
        className="m-5 mb-0 flex items-start gap-2.5 rounded-lg bg-danger-soft px-3.5 py-3 text-sm text-danger outline-none"
      >
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        {error}
      </div>
    );
  }
  if (!hasFieldErrors) return null;
  return (
    <p role="alert" className="sr-only">
      Revisa los campos marcados.
    </p>
  );
}

export function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
  );
}

/** Cancel + submit; the submit button is disabled while pending (no double submit). */
export function FormActions({
  pending,
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
      <Link href={cancelHref} className={buttonClass.secondary} aria-disabled={pending}>
        Cancelar
      </Link>
      <button type="submit" disabled={pending} className={`${buttonClass.primary} disabled:cursor-wait disabled:opacity-70`}>
        {pending && <Spinner />}
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
