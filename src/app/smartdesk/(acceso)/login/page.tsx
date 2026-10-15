import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLinkClass, accessTextClass, accessTitleClass } from "@/app/_access/styles";
import { getSessionUser } from "@/server/auth/session";
import { SmartDeskLoginForm } from "./smartdesk-login-form";

export const metadata: Metadata = { title: "Entrar · SmartDesk" };

/** SmartDesk has no sign-up of its own: it signs in with the SmartHub account. */
export default async function SmartDeskLoginPage() {
  if (await getSessionUser()) redirect("/smartdesk");

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={accessTitleClass}>Entra con tu cuenta SmartHub</h1>
        <p className={accessTextClass}>Usa el mismo email y contraseña que en SmartHub.</p>
      </div>
      <SmartDeskLoginForm />
      <p className="text-sm text-slate-600">
        ¿Aún no tienes cuenta SmartHub?
        <br />
        <Link
          href="/register?next=/smartdesk"
          className={accessLinkClass}
        >
          Crear cuenta en SmartHub
        </Link>
      </p>
    </>
  );
}
