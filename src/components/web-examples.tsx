import type { ReactNode } from "react";

/**
 * Illustrative mock-ups of the kinds of website we build. They are drawings,
 * not client projects, and are labelled as such on the page.
 */
function Browser({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-blue-950/40">
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-amber-300/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 h-4 flex-1 rounded-full bg-white/5" />
      </div>
      <div aria-hidden="true" className="p-4">{children}</div>
      <figcaption className="border-t border-white/10 px-4 py-3 text-sm font-semibold text-white">{title}</figcaption>
    </figure>
  );
}

const bar = "block rounded-full bg-white/10";

export function WebExamples() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <Browser title="Web corporativa">
        <div className="rounded-xl bg-gradient-to-br from-blue-600/40 to-cyan-500/20 p-4">
          <span className={`${bar} h-3 w-3/4 bg-white/60`} />
          <span className={`${bar} mt-2 h-2 w-1/2`} />
          <span className="mt-4 inline-block h-5 w-20 rounded-full bg-blue-500" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
      </Browser>
      <Browser title="Tienda online">
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white/5 p-2">
              <span className="block h-10 rounded-md bg-gradient-to-br from-slate-600 to-slate-800" />
              <span className={`${bar} mt-2 h-1.5 w-3/4`} />
              <span className="mt-1.5 flex items-center justify-between">
                <span className={`${bar} h-1.5 w-1/3 bg-cyan-400/60`} />
                <span className="size-3 rounded bg-blue-500" />
              </span>
            </div>
          ))}
        </div>
      </Browser>
      <Browser title="Landing page">
        <div className="text-center">
          <span className={`${bar} mx-auto h-3 w-2/3 bg-white/60`} />
          <span className={`${bar} mx-auto mt-2 h-2 w-1/2`} />
        </div>
        <div className="mx-auto mt-4 max-w-[80%] rounded-lg border border-white/10 bg-white/5 p-3">
          <span className={`${bar} h-4 w-full bg-white/5`} />
          <span className={`${bar} mt-2 h-4 w-full bg-white/5`} />
          <span className="mt-3 block h-5 w-full rounded-full bg-blue-500" />
        </div>
      </Browser>
    </div>
  );
}
