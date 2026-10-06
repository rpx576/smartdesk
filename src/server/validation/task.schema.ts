import { z } from "zod";
import { TASK_PRIORITIES, TASK_SORTS, TASK_STATUSES } from "@/server/domain/task";
import {
  calendarDate,
  datesOrder,
  dueBeforeStart,
  optionalDate,
  optionalFilter,
  optionalHours,
  optionalText,
  tooLong,
} from "./common";

const taskFields = {
  title: z
    .string({ error: "El título es obligatorio" })
    .trim()
    .min(1, "El título es obligatorio")
    .max(200, tooLong(200)),
  description: optionalText(5000),
  projectId: z.uuid({ error: "Selecciona un proyecto" }),
  assigneeId: z.uuid({ error: "Selecciona un responsable" }),
  status: z.enum(TASK_STATUSES, { error: "Selecciona un estado válido" }),
  priority: z.enum(TASK_PRIORITIES, { error: "Selecciona una prioridad válida" }),
  startDate: optionalDate,
  dueDate: optionalDate,
  estimatedHours: optionalHours,
  actualHours: optionalHours,
};

export const taskCreateSchema = z
  .strictObject({
    ...taskFields,
    description: taskFields.description.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    startDate: taskFields.startDate.optional(),
    dueDate: taskFields.dueDate.optional(),
    estimatedHours: taskFields.estimatedHours.optional(),
    actualHours: taskFields.actualHours.optional(),
  })
  .refine((data) => !dueBeforeStart(data.startDate, data.dueDate), datesOrder);

export const taskUpdateSchema = z
  .strictObject({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    projectId: taskFields.projectId.optional(),
    assigneeId: taskFields.assigneeId.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    startDate: taskFields.startDate.optional(),
    dueDate: taskFields.dueDate.optional(),
    estimatedHours: taskFields.estimatedHours.optional(),
    actualHours: taskFields.actualHours.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Indica al menos un campo")
  // Only checkable here when both dates come in; the service checks against stored values.
  .refine((data) => !dueBeforeStart(data.startDate, data.dueDate), datesOrder);

/** Single-field changes from the task page (status, priority, assignee). */
export const taskStatusSchema = z.strictObject({ status: taskFields.status });
export const taskPrioritySchema = z.strictObject({ priority: taskFields.priority });
export const taskAssigneeSchema = z.strictObject({ assigneeId: taskFields.assigneeId });

export const taskListQuerySchema = z.object({
  search: optionalFilter(z.string().trim().max(200)),
  status: optionalFilter(z.enum(TASK_STATUSES)),
  priority: optionalFilter(z.enum(TASK_PRIORITIES)),
  projectId: optionalFilter(z.uuid()),
  assigneeId: optionalFilter(z.uuid()),
  dueFrom: optionalFilter(calendarDate),
  dueTo: optionalFilter(calendarDate),
  sort: optionalFilter(z.enum(TASK_SORTS)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
