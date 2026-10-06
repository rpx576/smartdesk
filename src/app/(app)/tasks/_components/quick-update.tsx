"use client";

import { useActionState, type ReactNode } from "react";
import { personLabel, taskPriorityLabels, taskStatusLabels } from "@/lib/format";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type AssigneeOption,
  type TaskPriority,
  type TaskStatus,
} from "@/server/domain/task";
import { Spinner } from "../../_components/form-controls";
import { buttonClass } from "../../_components/ui";
import type { TaskActionState } from "../actions";

type QuickAction = (state: TaskActionState, formData: FormData) => Promise<TaskActionState>;

const selectClass =
  "w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60";

/** One select + "Guardar" that changes a single field through its own server action. */
function QuickField({
  id,
  label,
  name,
  current,
  action,
  children,
}: {
  id: string;
  label: string;
  name: string;
  current: string;
  action: QuickAction;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-1.5" aria-busy={pending}>
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          // Remount when the stored value changes (React applies select defaults only on mount).
          key={current}
          id={id}
          name={name}
          defaultValue={current}
          disabled={pending}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? `${id}-error` : undefined}
          className={selectClass}
        >
          {children}
        </select>
        <button type="submit" disabled={pending} className={`${buttonClass.secondary} shrink-0 disabled:cursor-wait disabled:opacity-70`}>
          {pending ? <Spinner /> : null}
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {state?.error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

/**
 * Change status, priority or assignee without opening the full form. Each
 * action is bound to the task id on the server page and re-validated there.
 */
export function QuickUpdate({
  status,
  priority,
  assigneeId,
  assignees,
  changeStatus,
  changePriority,
  assign,
}: {
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assignees: AssigneeOption[];
  changeStatus: QuickAction;
  changePriority: QuickAction;
  assign: QuickAction;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <QuickField id="quick-status" label="Estado" name="status" current={status} action={changeStatus}>
        {TASK_STATUSES.map((value) => (
          <option key={value} value={value}>
            {taskStatusLabels[value]}
          </option>
        ))}
      </QuickField>
      <QuickField id="quick-priority" label="Prioridad" name="priority" current={priority} action={changePriority}>
        {TASK_PRIORITIES.map((value) => (
          <option key={value} value={value}>
            {taskPriorityLabels[value]}
          </option>
        ))}
      </QuickField>
      <QuickField id="quick-assignee" label="Responsable" name="assigneeId" current={assigneeId} action={assign}>
        {assignees.map((person) => (
          <option key={person.id} value={person.id}>
            {personLabel(person)}
          </option>
        ))}
      </QuickField>
    </div>
  );
}
