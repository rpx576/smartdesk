"use client";

import type { OrganizationWithRole } from "@/server/domain/organization";
import { switchOrganization } from "../actions";

type Props = {
  active: OrganizationWithRole;
  organizations: OrganizationWithRole[];
};

/** Shows the current organization; becomes a selector when the user has several. */
export function OrganizationSwitcher({ active, organizations }: Props) {
  if (organizations.length < 2) {
    return (
      <div className="rounded-lg border border-line bg-surface-muted/60 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Organización</p>
        <p className="truncate text-sm font-medium text-ink">{active.name}</p>
      </div>
    );
  }

  return (
    <form action={switchOrganization}>
      <label className="block rounded-lg border border-line bg-surface-muted/60 px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
          Organización
        </span>
        <select
          name="organizationId"
          defaultValue={active.id}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="-ml-1 w-full cursor-pointer truncate bg-transparent text-sm font-medium text-ink outline-none"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
