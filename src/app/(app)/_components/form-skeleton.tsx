import { Card, Skeleton } from "./ui";

export function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="mb-6 h-8 w-56" />
      <Card className="grid gap-5 p-5 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={i === 0 || i === 5 ? "sm:col-span-2" : ""}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className={`mt-2 w-full ${i === 5 ? "h-24" : "h-9"}`} />
          </div>
        ))}
      </Card>
    </div>
  );
}
