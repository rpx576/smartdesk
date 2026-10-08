"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { calendarEventTypeLabels, personLabel } from "@/lib/format";
import { CALENDAR_EVENT_TYPES, type CalendarFormOptions } from "@/server/domain/calendar-event";
import {
  FormActions,
  FormErrors,
  FormField as Field,
  FormSection as Section,
  inputClass,
} from "../../_components/form-controls";
import { Card } from "../../_components/ui";
import type { EventFormState } from "../actions";
import type { EventFormField, EventFormValues } from "../form-data";

type Props = {
  action: (state: EventFormState, formData: FormData) => Promise<EventFormState>;
  /**
   * Clients, projects, tasks and members of the active organization, loaded on
   * the server. Only a convenience for the selectors: the server re-validates
   * every id and that they belong together.
   */
  options: CalendarFormOptions;
  /** Current values when editing; defaults (day, assignee, project) when creating. */
  initial?: EventFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

type FieldProps = (name: EventFormField) => { idPrefix: string; name: string; errors?: string[] };

/**
 * Client → project → task, filtered on the fly: choosing a client narrows the
 * projects, choosing a project narrows the tasks and fills in its client.
 * Keyed by the submitted values in the parent, so it starts again from what
 * the user sent after a failed submit.
 */
function LinkSelects({ options, initial, field }: { options: CalendarFormOptions; initial: EventFormValues; field: FieldProps }) {
  const [clientId, setClientId] = useState(initial.clientId ?? "");
  const [projectId, setProjectId] = useState(initial.projectId ?? "");
  const [taskId, setTaskId] = useState(initial.taskId ?? "");

  const projects = clientId ? options.projects.filter((p) => p.clientId === clientId) : options.projects;
  const tasks = projectId ? options.tasks.filter((t) => t.projectId === projectId) : [];
  const clientName = (id: string) => options.clients.find((c) => c.id === id)?.name ?? "";

  function changeClient(value: string) {
    setClientId(value);
    const project = options.projects.find((p) => p.id === projectId);
    if (value && project && project.clientId !== value) {
      setProjectId("");
      setTaskId("");
    }
  }

  function changeProject(value: string) {
    setProjectId(value);
    const project = options.projects.find((p) => p.id === value);
    if (project && !clientId) setClientId(project.clientId);
    const task = options.tasks.find((t) => t.id === taskId);
    if (!value || (task && task.projectId !== value)) setTaskId("");
  }

  return (
    <>
      <Field {...field("clientId")} label="Cliente">
        {(props) => (
          <select {...props} name="clientId" value={clientId} onChange={(e) => changeClient(e.target.value)} className={inputClass}>
            <option value="">Sin cliente</option>
            {options.clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field {...field("projectId")} label="Proyecto" hint={clientId ? "Proyectos de este cliente" : undefined}>
        {(props) => (
          <select {...props} name="projectId" value={projectId} onChange={(e) => changeProject(e.target.value)} className={inputClass}>
            <option value="">{projects.length ? "Sin proyecto" : "Este cliente no tiene proyectos"}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {clientId ? project.name : `${project.name} · ${clientName(project.clientId)}`}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field
        {...field("taskId")}
        label="Tarea"
        className="sm:col-span-2"
        hint={projectId ? (tasks.length ? "Tareas de este proyecto" : "Este proyecto no tiene tareas") : "Elige primero un proyecto"}
      >
        {(props) => (
          <select
            {...props}
            name="taskId"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            disabled={!projectId || tasks.length === 0}
            className={inputClass}
          >
            <option value="">Sin tarea</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        )}
      </Field>
      {/* A disabled select is not submitted: send an explicit "no task" so a stored link is cleared. */}
      {(!projectId || tasks.length === 0) && <input type="hidden" name="taskId" value="" />}
    </>
  );
}

/** Create/edit form for a calendar event. Validation and authorization run on the server. */
export function EventForm({ action, options, initial, submitLabel, pendingLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fieldErrors;
  // After a failed submit, refill with what the user typed; otherwise show the stored values.
  const values = state?.values ?? initial ?? {};
  const value = (name: EventFormField) => values[name] ?? "";
  const [allDay, setAllDay] = useState(value("allDay") === "on");
  // Re-sync the checkbox with what was submitted (the form resets after each action).
  const [syncedState, setSyncedState] = useState(state);
  if (state !== syncedState) {
    setSyncedState(state);
    setAllDay((state?.values?.allDay ?? "") === "on");
  }

  // Move focus to the first invalid field (or the error banner) after a failed submit.
  useEffect(() => {
    if (!state) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')?.focus();
  }, [state]);

  const field: FieldProps = (name) => ({ idPrefix: "event", name, errors: errors?.[name] });
  // Remount keys: React applies defaults only on mount and resets the form after each action.
  const attempt = JSON.stringify(values);

  return (
    <form ref={formRef} action={formAction} aria-busy={pending} noValidate>
      <Card>
        <FormErrors error={state?.error} hasFieldErrors={Boolean(errors)} />

        <fieldset disabled={pending} className="min-w-0">
          <Section title="Datos del evento">
            <Field {...field("title")} label="Título *" className="sm:col-span-2">
              {(props) => (
                <input
                  {...props}
                  name="title"
                  defaultValue={value("title")}
                  autoComplete="off"
                  maxLength={200}
                  placeholder="Ej. Reunión de seguimiento con el cliente"
                  className={inputClass}
                />
              )}
            </Field>
            <Field {...field("type")} label="Tipo">
              {(props) => (
                <select key={value("type")} {...props} name="type" defaultValue={value("type") || "MEETING"} className={inputClass}>
                  {CALENDAR_EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {calendarEventTypeLabels[type]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field {...field("location")} label="Ubicación" hint="Dirección, sala o enlace">
              {(props) => (
                <input {...props} name="location" defaultValue={value("location")} maxLength={200} autoComplete="off" className={inputClass} />
              )}
            </Field>
            <Field {...field("description")} label="Descripción" className="sm:col-span-2">
              {(props) => (
                <textarea
                  {...props}
                  name="description"
                  defaultValue={value("description")}
                  rows={3}
                  maxLength={5000}
                  placeholder="Orden del día, preparación, notas…"
                  className={`${inputClass} resize-y`}
                />
              )}
            </Field>
          </Section>

          <Section title="Fecha y hora (hora de Madrid)">
            <Field {...field("date")} label="Fecha *">
              {(props) => <input {...props} name="date" type="date" defaultValue={value("date")} className={inputClass} />}
            </Field>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  name="allDay"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="size-4 rounded border-line accent-accent"
                />
                Todo el día
              </label>
            </div>
            <Field {...field("startTime")} label={allDay ? "Hora de inicio" : "Hora de inicio *"}>
              {(props) => (
                <input
                  {...props}
                  key={`start-${attempt}`}
                  name="startTime"
                  type="time"
                  defaultValue={value("startTime")}
                  disabled={allDay}
                  className={inputClass}
                />
              )}
            </Field>
            <Field {...field("endTime")} label={allDay ? "Hora de fin" : "Hora de fin *"}>
              {(props) => (
                <input
                  {...props}
                  key={`end-${attempt}`}
                  name="endTime"
                  type="time"
                  defaultValue={value("endTime")}
                  disabled={allDay}
                  className={inputClass}
                />
              )}
            </Field>
          </Section>

          <Section title="Responsable y relaciones">
            <Field {...field("assignedToId")} label="Responsable" className="sm:col-span-2">
              {(props) => (
                <select key={value("assignedToId")} {...props} name="assignedToId" defaultValue={value("assignedToId")} className={inputClass}>
                  <option value="">Sin responsable</option>
                  {options.assignees.map((person) => (
                    <option key={person.id} value={person.id}>
                      {personLabel(person)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <LinkSelects key={attempt} options={options} initial={values} field={field} />
          </Section>
        </fieldset>

        <FormActions pending={pending} submitLabel={submitLabel} pendingLabel={pendingLabel} cancelHref={cancelHref} />
      </Card>
    </form>
  );
}
