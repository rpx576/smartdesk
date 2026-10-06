import { projectPriorityLabels, projectStatusLabels } from "@/lib/format";
import type { ProjectPriority, ProjectStatus } from "@/server/domain/project";

const statusStyles: Record<ProjectStatus, string> = {
  PLANNING: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  ACTIVE: "bg-accent-soft text-accent",
  ON_HOLD: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  COMPLETED: "bg-surface-muted text-ink",
  CANCELLED: "bg-surface-muted text-ink-subtle line-through decoration-1",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {projectStatusLabels[status]}
    </span>
  );
}

const priorityDots: Record<ProjectPriority, string> = {
  LOW: "bg-ink-subtle/60",
  MEDIUM: "bg-sky-500",
  HIGH: "bg-amber-500",
  CRITICAL: "bg-danger",
};

export function ProjectPriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-muted">
      <span className={`size-2 rounded-full ${priorityDots[priority]}`} aria-hidden="true" />
      {projectPriorityLabels[priority]}
    </span>
  );
}

/**
 * Completion bar. Progress comes from the project (always 0 until the tasks
 * module exists); `hint` explains where the number comes from.
 */
export function ProgressBar({ value, hint }: { value: number; hint?: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex min-w-24 items-center gap-2" title={hint}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={hint ? `Progreso: ${percent}% (${hint})` : `Progreso: ${percent}%`}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-ink-muted">{percent}%</span>
    </div>
  );
}

export const PROGRESS_HINT = "sin tareas todavía";
