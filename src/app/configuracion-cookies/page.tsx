import type { Metadata } from "next";
import Link from "next/link";
import { ConsentSettings } from "@/components/cookies/consent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Configuración de cookies | Advanthor",
  description: "Elige qué cookies opcionales aceptas en la web de Advanthor.",
  path: "/configuracion-cookies",
  noindex: true,
});

export default function ConfiguracionCookiesPage() {
  return (
    <main className="flex-1 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-white">Configuración de cookies</h1>
        <p className="mt-4 text-lg text-slate-300">
          Elige qué cookies opcionales aceptas. Puedes cambiar de opinión cuando quieras. Más detalles en la{" "}
          <Link href="/politica-de-cookies" className="text-blue-300 underline underline-offset-2 hover:text-white">
            política de cookies
          </Link>
          .
        </p>
        <div className="mt-8">
          <ConsentSettings />
        </div>
      </div>
    </main>
  );
}
