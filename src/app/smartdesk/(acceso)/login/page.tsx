import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { getSessionUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Entrar · SmartDesk" };

/** SmartDesk has no sign-up of its own: it signs in with the SmartHub account. */
export default async function SmartDeskLoginPage() {
  if (await getSessionUser()) redirect("/smartdesk");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Entra con tu cuenta SmartHub</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Usa el mismo email y contraseña que en SmartHub.
        </p>
      </div>
      <LoginForm next="/smartdesk" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Aún no tienes cuenta SmartHub?{" "}
        <Link href="/register?next=/smartdesk" className="font-medium underline">
          Crear cuenta en SmartHub
        </Link>
      </p>
    </>
  );
}
