import Link from "next/link";
import { primaryButton, secondaryButton } from "@/components/ui";
import { SERVICE_LINKS } from "@/content/site";

/** Custom 404 page (Next.js marks it noindex). */
export default function NotFound() {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-24">
      <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto max-w-xl text-center">
        <p className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-7xl font-extrabold text-transparent">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">No encontramos esta página</h1>
        <p className="mt-4 text-slate-300">Puede que la dirección haya cambiado o que ya no exista. Estos enlaces te pueden ayudar:</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {SERVICE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={primaryButton}>
            Ir al inicio
          </Link>
          <Link href="/contacto" className={secondaryButton}>
            Contactar
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = { title: "Página no encontrada" };
