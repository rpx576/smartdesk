import Link from "next/link";
import { publicConfig } from "@/config/env";
import { BRAND, COMPANY_LINKS, LEGAL_LINKS, PHONE_DISPLAY, PHONE_HREF, SERVICE_LINKS, whatsappUrl } from "@/content/site";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/60">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Footer of every page: brand, contact channels, services, company and legal links. */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Advanthor, ir al inicio" className="inline-block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
            <Logo size={40} />
          </Link>
          <p className="mt-4 max-w-xs text-sm">{BRAND.tagline}. {BRAND.subheadline}</p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded hover:text-white">
                <WhatsAppIcon className="size-4 text-emerald-400" /> WhatsApp {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={PHONE_HREF} className="inline-flex items-center gap-2 rounded hover:text-white">
                <PhoneIcon className="size-4 text-blue-400" /> {PHONE_DISPLAY}
              </a>
            </li>
            {publicConfig.contactEmail && (
              <li>
                <a href={`mailto:${publicConfig.contactEmail}`} className="inline-flex items-center gap-2 rounded hover:text-white">
                  <MailIcon className="size-4 text-blue-400" /> {publicConfig.contactEmail}
                </a>
              </li>
            )}
          </ul>
        </div>
        <Column title="Servicios" links={SERVICE_LINKS} />
        <Column title="Empresa" links={COMPANY_LINKS} />
        <Column title="Legal" links={LEGAL_LINKS} />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs sm:px-6">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
