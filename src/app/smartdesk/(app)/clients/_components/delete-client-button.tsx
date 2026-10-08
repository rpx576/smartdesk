"use client";

import { useActionState, useRef } from "react";
import { AlertIcon, TrashIcon } from "../../_components/icons";
import { buttonClass } from "../../_components/ui";
import { deleteClient } from "../actions";

type Props = {
  clientId: string;
  clientName: string;
  /** "icon" for table rows, "button" for the detail page. */
  variant?: "icon" | "button";
  /** List position to come back to after deleting from the list. */
  search?: string;
  page?: number;
};

const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-danger px-3.5 py-2 text-sm font-medium text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-70 dark:text-black";

/**
 * Delete action behind an explicit confirmation dialog. Only rendered for
 * roles allowed to delete, but the server rejects everyone else regardless.
 */
export function DeleteClientButton({ clientId, clientName, variant = "button", search, page }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(deleteClient, undefined);
  const titleId = `delete-title-${clientId}`;
  const descriptionId = `delete-description-${clientId}`;

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-ink-muted outline-none hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger"
          aria-label={`Eliminar ${clientName}`}
          title="Eliminar"
        >
          <TrashIcon className="size-4" />
          <span className="hidden xl:inline">Eliminar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className={`${buttonClass.secondary} text-danger hover:bg-danger-soft`}
        >
          <TrashIcon className="size-4" />
          Eliminar
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-left text-ink shadow-xl backdrop:bg-black/40"
      >
        <form action={formAction} className="p-6">
          <input type="hidden" name="clientId" value={clientId} />
          {search && <input type="hidden" name="search" value={search} />}
          {page && page > 1 && <input type="hidden" name="page" value={page} />}

          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
              <AlertIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold text-ink">
                ¿Eliminar este cliente?
              </h2>
              <p id={descriptionId} className="mt-1.5 text-sm text-ink-muted">
                Se eliminará <strong className="font-semibold text-ink">{clientName}</strong> y todos sus datos.
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {state?.error && (
            <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {state.error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {/* Cancel gets initial focus so Enter never deletes by accident. */}
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
              className={buttonClass.secondary}
            >
              Cancelar
            </button>
            <button type="submit" disabled={pending} className={dangerButton}>
              {pending && (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              )}
              {pending ? "Eliminando…" : "Eliminar cliente"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
