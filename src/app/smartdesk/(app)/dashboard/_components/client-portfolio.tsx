import { clientStatusLabels, formatNumber } from "@/lib/format";
import type { ClientStatus, ClientSummary } from "@/server/domain/client";
import { Card, CardHeader } from "../../_components/ui";

/** Display order: most relevant status first. */
const STATUS_ORDER: ClientStatus[] = ["ACTIVE", "LEAD", "INACTIVE"];

const barColors = {
  ACTIVE: "bg-accent",
  LEAD: "bg-amber-400",
  INACTIVE: "bg-ink-subtle/50",
} as const;

/** Distribution of the organization's clients by status (real data). */
export function ClientPortfolio({ summary }: { summary: ClientSummary }) {
  const { total, byStatus } = summary;

  return (
    <Card>
      <CardHeader title="Cartera de clientes" description="Distribución por estado" />
      <div className="px-5 py-4">
        {total === 0 ? (
          <p className="text-sm text-ink-muted">Sin clientes todavía.</p>
        ) : (
          <>
            <div
              className="flex h-2.5 overflow-hidden rounded-full bg-surface-muted"
              role="img"
              aria-label={STATUS_ORDER.map((s) => `${clientStatusLabels[s]}: ${byStatus[s]}`).join(", ")}
            >
              {STATUS_ORDER.map((status) =>
                byStatus[status] > 0 ? (
                  <div
                    key={status}
                    className={barColors[status]}
                    style={{ width: `${(byStatus[status] / total) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {STATUS_ORDER.map((status) => (
                <div key={status}>
                  <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className={`size-2 rounded-full ${barColors[status]}`} aria-hidden="true" />
                    {clientStatusLabels[status]}
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold text-ink tabular-nums">
                    {formatNumber(byStatus[status])}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </Card>
  );
}
