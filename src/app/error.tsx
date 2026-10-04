"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Catches failures in layouts below the root (e.g. the
 * app shell cannot load the session because the database is down), which the
 * `(app)/error.tsx` boundary cannot handle because it sits inside that layout.
 */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center bg-canvas px-4 py-16 font-sans">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      >
        <p className="text-sm font-semibold text-accent">SmartDesk</p>
        <h1 className="mt-3 text-lg font-semibold text-ink">El servicio no está disponible ahora mismo</h1>
        <p className="mt-2 text-sm text-ink-muted">
          No hemos podido cargar la aplicación. Vuelve a intentarlo en unos segundos.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-subtle">Referencia: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink outline-none hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
