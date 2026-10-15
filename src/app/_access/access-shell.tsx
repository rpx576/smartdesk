import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { AccessBackground } from "./access-background";
import "./access.css";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type AccessHighlight = { icon: Icon; label: string; tile: string };

type AccessShellProps = {
  /** Product name in two parts: "Smart" + accent ("Hub", "Desk"). */
  accent: string;
  eyebrow: string;
  tagline: string;
  description: string;
  highlights: AccessHighlight[];
  mark: Icon;
  subtitle: string;
  children: ReactNode;
};

/**
 * Layout of the account screens (SmartHub and SmartDesk): animated background,
 * product pitch on the left (desktop only) and a glass card with the form.
 */
export function AccessShell({
  accent,
  eyebrow,
  tagline,
  description,
  highlights,
  mark: Mark,
  subtitle,
  children,
}: AccessShellProps) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 items-center font-sans text-slate-900">
      <AccessBackground />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 lg:px-8">
        <section className="sd-rise hidden lg:block" aria-label={"Smart" + accent}>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-blue-600/80">{eyebrow}</p>
          <p className="mt-4 text-6xl font-bold tracking-tight text-slate-950">
            Smart<span className="text-blue-600">{accent}</span>
          </p>
          <p className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight text-slate-900">{tagline}</p>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-slate-600">{description}</p>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map(({ icon: HighlightIcon, label, tile }) => (
              <li key={label} className="flex items-center gap-4 text-[15px] text-slate-800">
                <span className={"grid size-10 place-items-center rounded-xl " + tile}>
                  <HighlightIcon className="size-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <main className="sd-rise sd-rise--late w-full rounded-3xl border border-white/70 bg-white/75 p-7 shadow-[0_24px_80px_-24px_rgba(37,56,140,0.35)] backdrop-blur-xl sm:p-10">
          <Link
            href="/"
            className="flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={"Smart" + accent + ", ir al inicio"}
          >
            <Mark className="size-12" />
            <span className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-slate-950">
                Smart<span className="text-blue-600">{accent}</span>
              </span>
              <span className="text-sm text-slate-500">{subtitle}</span>
            </span>
          </Link>
          <div className="mt-8 flex flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
