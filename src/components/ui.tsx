import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "./icons";

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 outline-none transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white";

export const whatsappButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 outline-none transition-colors hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400";

/** Small label above a section title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
      {children}
    </span>
  );
}

/** Title block of a section (eyebrow, h2 and intro). */
export function SectionHeading({
  id,
  eyebrow,
  title,
  text,
  center = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div data-reveal className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-lg text-slate-400">{text}</p>}
    </div>
  );
}

/** Dark section with the standard width and spacing. */
export function Section({ id, labelledBy, children, tone = "base" }: { id?: string; labelledBy: string; children: ReactNode; tone?: "base" | "raised" }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative scroll-mt-20 py-20 sm:py-24 ${tone === "raised" ? "bg-slate-900/40" : ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function CheckList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2.5 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
          <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-cyan-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded text-sm font-semibold text-blue-300 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/60"
    >
      {children}
      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/** Numbered steps (work process). */
export function Steps({ steps }: { steps: readonly { title: string; text: string }[] }) {
  return (
    <ol className="sh-stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
      {steps.map((step, index) => (
        <li key={step.title} data-reveal className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <span aria-hidden="true" className="sh-step-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Frequently asked questions with native disclosure widgets (keyboard and screen reader friendly). */
export function FaqList({ items }: { items: readonly { question: string; answer: string }[] }) {
  return (
    <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
      {items.map((item) => (
        <details key={item.question} className="sh-faq group px-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded py-5 text-left text-base font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
            {item.question}
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-white/15 text-slate-300 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 text-sm leading-relaxed text-slate-400">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
