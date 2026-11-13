import Link from "next/link";
import { quoteHref, whatsappUrl } from "@/content/site";
import { WhatsAppIcon } from "./icons";
import { primaryButton, whatsappButton } from "./ui";

/** Final call to action of a page: quote request and WhatsApp. */
export function CtaBand({ title, text, service }: { title: string; text: string; service?: string }) {
  return (
    <section aria-labelledby="cta-final" className="relative overflow-hidden py-20 sm:py-24">
      <span aria-hidden="true" className="sh-blob pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-blue-700/25 blur-3xl" />
      <span aria-hidden="true" className="sh-blob pointer-events-none absolute -right-40 bottom-0 size-[28rem] rounded-full bg-cyan-500/15 blur-3xl [animation-delay:-7s]" />
      <div data-reveal className="relative mx-auto max-w-4xl rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-950/80 via-slate-900/80 to-slate-950 px-6 py-12 text-center shadow-2xl shadow-blue-950/40 sm:px-12">
        <h2 id="cta-final" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 max-sm:[&>*]:flex-1">
          <Link href={quoteHref(service)} className={primaryButton}>
            Pedir presupuesto
          </Link>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={whatsappButton}>
            <WhatsAppIcon className="size-5" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
