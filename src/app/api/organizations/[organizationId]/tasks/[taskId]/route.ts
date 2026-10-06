import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, route } from "@/server/http/route";
import { taskService } from "@/server/services/task.service";
import { taskUpdateSchema } from "@/server/validation/task.schema";

type Params = { organizationId: string; taskId: string };

const paramsSchema = z.object({ organizationId: z.uuid(), taskId: z.uuid() });

export const GET = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, taskId } = parseParams(params, paramsSchema);

  const task = await taskService.get(user, organizationId, taskId);
  return Response.json({ data: task });
});

export const PATCH = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, taskId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, taskUpdateSchema);

  const task = await taskService.update(user, organizationId, taskId, data);
  return Response.json({ data: task });
});

export const DELETE = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, taskId } = parseParams(params, paramsSchema);

  await taskService.delete(user, organizationId, taskId);
  return new Response(null, { status: 204 });
});
