import { addDays, calendarDateToDay, dayToCalendarDate, todayCalendarDate } from "@/lib/dates";
import { roleHasPermission } from "@/server/auth/permissions";
import type { CalendarTask, UpcomingEvent } from "@/server/domain/calendar-event";
import type { Client, ClientSummary } from "@/server/domain/client";
import type { ProjectStatus } from "@/server/domain/project";
import type { Role } from "@/server/domain/role";
import type { TaskSummary } from "@/server/domain/task";
import type { SessionUser } from "@/server/domain/user";
import {
  calendarEventRepository,
  type CalendarEventRepository,
} from "@/server/repositories/calendar-event.repository";
import { clientRepository, type ClientRepository } from "@/server/repositories/client.repository";
import { projectRepository, type ProjectRepository } from "@/server/repositories/project.repository";
import { taskRepository, type TaskRepository } from "@/server/repositories/task.repository";
import { tenantAccessService, type TenantAccessService } from "./tenant-access.service";

export const RECENT_CLIENTS_LIMIT = 5;
export const AGENDA_LIMIT = 5;
/** Deadlines shown: open tasks due from today to this many days ahead. */
export const DEADLINE_WINDOW_DAYS = 7;

export type DashboardOverview = {
  role: Role;
  /** Null when the caller's role may not read the client directory. */
  clients: (ClientSummary & { recent: Client[] }) | null;
  /** Null when the caller's role may not read projects. */
  projects: Record<ProjectStatus, number> | null;
  /** Null when the caller's role may not read tasks. */
  tasks: TaskSummary | null;
  /**
   * The caller's own agenda: next events they created or are assigned to and,
   * if they may read tasks, their open tasks due soon. Null without calendar access.
   */
  agenda: { events: UpcomingEvent[]; deadlines: CalendarTask[] | null } | null;
};

export function createDashboardService(deps: {
  clientRepository: Pick<ClientRepository, "summary" | "listRecent">;
  projectRepository: Pick<ProjectRepository, "countByStatus">;
  taskRepository: Pick<TaskRepository, "summary" | "listUpcomingDue">;
  calendarEventRepository: Pick<CalendarEventRepository, "listUpcoming">;
  tenantAccess: TenantAccessService;
  today?: () => Date;
  now?: () => Date;
}) {
  const today = deps.today ?? (() => todayCalendarDate());
  const now = deps.now ?? (() => new Date());

  return {
    /**
     * Data for the organization home page. Every member may open it; each
     * widget is only filled in when the member's role grants access to it.
     */
    async getOverview(user: SessionUser, organizationId: string): Promise<DashboardOverview> {
      const tenant = await deps.tenantAccess.authorize(user, organizationId, "organization:read");
      const org = tenant.organizationId;
      const can = (permission: Parameters<typeof roleHasPermission>[1]) => roleHasPermission(tenant.role, permission);

      const todayDate = today();
      const [clients, projects, tasks, events, deadlines] = await Promise.all([
        can("client:read")
          ? Promise.all([
              deps.clientRepository.summary(org),
              deps.clientRepository.listRecent(org, RECENT_CLIENTS_LIMIT),
            ]).then(([summary, recent]) => ({ ...summary, recent }))
          : null,
        can("project:read") ? deps.projectRepository.countByStatus(org) : null,
        can("task:read") ? deps.taskRepository.summary(org, todayDate) : null,
        can("calendar:read")
          ? deps.calendarEventRepository.listUpcoming(org, { from: now(), limit: AGENDA_LIMIT, userId: tenant.userId })
          : null,
        can("calendar:read") && can("task:read")
          ? deps.taskRepository.listUpcomingDue(org, {
              from: todayDate,
              to: dayToCalendarDate(addDays(calendarDateToDay(todayDate), DEADLINE_WINDOW_DAYS)),
              assigneeId: tenant.userId,
              limit: AGENDA_LIMIT,
            })
          : null,
      ]);
      const agenda = events ? { events, deadlines } : null;
      return { role: tenant.role, clients, projects, tasks, agenda };
    },
  };
}

export const dashboardService = createDashboardService({
  clientRepository,
  projectRepository,
  taskRepository,
  calendarEventRepository,
  tenantAccess: tenantAccessService,
});
