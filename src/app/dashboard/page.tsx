import type { Metadata } from "next";
import { logout } from "@/app/(auth)/actions";
import { requirePageUser } from "@/server/auth/session";
import { organizationService } from "@/server/services/organization.service";

export const metadata: Metadata = { title: "Dashboard · SmartDesk" };

const roleLabels = { ADMIN: "Administrador", EMPLOYEE: "Empleado", CLIENT: "Cliente" } as const;

export default async function DashboardPage() {
  const user = await requirePageUser();
  const organizations = await organizationService.listForUser(user);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] bg-white px-6 py-4 dark:border-white/[.145] dark:bg-zinc-950">
        <span className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">SmartDesk</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{user.name ?? user.email}</span>
          <form action={logout}>
            <button type="submit" className="font-medium underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Hola, {user.name ?? user.email}
        </h1>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Tus organizaciones</h2>
          {organizations.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Todavía no perteneces a ninguna organización.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {organizations.map((org) => (
                <li
                  key={org.id}
                  className="flex items-center justify-between rounded-lg border border-black/[.08] bg-white px-4 py-3 dark:border-white/[.145] dark:bg-zinc-950"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{org.name}</span>
                  <span className="text-sm text-zinc-500">{roleLabels[org.role]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
