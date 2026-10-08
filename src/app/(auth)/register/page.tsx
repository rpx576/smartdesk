import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ACCOUNT_HOME, safeNext } from "@/lib/redirect";
import { getSessionUser } from "@/server/auth/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta · SmartHub" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Crear cuenta SmartHub</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Con esta cuenta entrarás en SmartDesk y en el resto de productos.
        </p>
      </div>
      <RegisterForm next={next} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link href={next === ACCOUNT_HOME ? "/login" : "/login?next=" + next} className="font-medium underline">
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
