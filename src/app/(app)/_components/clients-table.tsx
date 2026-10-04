import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Client } from "@/server/domain/client";
import { ArrowRightIcon } from "./icons";
import { StatusBadge } from "./ui";

/** Client rows; secondary columns collapse into the name cell on small screens. */
export function ClientsTable({ clients, caption }: { clients: Client[]; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-ink-subtle">
            <th scope="col" className="px-5 py-3 font-medium">Nombre</th>
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Email</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Empresa</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Alta</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {clients.map((client) => (
            <tr key={client.id} className="transition-colors hover:bg-surface-muted/60">
              <td className="max-w-0 px-5 py-3.5 sm:max-w-none">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-ink">{client.name}</span>
                  <StatusBadge status={client.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-muted md:hidden">
                  {client.email ?? client.company ?? "Sin datos de contacto"}
                </p>
              </td>
              <td className="hidden px-5 py-3.5 md:table-cell">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="rounded text-ink-muted outline-none hover:text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {client.email}
                  </a>
                ) : (
                  <span className="text-ink-subtle">—</span>
                )}
              </td>
              <td className="hidden px-5 py-3.5 text-ink-muted lg:table-cell">
                {client.company ?? <span className="text-ink-subtle">—</span>}
              </td>
              <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted sm:table-cell">
                <time dateTime={client.createdAt.toISOString()}>{formatDate(client.createdAt)}</time>
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-accent outline-none hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Ver<span className="sr-only"> {client.name}</span>
                  <ArrowRightIcon className="size-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
