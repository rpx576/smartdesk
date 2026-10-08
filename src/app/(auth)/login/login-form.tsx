"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { FormError, FormField, submitClass } from "../form-field";

/** SmartHub sign-in form. `next` is where to go afterwards (re-validated on the server). */
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormError message={state?.error} />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        errors={state?.fieldErrors?.email}
        defaultValue={state?.values?.email}
      />
      <FormField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        errors={state?.fieldErrors?.password}
      />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
