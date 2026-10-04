import { Card, Skeleton } from "../_components/ui";

export default function ClientsLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando clientes…</span>
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card>
        <div className="border-b border-line px-5 py-4">
          <Skeleton className="h-9 w-full max-w-md" />
        </div>
        <div className="flex flex-col gap-4 px-5 py-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
