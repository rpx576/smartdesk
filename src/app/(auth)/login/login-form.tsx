"use client";

import { useActionState } from "react";
import { AccessError, AccessField, AccessSubmit } from "@/app/_access/access-field";
import { LockIcon, MailIcon } from "@/app/_access/access-icons";
import { login } from "../actions";

/** SmartHub sign-in form. `next` is where to go afterwards (re-validated on the server). */
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <AccessError message={state?.error} />
      <AccessField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        icon={MailIcon}
        placeholder="tu@empresa.com"
        errors={state?.fieldErrors?.email}
        defaultValue={state?.values?.email}
      />
      <AccessField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        icon={LockIcon}
        errors={state?.fieldErrors?.password}
      />
      <AccessSubmit pending={pending} label="Entrar" pendingLabel="Entrando…" />
    </form>
  );
}
