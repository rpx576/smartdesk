import { isPastDue } from "@/lib/dates";
import { formatDay, taskStatusLabels } from "@/lib/format";
import { isOpenStatus, type Task, type TaskStatus } from "@/server/domain/task";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-surface-muted text-ink-muted",
  IN_PROGRESS: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  IN_REVIEW: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  BLOCKED: "bg-danger-soft text-danger",
  COMPLETED: "bg-accent-soft text-accent",
  CANCELLED: "bg-surface-muted text-ink-subtle line-through decoration-1",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {taskStatusLabels[status]}
    </span>
  );
}

/** Due date, flagged when an open task is past it (calendar days, business time zone). */
export function DueDate({ task, today }: { task: Pick<Task, "dueDate" | "status">; today: Date }) {
  if (!task.dueDate) return <span className="text-ink-subtle">—</span>;
  const overdue = isOpenStatus(task.status) && isPastDue(task.dueDate, today);
  return (
    <span className={`inline-flex flex-col items-start gap-0.5 whitespace-nowrap ${overdue ? "font-medium text-danger" : ""}`}>
      <time dateTime={task.dueDate.toISOString().slice(0, 10)}>{formatDay(task.dueDate)}</time>
      {overdue && (
        <span className="rounded-full bg-danger-soft px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">
          Vencida
        </span>
      )}
    </span>
  );
}
