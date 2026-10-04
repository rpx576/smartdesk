import type { ClientStatus } from "@/server/domain/client";
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
