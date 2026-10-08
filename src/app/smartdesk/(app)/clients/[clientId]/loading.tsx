import { Card, Skeleton } from "../../_components/ui";

export default function ClientDetailLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando cliente…</span>
      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="mb-6 h-8 w-56" />
      <Card>
        <div className="border-b border-line px-5 py-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-col gap-5 px-5 py-5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-lg" />
          ))}
        </div>
      </Card>
    </div>
  );
}
