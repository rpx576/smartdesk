import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accessTextClass, accessTitleClass } from "@/app/_access/styles";
import { requirePageUser } from "@/server/auth/session";
import { organizationService } from "@/server/services/organization.service";
import { OrganizationForm } from "./organization-form";

export const metadata: Metadata = { title: "Empezar · SmartDesk" };

/** First visit of a SmartHub account to SmartDesk: create its organization. */
export default async function StartPage() {
  const user = await requirePageUser("/smartdesk/login");
  const organizations = await organizationService.listForUser(user);
  if (organizations.length > 0) redirect("/smartdesk/dashboard");

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={accessTitleClass}>Crea tu empresa en SmartDesk</h1>
        <p className={accessTextClass}>
          Entras con tu cuenta SmartHub ({user.email}). Serás el administrador de la nueva organización.
        </p>
      </div>
      <OrganizationForm />
    </>
  );
}
