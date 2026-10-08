import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getAppContext } from "@/server/auth/organization-context";
import { canModifyEvent } from "@/server/auth/permissions";
import { ForbiddenError, NotFoundError } from "@/server/errors/app-error";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { ArrowLeftIcon, LockIcon } from "../../../_components/icons";
import { NoOrganization } from "../../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../../_components/ui";
import { EventForm } from "../../_components/event-form";
import { updateCalendarEvent } from "../../actions";
import { eventToFormValues } from "../../form-data";

export const metadata: Metadata = { title: "Editar evento · SmartDesk" };

const forbidden = (
  <Card>
    <EmptyState
      icon={LockIcon}
      title="No puedes editar este evento"
      description="Solo puedes modificar los eventos que has creado o que tienes asignados."
    />
  </Card>
);

const noCalendarAccess = (
  <Card>
    <EmptyState
      icon={LockIcon}
      title="Sin acceso al calendario"
      description="Tu rol en esta organización no permite consultar el calendario."
    />
  </Card>
);

export default async function EditEventPage({ params }: PageProps<"/smartdesk/calendar/[eventId]/edit">) {
  const { eventId } = await params;
  if (!z.uuid().safeParse(eventId).success) notFound();

  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  let event;
  let options;
  try {
    // Scoped to the active organization: another tenant's id resolves to 404.
    [event, options] = await Promise.all([
      calendarEventService.get(user, organization.id, eventId),
      calendarEventService.formOptions(user, organization.id),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    // Reading already failed: the role has no access to the calendar at all.
    if (error instanceof ForbiddenError) return noCalendarAccess;
    throw error;
  }
  // UI hint only: the update action is authorized again by the service.
  if (!canModifyEvent(organization.role, user.id, event)) return forbidden;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/smartdesk/calendar/${event.id}`}
        className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4 shrink-0" />
        <span className="truncate">{event.title}</span>
      </Link>
      <PageHeader title="Editar evento" description="Los campos con * son obligatorios." />
      <EventForm
        // The id is bound here but re-validated and re-authorized by the action.
        action={updateCalendarEvent.bind(null, event.id)}
        options={options}
        initial={eventToFormValues(event)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
        cancelHref={`/smartdesk/calendar/${event.id}`}
      />
    </div>
  );
}
