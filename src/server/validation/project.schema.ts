import { z } from "zod";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/server/domain/project";

// Messages are user-facing (forms) and returned as API validation details.
const tooLong = (max: number) => `Máximo ${max} caracteres`;

/** "" and null both mean "no value"; strings are trimmed first. */
const blankToNull = (value: unknown) =>
  value === null || (typeof value === "string" && value.trim() === "") ? null : value;

const optionalText = (max: number) =>
  z.preprocess(blankToNull, z.string().trim().max(max, tooLong(max)).nullish()).transform((v) => v ?? null);

/** `YYYY-MM-DD` calendar date → Date at UTC midnight. Rejects impossible dates (e.g. 2026-02-31). */
const optionalDate = z
  .preprocess(
    blankToNull,
    z
      .string({ error: "Introduce una fecha válida" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Introduce una fecha válida")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
      }, "Introduce una fecha válida")
      .transform((value) => new Date(`${value}T00:00:00.000Z`))
      .nullish(),
  )
  .transform((v) => v ?? null);

const hasAtMostTwoDecimals = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;

/**
 * Non-negative amount with at most two decimals. Accepts numbers (API) and
 * strings with a decimal comma or point (forms), e.g. "1500,50".
 */
const optionalAmount = (max: number, label: string) =>
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

const projectFields = {
  name: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, tooLong(200)),
  description: optionalText(5000),
  clientId: z.uuid({ error: "Selecciona un cliente" }),
  status: z.enum(PROJECT_STATUSES, { error: "Selecciona un estado válido" }),
  priority: z.enum(PROJECT_PRIORITIES, { error: "Selecciona una prioridad válida" }),
  startDate: optionalDate,
  dueDate: optionalDate,
  budget: optionalAmount(9_999_999_999.99, "un presupuesto"),
  estimatedHours: optionalAmount(999_999.99, "un número de horas"),
};

export const DUE_BEFORE_START = "La fecha límite no puede ser anterior a la de inicio";

/** True when both dates are set and the due date is earlier. */
export function dueBeforeStart(startDate?: Date | null, dueDate?: Date | null): boolean {
  return Boolean(startDate && dueDate && dueDate.getTime() < startDate.getTime());
}

/**
 * Due date >= start date. `when` makes the check run even if other fields are
 * invalid (Zod skips object refinements by default), as long as both dates parsed,
 * so the user sees every problem in one submit.
 */
const datesOrder = {
  message: DUE_BEFORE_START,
  path: ["dueDate"],
  when: (payload: { issues: readonly { path?: readonly PropertyKey[] }[] }) =>
    !payload.issues.some((issue) => issue.path?.[0] === "startDate" || issue.path?.[0] === "dueDate"),
};

export const projectCreateSchema = z
  .strictObject({
    ...projectFields,
    description: projectFields.description.optional(),
    status: projectFields.status.optional(),
    priority: projectFields.priority.optional(),
    startDate: projectFields.startDate.optional(),
    dueDate: projectFields.dueDate.optional(),
    budget: projectFields.budget.optional(),
    estimatedHours: projectFields.estimatedHours.optional(),
  })
  .refine((data) => !dueBeforeStart(data.startDate, data.dueDate), datesOrder);

export const projectUpdateSchema = z
  .strictObject({
    name: projectFields.name.optional(),
    description: projectFields.description.optional(),
    clientId: projectFields.clientId.optional(),
    status: projectFields.status.optional(),
    priority: projectFields.priority.optional(),
    startDate: projectFields.startDate.optional(),
    dueDate: projectFields.dueDate.optional(),
    budget: projectFields.budget.optional(),
    estimatedHours: projectFields.estimatedHours.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Indica al menos un campo")
  // Only checkable here when both dates come in; the service checks against stored values.
  .refine((data) => !dueBeforeStart(data.startDate, data.dueDate), datesOrder);

/** Empty filter values from GET forms (`?status=`) mean "no filter". */
const optionalFilter = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const projectListQuerySchema = z.object({
  search: optionalFilter(z.string().trim().max(200)),
  status: optionalFilter(z.enum(PROJECT_STATUSES)),
  priority: optionalFilter(z.enum(PROJECT_PRIORITIES)),
  clientId: optionalFilter(z.uuid()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
