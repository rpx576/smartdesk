"use client";

import { useEffect } from "react";
import { AlertIcon } from "./_components/icons";
import { buttonClass, Card, EmptyState } from "./_components/ui";

/** Error boundary for app pages; the sidebar and header stay usable. */
export default function AppError({
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
    <Card>
      <div role="alert">
        <EmptyState
          tone="danger"
          icon={AlertIcon}
          title="No hemos podido cargar esta sección"
          description={
            <>
              Ha ocurrido un error inesperado. Vuelve a intentarlo en unos segundos.
              {error.digest && (
                <span className="mt-2 block font-mono text-xs text-ink-subtle">Referencia: {error.digest}</span>
              )}
            </>
          }
          action={
            <button type="button" onClick={() => retry()} className={buttonClass.primary}>
              Reintentar
            </button>
          }
        />
      </div>
    </Card>
  );
}
