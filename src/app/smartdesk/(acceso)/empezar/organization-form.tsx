"use client";

import { useActionState } from "react";
import { AccessError, AccessField, AccessSubmit } from "@/app/_access/access-field";
import { BuildingIcon } from "@/app/_access/access-icons";
import { createOrganization } from "../actions";

export function OrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <AccessError message={state?.error} />
      <AccessField
        label="Nombre de la empresa"
        name="organizationName"
        autoComplete="organization"
        icon={BuildingIcon}
        placeholder="Mi empresa S.L."
        errors={state?.fieldErrors?.organizationName}
        defaultValue={state?.values?.organizationName}
      />
      <AccessSubmit pending={pending} label="Empezar con SmartDesk" pendingLabel="Creando empresa…" />
    </form>
  );
}
