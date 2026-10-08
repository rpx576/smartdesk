import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Crea tu empresa en SmartDesk</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Entras con tu cuenta SmartHub ({user.email}). Serás el administrador de la nueva organización.
        </p>
      </div>
      <OrganizationForm />
    </>
  );
}
