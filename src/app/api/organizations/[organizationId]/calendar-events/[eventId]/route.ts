import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { conflictWarnings } from "@/server/domain/calendar-event";
import { parseBody, parseParams, route } from "@/server/http/route";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { calendarEventUpdateSchema } from "@/server/validation/calendar-event.schema";

type Params = { organizationId: string; eventId: string };

const paramsSchema = z.object({ organizationId: z.uuid(), eventId: z.uuid() });

export const GET = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, eventId } = parseParams(params, paramsSchema);

  const event = await calendarEventService.get(user, organizationId, eventId);
  return Response.json({ data: event });
});

export const PATCH = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, eventId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, calendarEventUpdateSchema);

  const { event, conflicts } = await calendarEventService.update(user, organizationId, eventId, data);
  return Response.json({ data: event, warnings: conflictWarnings(conflicts) });
});

export const DELETE = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, eventId } = parseParams(params, paramsSchema);

  await calendarEventService.delete(user, organizationId, eventId);
  return new Response(null, { status: 204 });
});
