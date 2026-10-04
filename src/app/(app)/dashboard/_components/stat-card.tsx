import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ComingSoonBadge } from "../../_components/ui";

type Props = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Omit for modules that do not exist yet. */
  value?: ReactNode;
  footer?: ReactNode;
  href?: string;
  comingSoon?: boolean;
};

export function StatCard({ label, icon: Icon, value, footer, href, comingSoon }: Props) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span
          className={`hidden size-9 shrink-0 place-items-center rounded-lg sm:grid ${
            comingSoon ? "bg-surface-muted text-ink-subtle" : "bg-accent-soft text-accent"
          }`}
        >
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-2">
        {comingSoon ? (
          <div className="flex h-9 items-center">
            <ComingSoonBadge />
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl text-ink tabular-nums">{value}</p>
        )}
      </div>
      {footer && <p className="mt-2 line-clamp-2 text-xs text-ink-muted sm:truncate">{footer}</p>}
    </>
  );

  const base = "block rounded-xl border border-line bg-surface p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";
  if (!href) return <div className={base}>{body}</div>;

  return (
    <Link
      href={href}
      className={`${base} outline-none transition-colors hover:border-accent/40 hover:bg-surface-muted/40 focus-visible:ring-2 focus-visible:ring-accent`}
    >
      {body}
    </Link>
  );
}
