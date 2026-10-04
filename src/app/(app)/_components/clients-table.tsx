import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Client } from "@/server/domain/client";
import { DeleteClientButton } from "../clients/_components/delete-client-button";
import { ArrowRightIcon, PencilIcon } from "./icons";
import { StatusBadge } from "./ui";

type Props = {
  clients: Client[];
  caption: string;
  /**
   * Which row actions to show. Purely presentational: the server authorizes
   * every edit/delete again, whatever the UI shows.
   */
  actions?: { edit?: boolean; delete?: boolean };
  /** Current list position, so deleting a row returns to the same page. */
  listState?: { search?: string; page?: number };
};

const actionClass =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** Client rows; secondary columns collapse into the name cell on small screens. */
export function ClientsTable({ clients, caption, actions, listState }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-ink-subtle">
            <th scope="col" className="px-5 py-3 font-medium">Nombre</th>
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Email</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Empresa</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Estado</th>
            <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Alta</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {clients.map((client) => (
            <tr key={client.id} className="transition-colors hover:bg-surface-muted/60">
              <td className="w-full max-w-0 px-5 py-3.5 sm:w-auto sm:max-w-none">
                <Link
                  href={`/clients/${client.id}`}
                  className="block truncate rounded font-medium text-ink outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {client.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-muted md:hidden">
                  {client.email ?? client.company ?? "Sin datos de contacto"}
                </p>
                <div className="mt-1.5 sm:hidden">
                  <StatusBadge status={client.status} />
                </div>
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
              <td className="hidden px-5 py-3.5 sm:table-cell">
                <StatusBadge status={client.status} />
              </td>
              <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted lg:table-cell">
                <time dateTime={client.createdAt.toISOString()}>{formatDate(client.createdAt)}</time>
              </td>
              <td className="px-3 py-3.5 text-right sm:px-5">
                <div className="flex items-center justify-end gap-0.5">
                  <Link
                    href={`/clients/${client.id}`}
                    className={`${actionClass} text-accent hover:bg-accent-soft`}
                    aria-label={`Ver ${client.name}`}
                    title="Ver"
                  >
                    <span className={actions?.edit || actions?.delete ? "hidden xl:inline" : ""}>Ver</span>
                    <ArrowRightIcon className="size-4" />
                  </Link>
                  {actions?.edit && (
                    <Link
                      href={`/clients/${client.id}/edit`}
                      className={`${actionClass} text-ink-muted hover:bg-surface-muted hover:text-ink`}
                      aria-label={`Editar ${client.name}`}
                      title="Editar"
                    >
                      <PencilIcon className="size-4" />
                      <span className="hidden xl:inline">Editar</span>
                    </Link>
                  )}
                  {actions?.delete && (
                    <DeleteClientButton
                      variant="icon"
                      clientId={client.id}
                      clientName={client.name}
                      search={listState?.search}
                      page={listState?.page}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
