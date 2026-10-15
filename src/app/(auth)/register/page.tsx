import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLinkClass, accessTextClass, accessTitleClass } from "@/app/_access/styles";
import { ACCOUNT_HOME, safeNext } from "@/lib/redirect";
import { getSessionUser } from "@/server/auth/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta · SmartHub" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={accessTitleClass}>Crea tu cuenta SmartHub</h1>
        <p className={accessTextClass}>Con esta cuenta entrarás en SmartDesk y en el resto de productos.</p>
      </div>
      <RegisterForm next={next} />
      <p className="text-sm text-slate-600">
        ¿Ya tienes cuenta?
        <br />
        <Link href={next === ACCOUNT_HOME ? "/login" : "/login?next=" + next} className={accessLinkClass}>
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
