import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { clientStatusLabels } from "@/lib/format";
import type { ClientStatus } from "@/server/domain/client";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 id={id} className="text-sm font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Centered message for empty, restricted or failed sections. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
}: {
  icon: IconType;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span
        className={`mb-4 grid size-11 place-items-center rounded-full ${
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-surface-muted text-ink-subtle"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <div className="mt-1 max-w-sm text-sm text-ink-muted">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const statusStyles: Record<ClientStatus, string> = {
  ACTIVE: "bg-accent-soft text-accent",
  LEAD: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  INACTIVE: "bg-surface-muted text-ink-muted",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {clientStatusLabels[status]}
    </span>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink-subtle">
      Próximamente
    </span>
  );
}

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent",
  ghost:
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-accent outline-none hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent",
} as const;

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass.ghost}>
      {children}
    </Link>
  );
}

/** Pulsing placeholder block for loading skeletons. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-muted ${className}`} />;
}
