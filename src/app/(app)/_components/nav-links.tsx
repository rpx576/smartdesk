"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItem, mainNavigation, secondaryNavigation } from "./navigation";

// Icons are components (functions), which cannot be passed from Server to
// Client Components, so the config is imported here and selected by name.
const groups = { main: mainNavigation, secondary: secondaryNavigation };

export function NavLinks({ group, label }: { group: keyof typeof groups; label: string }) {
  const items = groups[group];
  const activeHref = findNavItem(usePathname())?.href;

  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-0.5">
        {items.map(({ href, label: itemLabel, icon: Icon, comingSoon }) => {
          const active = href === activeHref;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <Icon className={`size-[18px] shrink-0 ${active ? "text-accent" : "text-ink-subtle group-hover:text-ink-muted"}`} />
                <span className="flex-1 truncate">{itemLabel}</span>
                {comingSoon && (
                  <span className="rounded-full border border-line px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-ink-subtle">
                    Pronto
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
