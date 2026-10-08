import { Card, Skeleton } from "../../_components/ui";

export default function TaskDetailLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando tarea…</span>
      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="mb-2 h-8 w-72 max-w-full" />
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-line px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-col gap-5 px-5 py-5">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full max-w-lg" />
            ))}
          </div>
        </Card>
        <Card className="h-fit p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-5 h-9 w-full" />
          <Skeleton className="mt-3 h-9 w-full" />
          <Skeleton className="mt-3 h-9 w-full" />
        </Card>
      </div>
    </div>
  );
}
