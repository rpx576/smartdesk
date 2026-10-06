import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, parseQuery, route } from "@/server/http/route";
import { taskService } from "@/server/services/task.service";
import { taskCreateSchema, taskListQuerySchema } from "@/server/validation/task.schema";

const paramsSchema = z.object({ organizationId: z.uuid() });

// The organization in the URL is only a selector: the service authorizes the
// caller's membership in it before touching any data.
export const GET = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const filter = parseQuery(request, taskListQuerySchema);

  return Response.json(await taskService.list(user, organizationId, filter));
});

export const POST = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, taskCreateSchema);

  const task = await taskService.create(user, organizationId, data);
  return Response.json({ data: task }, { status: 201 });
});
