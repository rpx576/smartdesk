import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, parseQuery, route } from "@/server/http/route";
import { projectService } from "@/server/services/project.service";
import { projectCreateSchema, projectListQuerySchema } from "@/server/validation/project.schema";

const paramsSchema = z.object({ organizationId: z.uuid() });

export const GET = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const filter = parseQuery(request, projectListQuerySchema);

  return Response.json(await projectService.list(user, organizationId, filter));
});

export const POST = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, projectCreateSchema);

  const project = await projectService.create(user, organizationId, data);
  return Response.json({ data: project }, { status: 201 });
});
