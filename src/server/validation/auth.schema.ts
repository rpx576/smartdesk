import { z } from "zod";

const email = z.email("Introduce un email válido").max(254).transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email: z.string().trim().pipe(email),
  // No length rules on login: the stored hash is the only authority.
  password: z.string().min(1, "Introduce la contraseña").max(128),
});

export const registerSchema = z.object({
  organizationName: z.string().trim().min(2, "Mínimo 2 caracteres").max(200),
  name: z.string().trim().min(1, "Introduce tu nombre").max(200),
  email: z.string().trim().pipe(email),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .max(128, "La contraseña no puede superar 128 caracteres"),
});

export type LoginInput = z.output<typeof loginSchema>;
export type RegisterInput = z.output<typeof registerSchema>;
