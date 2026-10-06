"use client";

import { useActionState, useEffect, useRef } from "react";
import { personLabel, taskPriorityLabels, taskStatusLabels } from "@/lib/format";
import { TASK_PRIORITIES, TASK_STATUSES, type AssigneeOption, type ProjectOption } from "@/server/domain/task";
import {
  FormActions,
  FormErrors,
  FormField as Field,
  FormSection as Section,
  inputClass,
} from "../../_components/form-controls";
import { Card } from "../../_components/ui";
import type { TaskFormState } from "../actions";
import type { TaskFormField, TaskFormValues } from "../form-data";

type Props = {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  /**
   * Projects and members of the active organization, loaded on the server.
   * Only a convenience for the selectors: the server re-validates both ids.
   */
  projects: ProjectOption[];
  assignees: AssigneeOption[];
  /** Current values when editing; defaults (e.g. a preselected project) when creating. */
  initial?: TaskFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

/** Create/edit form for a task. Validation and authorization run on the server. */
export function TaskForm({ action, projects, assignees, initial, submitLabel, pendingLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;
  // After a failed submit, refill with what the user typed; otherwise show the stored values.
  const value = (field: TaskFormField) => state?.values?.[field] ?? initial?.[field] ?? "";
  // React applies a <select> defaultValue only on mount and resets the form to it after each
  // action: selects are keyed by their value so they remount with what the user had chosen.

  // Move focus to the first invalid field (or the error banner) after a failed submit.
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')?.focus();
  }, [state]);

  const field = (name: TaskFormField) => ({ idPrefix: "task", name, errors: errors?.[name] });

  return (
    <form ref={formRef} action={formAction} aria-busy={pending} noValidate>
      <Card>
        <FormErrors error={state?.error} hasFieldErrors={Boolean(errors)} />

        <fieldset disabled={pending} className="min-w-0">
          <Section title="Datos de la tarea">
            <Field {...field("title")} label="Título *" className="sm:col-span-2">
              {(props) => (
                <input
                  {...props}
                  name="title"
                  defaultValue={value("title")}
                  autoComplete="off"
                  maxLength={200}
                  placeholder="Ej. Preparar maqueta de la home"
                  className={inputClass}
                />
              )}
            </Field>
            <Field {...field("projectId")} label="Proyecto *">
              {(props) => (
                <select key={value("projectId")} {...props} name="projectId" defaultValue={value("projectId")} className={inputClass}>
                  <option value="" disabled>
                    {projects.length ? "Selecciona un proyecto" : "No hay proyectos: crea uno primero"}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} · {project.clientName}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field {...field("assigneeId")} label="Responsable *">
              {(props) => (
                <select key={value("assigneeId")} {...props} name="assigneeId" defaultValue={value("assigneeId")} className={inputClass}>
                  <option value="" disabled>
                    Selecciona un responsable
                  </option>
                  {assignees.map((person) => (
                    <option key={person.id} value={person.id}>
                      {personLabel(person)}
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
                  placeholder="Qué hay que hacer y criterios para darla por terminada"
                  className={`${inputClass} resize-y`}
                />
              )}
            </Field>
            <Field {...field("status")} label="Estado">
              {(props) => (
                <select key={value("status")} {...props} name="status" defaultValue={value("status") || "TODO"} className={inputClass}>
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {taskStatusLabels[status]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field {...field("priority")} label="Prioridad">
              {(props) => (
                <select key={value("priority")} {...props} name="priority" defaultValue={value("priority") || "MEDIUM"} className={inputClass}>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {taskPriorityLabels[priority]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </Section>

          <Section title="Planificación">
            <Field {...field("startDate")} label="Fecha de inicio">
              {(props) => <input {...props} name="startDate" type="date" defaultValue={value("startDate")} className={inputClass} />}
            </Field>
            <Field {...field("dueDate")} label="Fecha límite">
              {(props) => <input {...props} name="dueDate" type="date" defaultValue={value("dueDate")} className={inputClass} />}
            </Field>
            <Field {...field("estimatedHours")} label="Horas estimadas" hint="Ej. 4 o 2,5">
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
            <Field {...field("actualHours")} label="Horas reales" hint="Tiempo ya dedicado">
              {(props) => (
                <input
                  {...props}
                  name="actualHours"
                  inputMode="decimal"
                  defaultValue={value("actualHours")}
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
