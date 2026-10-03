import { z } from "zod";
import { requireSessionUser } from "@/server/auth/session";
import { parseBody, parseParams, route } from "@/server/http/route";
import { clientService } from "@/server/services/client.service";
import { clientUpdateSchema } from "@/server/validation/client.schema";

type Params = { organizationId: string; clientId: string };

const paramsSchema = z.object({ organizationId: z.uuid(), clientId: z.uuid() });

export const GET = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, clientId } = parseParams(params, paramsSchema);

  const client = await clientService.get(user, organizationId, clientId);
  return Response.json({ data: client });
});

export const PATCH = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, clientId } = parseParams(params, paramsSchema);
  const data = await parseBody(request, clientUpdateSchema);

  const client = await clientService.update(user, organizationId, clientId, data);
  return Response.json({ data: client });
});

export const DELETE = route<Params>(async (request, params) => {
  const user = await requireSessionUser();
  const { organizationId, clientId } = parseParams(params, paramsSchema);

  await clientService.delete(user, organizationId, clientId);
  return new Response(null, { status: 204 });
});
