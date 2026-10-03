import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta · SmartDesk" };

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Crear cuenta de empresa</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Serás el administrador de la nueva organización.
        </p>
      </div>
      <RegisterForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium underline">
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
