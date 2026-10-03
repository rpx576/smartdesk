import { requireSessionUser } from "@/server/auth/session";
import { route } from "@/server/http/route";
import { organizationService } from "@/server/services/organization.service";

export const GET = route(async (request) => {
  const user = await requireSessionUser(request);
  const organizations = await organizationService.listForUser(user);
  return Response.json({ data: organizations });
});
