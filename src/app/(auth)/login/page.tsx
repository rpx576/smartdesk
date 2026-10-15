import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLinkClass, accessTextClass, accessTitleClass } from "@/app/_access/styles";
import { ACCOUNT_HOME, safeNext } from "@/lib/redirect";
import { getSessionUser } from "@/server/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión · SmartHub" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={accessTitleClass}>Inicia sesión en SmartHub</h1>
        <p className={accessTextClass}>Una sola cuenta para SmartDesk y el resto de productos.</p>
      </div>
      <LoginForm next={next} />
      <p className="text-sm text-slate-600">
        ¿Aún no tienes cuenta?
        <br />
        <Link href={next === ACCOUNT_HOME ? "/register" : "/register?next=" + next} className={accessLinkClass}>
          Crear cuenta en SmartHub
        </Link>
      </p>
    </>
  );
}
