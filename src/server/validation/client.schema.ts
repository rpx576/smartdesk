import { z } from "zod";
import { CLIENT_STATUSES } from "@/server/domain/client";

// Messages are user-facing (forms) and returned as API validation details.
const tooLong = (max: number) => `Máximo ${max} caracteres`;

/** Trimmed optional text: "" and null both mean "no value". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, tooLong(max))
    .nullish()
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .union(
    [z.literal(""), z.email("Introduce un email válido").max(254, tooLong(254))],
    { error: "Introduce un email válido" },
  )
  .nullish()
  .transform((value) => (value ? value.toLowerCase() : null));

const clientFields = {
  name: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(200, tooLong(200)),
  email: optionalEmail,
  phone: optionalText(50),
  company: optionalText(200),
  notes: optionalText(5000),
  status: z.enum(CLIENT_STATUSES, { error: "Selecciona un estado válido" }),
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
  .refine((data) => Object.keys(data).length > 0, "Indica al menos un campo");

export const clientListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
