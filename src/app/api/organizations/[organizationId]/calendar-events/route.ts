import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { conflictWarnings } from "@/server/domain/calendar-event";
import { parseBody, parseParams, parseQuery, route } from "@/server/http/route";
import { calendarEventService } from "@/server/services/calendar-event.service";
import { calendarEventCreateSchema, calendarEventListQuerySchema } from "@/server/validation/calendar-event.schema";

const paramsSchema = z.object({ organizationId: z.uuid() });

// The organization in the URL is only a selector: the service authorizes the
// caller's membership in it before touching any data.
export const GET = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const { from, to, ...filter } = parseQuery(request, calendarEventListQuerySchema);

  const { items, truncated } = await calendarEventService.listEvents(user, organizationId, { from, to }, filter);
  return Response.json({ data: items, meta: { from, to, truncated } });
});

export const POST = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, calendarEventCreateSchema);

  const { event, conflicts } = await calendarEventService.create(user, organizationId, data);
  return Response.json({ data: event, warnings: conflictWarnings(conflicts) }, { status: 201 });
});
