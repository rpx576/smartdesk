export const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export type Project = {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  /** Calendar dates (no time), stored as UTC midnight. */
  startDate: Date | null;
  dueDate: Date | null;
  budget: number | null;
  estimatedHours: number | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: { id: string; name: string };
  /** The user who created the project; shown as the person in charge for now. */
  createdBy: { id: string; name: string | null; email: string } | null;
  /**
   * Completion percentage. There is no tasks module yet, so it is always 0:
   * nothing is invented. It will be derived from the project's tasks later.
   */
  progress: number;
};

export type ProjectCreateData = {
  clientId: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
  budget?: number | null;
  estimatedHours?: number | null;
};

export type ProjectUpdateData = Partial<ProjectCreateData>;

export type ProjectListFilter = {
  /** Matches the project name or its client's name. */
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  page: number;
  pageSize: number;
};
