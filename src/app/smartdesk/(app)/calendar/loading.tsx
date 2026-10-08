import { Card, Skeleton } from "../_components/ui";

export default function CalendarLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando calendario…</span>
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
        <div className="border-b border-line px-5 py-3">
          <Skeleton className="h-9 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-7 gap-px p-1">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-none sm:h-24" />
          ))}
        </div>
      </Card>
    </div>
  );
}
