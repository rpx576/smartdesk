import { projectStatusLabels } from "@/lib/format";
import type { Project, ProjectStatus } from "@/server/domain/project";
import { PriorityBadge } from "../../_components/priority-badge";

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

/** Projects and tasks share the same priority scale and badge. */
export const ProjectPriorityBadge = PriorityBadge;

/** Completion bar; `hint` explains where the number comes from. */
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

/** "6 de 10 tareas completadas" (cancelled tasks are not counted) or "sin tareas". */
export function progressHint({ taskStats }: Pick<Project, "taskStats">): string {
  if (taskStats.considered === 0) return "sin tareas";
  return `${taskStats.completed} de ${taskStats.considered} ${taskStats.considered === 1 ? "tarea completada" : "tareas completadas"}`;
}
