"use client";

import { useActionState } from "react";
import { FormError, FormField, submitClass } from "@/app/(auth)/form-field";
import { createOrganization } from "../actions";

export function OrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormField
        label="Nombre de la empresa"
        name="organizationName"
        autoComplete="organization"
        errors={state?.fieldErrors?.organizationName}
        defaultValue={state?.values?.organizationName}
      />
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Creando empresa…" : "Empezar con SmartDesk"}
      </button>
    </form>
  );
}
