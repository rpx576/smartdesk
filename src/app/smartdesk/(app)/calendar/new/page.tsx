import type { Metadata } from "next";
import Link from "next/link";
import { todayIsoDay } from "@/lib/dates";
import { getAppContext } from "@/server/auth/organization-context";
import { calendarCapabilities } from "@/server/auth/permissions";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { isoDay } from "@/server/validation/common";
import { ArrowLeftIcon, LockIcon } from "../../_components/icons";
import { NoOrganization } from "../../_components/no-organization";
import { Card, EmptyState, PageHeader } from "../../_components/ui";
import { EventForm } from "../_components/event-form";
import { createCalendarEvent } from "../actions";
import { calendarHref } from "../view-model";

export const metadata: Metadata = { title: "Nuevo evento · SmartDesk" };

export default async function NewEventPage({ searchParams }: PageProps<"/smartdesk/calendar/new">) {
  const { user, organization } = await getAppContext();
  if (!organization) return <NoOrganization />;

  // The create action is authorized again by the service.
  if (!calendarCapabilities(organization.role).canCreate) {
    return (
      <Card>
        <EmptyState
          icon={LockIcon}
          title="No puedes crear eventos"
          description="Tu rol en esta organización no permite usar el calendario."
        />
      </Card>
    );
  }

  const options = await calendarEventService.formOptions(user, organization.id);
  const params = await searchParams;
  // `?date=` and `?projectId=` (from the calendar or a project page) only
  // preselect values the user can already see; the server re-validates on submit.
  const date = isoDay.safeParse(params.date);
  const project = options.projects.find((p) => p.id === params.projectId);
  const day = date.success ? date.data : todayIsoDay();
  const backHref = project ? `/smartdesk/projects/${project.id}#calendario` : calendarHref({ view: "week", date: day });

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded text-sm font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon className="size-4 shrink-0" />
        <span className="truncate">{project ? project.name : "Calendario"}</span>
      </Link>
      <PageHeader
        title="Nuevo evento"
        description={`Se añadirá al calendario de ${organization.name}. Los campos con * son obligatorios.`}
      />
      <EventForm
        action={createCalendarEvent}
        options={options}
        initial={{
          date: day,
          startTime: "09:00",
          endTime: "10:00",
          // Default: the creator is in charge, if their role can be.
          assignedToId: options.assignees.some((a) => a.id === user.id) ? user.id : "",
          projectId: project?.id ?? "",
          clientId: project?.clientId ?? "",
        }}
        submitLabel="Crear evento"
        pendingLabel="Creando…"
        cancelHref={backHref}
      />
    </div>
  );
}
