import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ACCOUNT_HOME, safeNext } from "@/lib/redirect";
import { getSessionUser } from "@/server/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión · SmartHub" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Iniciar sesión</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Una sola cuenta SmartHub para SmartDesk y el resto de productos.
        </p>
      </div>
      <LoginForm next={next} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Aún no tienes cuenta?{" "}
        <Link href={next === ACCOUNT_HOME ? "/register" : "/register?next=" + next} className="font-medium underline">
          Crear cuenta
        </Link>
      </p>
    </>
  );
}
