import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, parseQuery, route } from "@/server/http/route";
import { clientService } from "@/server/services/client.service";
import { clientCreateSchema, clientListQuerySchema } from "@/server/validation/client.schema";

const paramsSchema = z.object({ organizationId: z.uuid() });

export const GET = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser(request);
  const { organizationId } = parseParams(params, paramsSchema);
  const filter = parseQuery(request, clientListQuerySchema);

  return Response.json(await clientService.list(user, organizationId, filter));
});

export const POST = route<{ organizationId: string }>(async (request, params) => {
  const user = await requireSessionUser(request);
  const { organizationId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, clientCreateSchema);

  const client = await clientService.create(user, organizationId, data);
  return Response.json({ data: client }, { status: 201 });
});
