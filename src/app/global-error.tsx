"use client";

import "./globals.css";

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 font-sans text-slate-100">
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-white">La web de Advanthor no está disponible ahora mismo</h1>
          <p className="mt-2 text-sm text-slate-400">Ha ocurrido un error inesperado.</p>
          {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Referencia: {error.digest}</p>}
          <button type="button" onClick={() => retry()} className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
