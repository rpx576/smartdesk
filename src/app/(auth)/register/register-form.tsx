"use client";

import { useActionState } from "react";
import { AccessError, AccessField, AccessSubmit } from "@/app/_access/access-field";
import { LockIcon, MailIcon, UserIcon } from "@/app/_access/access-icons";
import { register } from "../actions";

/** SmartHub sign-up form: just the person; organizations are created in each product. */
export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const errors = state?.fieldErrors;
  const values = state?.values;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <AccessError message={state?.error} />
      <AccessField
        label="Tu nombre"
        name="name"
        autoComplete="name"
        icon={UserIcon}
        placeholder="Nombre y apellidos"
        errors={errors?.name}
        defaultValue={values?.name}
      />
      <AccessField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        icon={MailIcon}
        placeholder="tu@empresa.com"
        errors={errors?.email}
        defaultValue={values?.email}
      />
      <AccessField
        label="Contraseña (mínimo 12 caracteres)"
        name="password"
        type="password"
        autoComplete="new-password"
        icon={LockIcon}
        errors={errors?.password}
      />
      <AccessSubmit pending={pending} label="Crear cuenta" pendingLabel="Creando cuenta…" />
    </form>
  );
}
