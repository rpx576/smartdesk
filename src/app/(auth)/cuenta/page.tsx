import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/server/auth/session";
import { logout } from "../actions";
import { submitClass } from "../form-field";

export const metadata: Metadata = { title: "Mi cuenta · SmartHub" };

/** SmartHub account home: one account, every product. */
export default async function AccountPage() {
  const user = await requirePageUser();

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Hola, {user.name ?? user.email}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Has iniciado sesión en SmartHub como {user.email}.</p>
      </div>
      <Link href="/smartdesk" className={submitClass + " text-center"}>
        Abrir SmartDesk
      </Link>
      <form action={logout}>
        <button type="submit" className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400">
          Cerrar sesión
        </button>
      </form>
    </>
  );
}
