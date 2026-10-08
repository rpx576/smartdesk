import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { z } from "zod";
import { zonedDay } from "@/lib/dates";
import { formatDate, formatDayHeading, formatTimeRange, personLabel } from "@/lib/format";
import { getAppContext } from "@/server/auth/organization-context";
import { canModifyEvent } from "@/server/auth/permissions";
import { EVENT_CONFLICT_MESSAGE } from "@/server/domain/calendar-event";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { ConfirmDeleteButton } from "../../_components/confirm-delete-button";
import { AlertIcon, ArrowLeftIcon, LockIcon, PencilIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { Notice } from "../../_components/notice";
import { buttonClass, Card, CardHeader, EmptyState } from "../../_components/ui";
import { EventTypeBadge } from "../_components/calendar-items";
import { deleteCalendarEvent } from "../actions";
import { noticeMessage } from "../form-data";
import { calendarHref } from "../view-model";

export const metadata: Metadata = { title: "Evento · SmartDesk" };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm text-ink sm:col-span-2 sm:mt-0">
        {children ?? <span className="text-ink-subtle">—</span>}
      </dd>
    </div>
  );
}

const linkClass = "font-medium text-accent hover:underline";

export default async function EventDetailPage({ params, searchParams }: PageProps<"/calendar/[eventId]">) {
  const { eventId } = await params;
  if (!z.uuid().safeParse(eventId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  let event;
  let conflicts;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    event = await calendarEventService.get(user, organization.id, eventId);
    conflicts = await calendarEventService.conflicts(user, organization.id, event);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="Sin acceso a este evento"
          description="Tu rol en esta organización no permite consultar el calendario."
        />
      </Card>
    );
  }

  // UI hint only; the server authorizes edit/delete again.
  const canModify = canModifyEvent(organization.role, user.id, event);
  const notice = noticeMessage((await searchParams).notice);
  const day = zonedDay(event.startDateTime);

  return (
    <>
      {notice && <Notice message={notice} />}
      <Link
        href={calendarHref({ view: "week", date: day })}
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4" />
        Calendario
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{event.title}</h1>
            <EventTypeBadge type={event.type} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            <time dateTime={event.startDateTime.toISOString()}>{formatDayHeading(day)}</time>
            {" · "}
            {formatTimeRange(event.startDateTime, event.endDateTime, event.allDay)}
          </p>
        </div>
        {canModify && (
          <div className="flex gap-2">
            <Link href={`/calendar/${event.id}/edit`} className={buttonClass.secondary}>
              <PencilIcon className="size-4" />
              Editar
            </Link>
            <ConfirmDeleteButton
              action={deleteCalendarEvent}
              fields={{ eventId: event.id, date: day }}
              itemName={event.title}
              title="¿Eliminar este evento?"
              confirmLabel="Eliminar evento"
            />
          </div>
        )}
      </div>

      {conflicts.length > 0 && (
        <div
          role="status"
          className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
        >
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold">{EVENT_CONFLICT_MESSAGE}</p>
            <p className="mt-0.5">El responsable tiene a la misma hora:</p>
            <ul className="mt-1 list-disc pl-5">
              {conflicts.map((conflict) => (
                <li key={conflict.id}>
                  <Link href={`/calendar/${conflict.id}`} className="font-medium underline">
                    {conflict.title}
                  </Link>{" "}
                  ({formatTimeRange(conflict.startDateTime, conflict.endDateTime, false)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card className="min-w-0">
        <CardHeader title="Detalle" />
        <dl className="divide-y divide-line">
          <Field label="Descripción">
            {event.description && <p className="whitespace-pre-line">{event.description}</p>}
          </Field>
          <Field label="Fecha">{formatDayHeading(day)}</Field>
          <Field label="Horario">{formatTimeRange(event.startDateTime, event.endDateTime, event.allDay)}</Field>
          <Field label="Ubicación">{event.location}</Field>
          <Field label="Responsable">{personLabel(event.assignedTo)}</Field>
          <Field label="Cliente">
            {event.client && (
              <Link href={`/clients/${event.client.id}`} className={linkClass}>
                {event.client.name}
              </Link>
            )}
          </Field>
          <Field label="Proyecto">
            {event.project && (
              <Link href={`/projects/${event.project.id}`} className={linkClass}>
                {event.project.name}
              </Link>
            )}
          </Field>
          <Field label="Tarea">
            {event.task && (
              <Link href={`/tasks/${event.task.id}`} className={linkClass}>
                {event.task.title}
              </Link>
            )}
          </Field>
          <Field label="Creado">
            {formatDate(event.createdAt)}
            {event.createdBy && <span className="text-ink-muted"> · por {personLabel(event.createdBy)}</span>}
          </Field>
          <Field label="Última actualización">{formatDate(event.updatedAt)}</Field>
        </dl>
      </Card>
    </>
  );
}
