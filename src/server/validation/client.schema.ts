import { z } from "zod";
import { CLIENT_STATUSES } from "@/server/domain/client";

/** Trimmed optional text: "" and null both mean "no value". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .union([z.literal(""), z.email().max(254)])
  .nullish()
  .transform((value) => (value ? value.toLowerCase() : null));

const clientFields = {
  name: z.string().trim().min(1, "Name is required").max(200),
  email: optionalEmail,
  phone: optionalText(50),
  company: optionalText(200),
  notes: optionalText(5000),
  status: z.enum(CLIENT_STATUSES),
};

export const clientCreateSchema = z.strictObject({
  ...clientFields,
  email: clientFields.email.optional(),
  phone: clientFields.phone.optional(),
  company: clientFields.company.optional(),
  notes: clientFields.notes.optional(),
  status: clientFields.status.optional(),
});

export const clientUpdateSchema = z
  .strictObject({
    name: clientFields.name.optional(),
    email: clientFields.email.optional(),
    phone: clientFields.phone.optional(),
    company: clientFields.company.optional(),
    notes: clientFields.notes.optional(),
    status: clientFields.status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const clientListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
