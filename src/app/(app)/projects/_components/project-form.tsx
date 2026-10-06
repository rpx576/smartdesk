"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { projectPriorityLabels, projectStatusLabels } from "@/lib/format";
import type { ClientOption } from "@/server/domain/client";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/server/domain/project";
import { AlertIcon } from "../../_components/icons";
import { buttonClass, Card } from "../../_components/ui";
import type { ProjectFormState } from "../actions";
import type { ProjectFormField, ProjectFormValues } from "../form-data";

type Props = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  /**
   * Clients of the active organization, loaded on the server. Only a
   * convenience for the selector: the server re-validates the chosen client.
   */
  clients: ClientOption[];
  /** Current values when editing; defaults when creating. */
  initial?: ProjectFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30 disabled:opacity-60";

type FieldA11y = { id: string; "aria-invalid"?: true; "aria-describedby"?: string };

function Field({
  name,
  label,
  hint,
  errors,
  children,
  className = "",
}: {
  name: ProjectFormField;
  label: string;
  hint?: string;
  errors?: string[];
  children: (props: FieldA11y) => ReactNode;
  className?: string;
}) {
  const id = `project-${name}`;
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-line p-5 first-of-type:border-t-0 sm:grid-cols-2">
      <legend className="float-left mb-1 w-full text-xs font-semibold uppercase tracking-wide text-ink-subtle sm:col-span-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/** Create/edit form for a project. Validation and authorization run on the server. */
export function ProjectForm({ action, clients, initial, submitLabel, pendingLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;
  // After a failed submit, refill with what the user typed; otherwise show the stored values.
  const value = (field: ProjectFormField) => state?.values?.[field] ?? initial?.[field] ?? "";
  // React applies a <select> defaultValue only on mount, and resets the form to it after each
  // action. Keying selects by their value remounts them with what the user had chosen.

  // Move focus to the first invalid field (or the error banner) after a failed submit.
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')?.focus();
  }, [state]);

  const field = (name: ProjectFormField) => ({ name, errors: errors?.[name] });

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

        <fieldset disabled={pending} className="min-w-0">
          <Section title="Datos del proyecto">
            <Field {...field("name")} label="Nombre *" className="sm:col-span-2">
              {(props) => (
                <input
                  {...props}
                  name="name"
                  defaultValue={value("name")}
                  autoComplete="off"
                  maxLength={200}
                  placeholder="Ej. Rediseño de la web corporativa"
                 
                  className={inputClass}
                />
              )}
            </Field>
            <Field {...field("clientId")} label="Cliente *" className="sm:col-span-2">
              {(props) => (
                <select key={value("clientId")} {...props} name="clientId" defaultValue={value("clientId")} className={inputClass}>
                  <option value="" disabled>
                    {clients.length ? "Selecciona un cliente" : "No hay clientes: crea uno primero"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field {...field("description")} label="Descripción" className="sm:col-span-2">
              {(props) => (
                <textarea
                  {...props}
                  name="description"
                  defaultValue={value("description")}
                  rows={4}
                  maxLength={5000}
                  placeholder="Objetivo, alcance y entregables principales"
                 
                  className={`${inputClass} resize-y`}
                />
              )}
            </Field>
            <Field {...field("status")} label="Estado">
              {(props) => (
                <select key={value("status")} {...props} name="status" defaultValue={value("status") || "PLANNING"} className={inputClass}>
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {projectStatusLabels[status]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field {...field("priority")} label="Prioridad">
              {(props) => (
                <select key={value("priority")} {...props} name="priority" defaultValue={value("priority") || "MEDIUM"} className={inputClass}>
                  {PROJECT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {projectPriorityLabels[priority]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </Section>

          <Section title="Planificación">
            <Field {...field("startDate")} label="Fecha de inicio">
              {(props) => (
                <input {...props} name="startDate" type="date" defaultValue={value("startDate")} className={inputClass} />
              )}
            </Field>
            <Field {...field("dueDate")} label="Fecha prevista de finalización">
              {(props) => (
                <input {...props} name="dueDate" type="date" defaultValue={value("dueDate")} className={inputClass} />
              )}
            </Field>
            <Field {...field("budget")} label="Presupuesto (€)" hint="Sin separador de miles. Ej. 2500,50">
              {(props) => (
                <input
                  {...props}
                  name="budget"
                  inputMode="decimal"
                  defaultValue={value("budget")}
                  autoComplete="off"
                  placeholder="0,00"
                 
                  className={inputClass}
                />
              )}
            </Field>
            <Field {...field("estimatedHours")} label="Horas estimadas">
              {(props) => (
                <input
                  {...props}
                  name="estimatedHours"
                  inputMode="decimal"
                  defaultValue={value("estimatedHours")}
                  autoComplete="off"
                  placeholder="0"
                 
                  className={inputClass}
                />
              )}
            </Field>
          </Section>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Link href={cancelHref} className={buttonClass.secondary} aria-disabled={pending}>
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className={`${buttonClass.primary} disabled:cursor-wait disabled:opacity-70`}
          >
            {pending && (
              <span
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            )}
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </Card>
    </form>
  );
}
