import { redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth/session";
import { organizationService } from "@/server/services/organization.service";

/** Entry to SmartDesk: SmartHub sign-in, then the first organization, then the app. */
export default async function SmartDeskPage() {
  const user = await requirePageUser("/smartdesk/login");
  const organizations = await organizationService.listForUser(user);
  redirect(organizations.length > 0 ? "/smartdesk/dashboard" : "/smartdesk/empezar");
}
