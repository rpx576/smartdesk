"use client";

import { useEffect } from "react";
import { whatsappUrl } from "@/content/site";

/** Error boundary of the pages: a friendly message instead of a blank screen. */
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div role="alert" className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Algo no ha ido bien</h1>
        <p className="mt-2 text-sm text-slate-400">No hemos podido cargar esta página. Vuelve a intentarlo en unos segundos.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Referencia: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Reintentar
          </button>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
            Avisar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
