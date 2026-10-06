import { z } from "zod";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/server/domain/project";
import {
  datesOrder,
  dueBeforeStart,
  optionalAmount,
  optionalDate,
  optionalFilter,
  optionalHours,
  optionalText,
  tooLong,
} from "./common";

export { DUE_BEFORE_START, dueBeforeStart } from "./common";

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
  estimatedHours: optionalHours,
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

export const projectListQuerySchema = z.object({
  search: optionalFilter(z.string().trim().max(200)),
  status: optionalFilter(z.enum(PROJECT_STATUSES)),
  priority: optionalFilter(z.enum(PROJECT_PRIORITIES)),
  clientId: optionalFilter(z.uuid()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
