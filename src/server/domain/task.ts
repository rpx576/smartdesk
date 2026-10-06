export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "COMPLETED", "CANCELLED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** Work that is still pending (not completed and not cancelled). */
export const OPEN_TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] as const satisfies readonly TaskStatus[];

export function isOpenStatus(status: TaskStatus): boolean {
  return (OPEN_TASK_STATUSES as readonly TaskStatus[]).includes(status);
}

export const TASK_SORTS = ["recent", "due", "priority"] as const;
export type TaskSort = (typeof TASK_SORTS)[number];

export type TaskPerson = { id: string; name: string | null; email: string };

export type Task = {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  createdById: string | null;
  /** Calendar dates (no time), stored as UTC midnight. */
  startDate: Date | null;
  dueDate: Date | null;
  /** When the task became COMPLETED; null otherwise. */
  completedAt: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: Date;
  updatedAt: Date;
  project: { id: string; name: string; client: { id: string; name: string } };
  assignee: TaskPerson;
  createdBy: TaskPerson | null;
};

export type TaskCreateData = {
  projectId: string;
  assigneeId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
};

export type TaskUpdateData = Partial<TaskCreateData>;

/** What the repository persists: the service adds the derived `completedAt`. */
export type TaskWriteData = TaskUpdateData & { completedAt?: Date | null };

export type TaskListFilter = {
  /** Matches the task title or its project's name. */
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  /** Due date range (inclusive), calendar dates. */
  dueFrom?: Date;
  dueTo?: Date;
  sort?: TaskSort;
  page: number;
  pageSize: number;
};

/** Task counts of one project, as used for its progress. */
export type TaskCounts = Record<TaskStatus, number>;

export const emptyTaskCounts = (): TaskCounts => ({
  TODO: 0,
  IN_PROGRESS: 0,
  IN_REVIEW: 0,
  BLOCKED: 0,
  COMPLETED: 0,
  CANCELLED: 0,
});

/**
 * Project progress from its tasks: COMPLETED / (all tasks except CANCELLED).
 * Cancelled tasks are dropped work, so they neither count as done nor as
 * pending; TODO, IN_PROGRESS, IN_REVIEW and BLOCKED count as pending. No
 * tasks (or only cancelled ones) means 0%.
 */
export function computeProgress(counts: TaskCounts): { percent: number; completed: number; considered: number } {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const considered = total - counts.CANCELLED;
  const completed = counts.COMPLETED;
  return { percent: considered > 0 ? Math.round((completed / considered) * 100) : 0, completed, considered };
}

/** Option lists for task forms and filters (members and projects of the organization). */
export type AssigneeOption = { id: string; name: string | null; email: string };
export type ProjectOption = { id: string; name: string; clientName: string };

export type TaskSummary = { open: number; overdue: number; completed: number };
