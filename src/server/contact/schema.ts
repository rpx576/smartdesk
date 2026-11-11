import { z } from "zod";
import { BUDGETS, DEADLINES, MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, REQUEST_TYPES, SERVICE_OPTIONS } from "@/content/contact-options";

export { BUDGETS, DEADLINES, REQUEST_TYPES, SERVICE_OPTIONS, serviceLabel } from "@/content/contact-options";

type Keys<T> = [keyof T & string, ...(keyof T & string)[]];
const keys = <T extends object>(object: T) => Object.keys(object) as Keys<T>;
const serviceIds = SERVICE_OPTIONS.map((option) => option.id) as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

/**
 * Body of POST /api/contacto. Strict: unknown fields are rejected. The
 * honeypot (`website`) must be empty and `startedAt` is when the form was
 * shown, to reject submissions made faster than a person can type.
 */
export const contactSchema = z.strictObject({
  requestType: z.enum(keys(REQUEST_TYPES)),
  service: z.enum(serviceIds),
  name: z.string().trim().min(1, "Escribe tu nombre.").max(NAME_MAX, `Máximo ${NAME_MAX} caracteres.`),
  company: optionalText(120),
  email: z.string().trim().max(254).pipe(z.email({ message: "Revisa el correo electrónico." })),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d][\d\s().-]{5,}$/, "Revisa el teléfono (o déjalo vacío).")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  budget: z.enum(keys(BUDGETS)).optional(),
  deadline: z.enum(keys(DEADLINES)).optional(),
  plan: optionalText(40),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres).`)
    .max(MESSAGE_MAX, `Máximo ${MESSAGE_MAX} caracteres.`),
  privacy: z.literal(true, { message: "Necesitamos que aceptes la política de privacidad para responderte." }),
  website: z.string().max(200).optional(),
  startedAt: z.number().int().nonnegative(),
  turnstileToken: z.string().max(2048).optional(),
});

export type ContactInput = z.output<typeof contactSchema>;
