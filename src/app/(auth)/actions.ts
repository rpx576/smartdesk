"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { safeNext } from "@/lib/redirect";
import { signIn, signOut } from "@/server/auth/auth";
import { ConflictError } from "@/server/errors/app-error";
import { accountService } from "@/server/services/account.service";
import { accountSchema, loginSchema } from "@/server/validation/auth.schema";

export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Submitted values (never the password) so the form can be refilled. */
      values?: Record<string, string>;
    }
  | undefined;

/** Echo back what the user typed, minus the password. */
function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (key !== "password" && !key.startsWith("$") && typeof value === "string") values[key] = value;
  }
  return values;
}

/**
 * SmartHub sign-in, shared by every product. Users land on their account page,
 * or back in SmartDesk when the form asks for it; `safeNext` only accepts
 * SmartDesk paths, so the target can never point to another site.
 */
async function signInWithCredentials(
  email: string,
  password: string,
  values: Record<string, string>,
  redirectTo: string,
): Promise<FormState> {
  try {
    // On success this throws Next's redirect, which must propagate.
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Email o contraseña incorrectos", values };
    throw error;
  }
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const values = submittedValues(formData);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  return signInWithCredentials(parsed.data.email, parsed.data.password, values, safeNext(formData.get("next")));
}

/** SmartHub sign-up: creates the account only; SmartDesk adds the organization later. */
export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const values = submittedValues(formData);
  const parsed = accountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  try {
    await accountService.register(parsed.data);
  } catch (error) {
    if (error instanceof ConflictError) return { error: "Ya existe una cuenta con este email", values };
    throw error;
  }

  return signInWithCredentials(parsed.data.email, parsed.data.password, values, safeNext(formData.get("next")));
}

/** Signs out of SmartHub, and with it of every product. */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
