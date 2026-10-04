import type { ReactNode } from "react";
import { initials, roleLabels } from "@/lib/format";
import type { AppContext } from "@/server/auth/organization-context";
import { HeaderTitle } from "./header-title";
import { BellIcon } from "./icons";
import { MobileNav } from "./mobile-nav";

type Props = Pick<AppContext, "user" | "organization"> & { mobileNav: ReactNode };

export function AppHeader({ user, organization, mobileNav }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <MobileNav>{mobileNav}</MobileNav>
      <div className="min-w-0 flex-1">
        <HeaderTitle />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Placeholder until the notifications module exists. */}
        <button
          type="button"
          disabled
          aria-label="Notificaciones (próximamente)"
          title="Notificaciones: próximamente"
          className="rounded-lg p-2 text-ink-subtle disabled:cursor-not-allowed"
        >
          <BellIcon className="size-5" />
        </button>

        <div className="h-6 w-px bg-line" aria-hidden="true" />

        <div className="flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
            aria-hidden="true"
          >
            {initials(user.name, user.email)}
          </span>
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="max-w-40 truncate text-sm font-medium text-ink">{user.name ?? user.email}</p>
            {organization && (
              <p className="max-w-40 truncate text-xs text-ink-muted">
                {roleLabels[organization.role]} · {organization.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
