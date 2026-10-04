"use client";

import "./globals.css";

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center bg-canvas px-4 font-sans">
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-ink">SmartDesk no está disponible</h1>
          <p className="mt-2 text-sm text-ink-muted">Ha ocurrido un error inesperado.</p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-ink-subtle">Referencia: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-hover"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
