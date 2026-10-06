import { z } from "zod";

/**
 * Building blocks shared by the project and task schemas. Messages are
 * user-facing (forms) and are also returned as API validation details.
 */

export const tooLong = (max: number) => `Máximo ${max} caracteres`;

/** "" and null both mean "no value"; strings are trimmed first. */
export const blankToNull = (value: unknown) =>
  value === null || (typeof value === "string" && value.trim() === "") ? null : value;

export const optionalText = (max: number) =>
  z.preprocess(blankToNull, z.string().trim().max(max, tooLong(max)).nullish()).transform((v) => v ?? null);

const INVALID_DATE = "Introduce una fecha válida";

/** True for a real `YYYY-MM-DD` calendar date (rejects e.g. 2026-02-31). */
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Required `YYYY-MM-DD` calendar date → Date at UTC midnight (no time-zone shifts). */
export const calendarDate = z
  .string({ error: INVALID_DATE })
  .refine(isCalendarDate, INVALID_DATE)
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

/** Optional calendar date: "" / null → null. */
export const optionalDate = z
  .preprocess(blankToNull, calendarDate.nullish())
  .transform((v) => v ?? null);

const hasAtMostTwoDecimals = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;

/**
 * Non-negative amount with at most two decimals. Accepts numbers (API) and
 * strings with a decimal comma or point (forms), e.g. "1500,50".
 */
export const optionalAmount = (max: number, label: string) =>
  z
    .preprocess(
      (value) => {
        const blank = blankToNull(value);
        if (typeof blank !== "string") return blank;
        const normalized = blank.trim().replace(/\s/g, "").replace(",", ".");
        return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
      },
      z
        .number({ error: `Introduce ${label} válido` })
        .refine(Number.isFinite, `Introduce ${label} válido`)
        .min(0, "No puede ser negativo")
        .max(max, `No puede superar ${max.toLocaleString("es-ES")}`)
        .refine(hasAtMostTwoDecimals, "Máximo dos decimales")
        .nullish(),
    )
    .transform((v) => v ?? null);

export const optionalHours = optionalAmount(999_999.99, "un número de horas");

export const DUE_BEFORE_START = "La fecha límite no puede ser anterior a la de inicio";

/** True when both dates are set and the due date is earlier. */
export function dueBeforeStart(startDate?: Date | null, dueDate?: Date | null): boolean {
  return Boolean(startDate && dueDate && dueDate.getTime() < startDate.getTime());
}

/**
 * Refinement options for "due date >= start date". `when` makes the check run
 * even if other fields are invalid (Zod skips object refinements by default),
 * as long as both dates parsed, so the user sees every problem in one submit.
 */
export const datesOrder = {
  message: DUE_BEFORE_START,
  path: ["dueDate"],
  when: (payload: { issues: readonly { path?: readonly PropertyKey[] }[] }) =>
    !payload.issues.some((issue) => issue.path?.[0] === "startDate" || issue.path?.[0] === "dueDate"),
};

/** Empty filter values from GET forms (`?status=`) mean "no filter". */
export const optionalFilter = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
