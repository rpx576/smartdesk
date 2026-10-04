import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { initials, roleLabels } from "@/lib/format";
import type { AppContext } from "@/server/auth/organization-context";
import { LogoutIcon } from "./icons";
import { NavLinks } from "./nav-links";
import { OrganizationSwitcher } from "./organization-switcher";

export function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-ink">
        S
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">SmartDesk</span>
    </Link>
  );
}

/** Sidebar content, shared by the desktop rail and the mobile drawer. */
export function SidebarContent({ user, organization, organizations }: AppContext) {
  return (
    <div className="flex h-full flex-col gap-5 px-3 py-4">
      <div className="px-2 pr-12 lg:pr-2">
        <Logo />
      </div>

      {organization && (
        <OrganizationSwitcher active={organization} organizations={organizations} />
      )}

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Principal</p>
          <NavLinks group="main" label="Navegación principal" />
        </div>
        <div className="mt-auto flex flex-col gap-1.5 border-t border-line pt-4">
          <NavLinks group="secondary" label="Configuración" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted"
          aria-hidden="true"
        >
          {initials(user.name, user.email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{user.name ?? user.email}</p>
          <p className="truncate text-xs text-ink-muted">
            {organization ? roleLabels[organization.role] : user.email}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg p-1.5 text-ink-subtle outline-none hover:bg-surface-muted hover:text-danger focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
