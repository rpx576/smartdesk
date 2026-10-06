import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, route } from "@/server/http/route";
import { projectService } from "@/server/services/project.service";
import { projectUpdateSchema } from "@/server/validation/project.schema";

type Params = { organizationId: string; projectId: string };

const paramsSchema = z.object({ organizationId: z.uuid(), projectId: z.uuid() });

export const GET = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, projectId } = parseParams(params, paramsSchema);

  const project = await projectService.get(user, organizationId, projectId);
  return Response.json({ data: project });
});

export const PATCH = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, projectId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, projectUpdateSchema);

  const project = await projectService.update(user, organizationId, projectId, data);
  return Response.json({ data: project });
});

export const DELETE = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, projectId } = parseParams(params, paramsSchema);

  await projectService.delete(user, organizationId, projectId);
  return new Response(null, { status: 204 });
});
