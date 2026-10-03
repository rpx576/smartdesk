"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/server/auth/auth";
import { ConflictError } from "@/server/errors/app-error";
import { authService } from "@/server/services/auth.service";
import { loginSchema, registerSchema } from "@/server/validation/auth.schema";

export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Submitted values (never the password) so the form can be refilled. */
      values?: Record<string, string>;
    }
  | undefined;

/** After sign-in users always land on the dashboard (no user-controlled redirect). */
const AFTER_SIGN_IN = "/dashboard";

/** Echo back what the user typed, minus the password. */
function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (key !== "password" && !key.startsWith("$") && typeof value === "string") values[key] = value;
  }
  return values;
}

async function signInWithCredentials(
  email: string,
  password: string,
  values: Record<string, string>,
): Promise<FormState> {
  try {
    // On success this throws Next's redirect, which must propagate.
    await signIn("credentials", { email, password, redirectTo: AFTER_SIGN_IN });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Email o contraseña incorrectos", values };
    throw error;
  }
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const values = submittedValues(formData);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  return signInWithCredentials(parsed.data.email, parsed.data.password, values);
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const values = submittedValues(formData);
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    await authService.registerOrganization(parsed.data);
  } catch (error) {
    if (error instanceof ConflictError) return { error: "Ya existe una cuenta con este email", values };
    throw error;
  }

  return signInWithCredentials(parsed.data.email, parsed.data.password, values);
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
