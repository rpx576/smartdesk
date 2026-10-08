"use client";

import { useActionState, useEffect, useRef } from "react";
import { projectPriorityLabels, projectStatusLabels } from "@/lib/format";
import type { ClientOption } from "@/server/domain/client";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/server/domain/project";
import {
  FormActions,
  FormErrors,
  FormField as Field,
  FormSection as Section,
  inputClass,
} from "../../_components/form-controls";
import { Card } from "../../_components/ui";
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

/** Create/edit form for a project. Validation and authorization run on the server. */
export function ProjectForm({ action, clients, initial, submitLabel, pendingLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;
  // After a failed submit, refill with what the user typed; otherwise show the stored values.
  const value = (field: ProjectFormField) => state?.values?.[field] ?? initial?.[field] ?? "";
  // React applies a <select> defaultValue only on mount and resets the form to it after each
  // action: selects are keyed by their value so they remount with what the user had chosen.

  // Move focus to the first invalid field (or the error banner) after a failed submit.
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')?.focus();
  }, [state]);

  const field = (name: ProjectFormField) => ({ idPrefix: "project", name, errors: errors?.[name] });

  return (
    <form ref={formRef} action={formAction} aria-busy={pending} noValidate>
      <Card>
        <FormErrors error={state?.error} hasFieldErrors={Boolean(errors)} />

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

        <FormActions pending={pending} submitLabel={submitLabel} pendingLabel={pendingLabel} cancelHref={cancelHref} />
      </Card>
    </form>
  );
}
