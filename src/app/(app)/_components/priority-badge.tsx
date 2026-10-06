import { projectPriorityLabels } from "@/lib/format";
import type { ProjectPriority } from "@/server/domain/project";
import type { TaskPriority } from "@/server/domain/task";

type Priority = ProjectPriority | TaskPriority;

const priorityDots: Record<Priority, string> = {
  LOW: "bg-ink-subtle/60",
  MEDIUM: "bg-sky-500",
  HIGH: "bg-amber-500",
  CRITICAL: "bg-danger",
};

/** Priority indicator shared by projects and tasks (same scale). */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-muted">
      <span className={`size-2 rounded-full ${priorityDots[priority]}`} aria-hidden="true" />
      {projectPriorityLabels[priority]}
    </span>
  );
}
