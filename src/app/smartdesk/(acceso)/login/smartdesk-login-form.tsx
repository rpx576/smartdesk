"use client";

import { useActionState } from "react";
import { login } from "@/app/(auth)/actions";
import { AccessError, AccessField, AccessSubmit } from "@/app/_access/access-field";
import { LockIcon, MailIcon } from "@/app/_access/access-icons";

/** SmartHub sign-in, styled for SmartDesk. Lands back in SmartDesk. */
export function SmartDeskLoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value="/smartdesk" />
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
