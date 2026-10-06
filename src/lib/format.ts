import type { ClientStatus } from "@/server/domain/client";
import type { ProjectPriority, ProjectStatus } from "@/server/domain/project";
import type { TaskPriority, TaskSort, TaskStatus } from "@/server/domain/task";
import type { Role } from "@/server/domain/role";

// Fixed locale and time zone so server-rendered dates do not depend on the host.
const LOCALE = "es-ES";
const TIME_ZONE = "Europe/Madrid";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

const hourFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

// Calendar dates (project start/due) are stored as UTC midnight: format them
// in UTC so the day never shifts with the time zone.
const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR" });
const decimalFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

/** Calendar date without time (e.g. a project's due date). */
export function formatDay(date: Date): string {
  return dayFormatter.format(date);
}

/** `YYYY-MM-DD`, the value format of `<input type="date">`. */
export function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatHours(value: number): string {
  return `${decimalFormatter.format(value)} h`;
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planificación",
  ACTIVE: "Activo",
  ON_HOLD: "En pausa",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const projectPriorityLabels: Record<ProjectPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "Pendiente",
  IN_PROGRESS: "En curso",
  IN_REVIEW: "En revisión",
  BLOCKED: "Bloqueada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

/** Same scale as projects. */
export const taskPriorityLabels: Record<TaskPriority, string> = projectPriorityLabels;

export const taskSortLabels: Record<TaskSort, string> = {
  recent: "Más recientes",
  due: "Fecha límite",
  priority: "Prioridad",
};

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** A moment in time (e.g. when a task was completed), in the business time zone. */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** "Ana Admin" or, when the user has no name, their email. */
export function personLabel(person: { name: string | null; email: string } | null): string | null {
  return person ? (person.name ?? person.email) : null;
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** "Domingo, 4 de octubre" (only the first letter capitalised, as in Spanish). */
export function formatLongDate(date: Date): string {
  const text = longDateFormatter.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "1 activo" / "3 activos". */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function greeting(date: Date): string {
  const hour = Number(hourFormatter.format(date));
  if (hour < 6 || hour >= 21) return "Buenas noches";
  if (hour < 14) return "Buenos días";
  return "Buenas tardes";
}

export function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  EMPLOYEE: "Empleado",
  CLIENT: "Cliente",
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  ACTIVE: "Activo",
  LEAD: "Potencial",
  INACTIVE: "Inactivo",
};
