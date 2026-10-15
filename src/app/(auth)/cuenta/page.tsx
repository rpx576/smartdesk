import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, DeskIcon } from "@/app/_access/access-icons";
import { accessButtonClass, accessTextClass, accessTitleClass } from "@/app/_access/styles";
import { requirePageUser } from "@/server/auth/session";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Mi cuenta · SmartHub" };

/** SmartHub account home: one account, every product. */
export default async function AccountPage() {
  const user = await requirePageUser();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className={accessTitleClass}>Hola, {user.name ?? user.email}</h1>
        <p className={accessTextClass}>Has iniciado sesión en SmartHub como {user.email}.</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
          <DeskIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">SmartDesk</p>
          <p className="text-sm text-slate-600">Clientes, proyectos, tareas y calendario.</p>
        </div>
      </div>

      <Link href="/smartdesk" className={accessButtonClass}>
        Abrir SmartDesk
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <form action={logout}>
        <button
          type="submit"
          className="text-sm font-semibold text-slate-600 underline underline-offset-2 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Cerrar sesión
        </button>
      </form>
    </>
  );
}
