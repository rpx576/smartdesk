"use client";

import { useActionState, useRef } from "react";
import { AlertIcon, TrashIcon } from "./icons";
import { buttonClass } from "./ui";

type DeleteState = { error?: string } | undefined;

type Props = {
  action: (state: DeleteState, formData: FormData) => Promise<DeleteState>;
  /** Hidden fields sent with the request (ids, list position). */
  fields: Record<string, string | number | undefined>;
  /** Name of the record, shown in bold in the confirmation. */
  itemName: string;
  /** E.g. "¿Eliminar este proyecto?" */
  title: string;
  /** E.g. "Eliminar proyecto" */
  confirmLabel: string;
  /** What else disappears with the record. */
  consequence?: string;
  /** "icon" for table rows, "button" for detail pages. */
  variant?: "icon" | "button";
};

const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-danger px-3.5 py-2 text-sm font-medium text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-70 dark:text-black";

/**
 * Destructive action behind an explicit confirmation dialog: Cancel has the
 * initial focus, Escape closes it (except while deleting) and the confirm
 * button is disabled while the request runs. Only rendered for roles allowed
 * to delete, but the server rejects everyone else regardless.
 */
export function ConfirmDeleteButton({
  action,
  fields,
  itemName,
  title,
  confirmLabel,
  consequence = "Esta acción no se puede deshacer.",
  variant = "button",
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);
  const key = Object.values(fields).filter(Boolean).join("-");
  const titleId = `delete-title-${key}`;
  const descriptionId = `delete-description-${key}`;

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-ink-muted outline-none hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger"
          aria-label={`Eliminar ${itemName}`}
          title="Eliminar"
        >
          <TrashIcon className="size-4" />
          <span className="hidden 2xl:inline">Eliminar</span>
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
          {Object.entries(fields).map(([name, value]) =>
            value === undefined || value === "" ? null : (
              <input key={name} type="hidden" name={name} value={value} />
            ),
          )}

          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
              <AlertIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold text-ink">
                {title}
              </h2>
              <p id={descriptionId} className="mt-1.5 text-sm text-ink-muted">
                Se eliminará <strong className="font-semibold text-ink">{itemName}</strong>. {consequence}
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
                <span
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
              )}
              {pending ? "Eliminando…" : confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
