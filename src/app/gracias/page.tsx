import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircleIcon, WhatsAppIcon } from "@/components/icons";
import { primaryButton, whatsappButton } from "@/components/ui";
import { whatsappUrl } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Solicitud recibida | Advanthor",
  description: "Hemos recibido tu solicitud y te responderemos lo antes posible.",
  path: "/gracias",
  noindex: true,
});

/** Thank-you page after a successful submission (never indexed). */
export default function GraciasPage() {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-24">
      <div aria-hidden="true" className="sh-stars pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="sh-enter mx-auto max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40">
          <CheckCircleIcon className="size-8" />
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">¡Gracias! Hemos recibido tu solicitud</h1>
        <p className="mt-4 text-lg text-slate-300">
          Revisaremos tu mensaje y te responderemos lo antes posible en el correo o teléfono que nos has indicado. Si es
          urgente, escríbenos por WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={primaryButton}>
            Volver al inicio
          </Link>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={whatsappButton}>
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
