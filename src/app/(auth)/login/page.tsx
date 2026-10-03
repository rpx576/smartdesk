import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión · SmartDesk" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <>
      <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Iniciar sesión</h1>
      <LoginForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Tu empresa aún no usa SmartDesk?{" "}
        <Link href="/register" className="font-medium underline">
          Crear cuenta
        </Link>
      </p>
    </>
  );
}
