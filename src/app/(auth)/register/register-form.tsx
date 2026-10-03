"use client";

import { useActionState } from "react";
import { register } from "../actions";
import { FormError, FormField, submitClass } from "../form-field";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const errors = state?.fieldErrors;
  const values = state?.values;

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormField
        label="Nombre de la empresa"
        name="organizationName"
        autoComplete="organization"
        errors={errors?.organizationName}
        defaultValue={values?.organizationName}
      />
      <FormField
        label="Tu nombre"
        name="name"
        autoComplete="name"
        errors={errors?.name}
        defaultValue={values?.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        errors={errors?.email}
        defaultValue={values?.email}
      />
      <FormField
        label="Contraseña (mínimo 12 caracteres)"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={errors?.password}
      />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
