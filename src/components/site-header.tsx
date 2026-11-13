"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { COMPANY_LINKS, SERVICE_LINKS, quoteHref, whatsappUrl } from "@/content/site";
import { ChevronDownIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./logo";
import { MenuButton, MobileMenu } from "./mobile-menu";

/** Glass pill with light lines on its edges (`sh-nav-btn` in globals.css). */
const pillClass =
  "sh-nav-btn inline-flex items-center gap-1 px-3.5 py-1.5 text-sm font-medium text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60";

const ctaClass =
  "whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 outline-none transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400/60";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Website header (dark glass): logo, main menu with the services dropdown,
 * WhatsApp and the quote button. Below 1024 px the menu button unfolds the
 * full-screen menu (`mobile-menu.tsx`). Menus close with Escape, a click
 * outside or a change of page.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  // Each menu belongs to the page it was opened on, so changing page closes it.
  const [mobileAt, setMobileAt] = useState<string | null>(null);
  const servicesOpen = openAt === pathname;
  const mobileOpen = mobileAt === pathname;
  const closeMobile = useCallback(() => setMobileAt(null), []);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!servicesOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenAt(null);
    }
    function onClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenAt(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [servicesOpen]);

  const servicesActive = SERVICE_LINKS.some((link) => isActive(pathname, link.href));

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Advanthor, ir al inicio" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
            <Logo />
          </Link>

          <nav ref={navRef} aria-label="Menú principal" className="hidden lg:block">
            <ul className="flex items-center gap-1.5">
              <li>
                <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={pillClass}>
                  Inicio
                </Link>
              </li>
              <li className="relative">
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="menu-servicios"
                  onClick={() => setOpenAt(servicesOpen ? null : pathname)}
                  className={`${pillClass} ${servicesActive ? "text-white" : ""}`}
                >
                  Servicios
                  <ChevronDownIcon className={`size-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
                {servicesOpen && (
                  <ul
                    id="menu-servicios"
                    className="sh-pop absolute left-0 top-full z-40 mt-3 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-blue-950/50 backdrop-blur-md"
                  >
                    {SERVICE_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpenAt(null)}
                          aria-current={isActive(pathname, link.href) ? "page" : undefined}
                          className="block rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-blue-500/10 focus-visible:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-400/60"
                        >
                          <span className="block text-sm font-semibold text-white">{link.label}</span>
                          <span className="mt-0.5 block text-xs text-slate-400">{link.description}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    className={`${pillClass} ${isActive(pathname, link.href) ? "text-white" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
              title="WhatsApp"
              className="grid size-10 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 outline-none transition-colors hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <Link href={quoteHref()} className={`${ctaClass} max-sm:hidden`}>
              Pedir presupuesto
            </Link>
            <MenuButton open={mobileOpen} onClick={() => setMobileAt(mobileOpen ? null : pathname)} />
          </div>
        </div>
      </header>
      {/* Outside the header: its backdrop blur would make the fixed panel a child of the header. */}
      {mobileOpen && <MobileMenu pathname={pathname} onClose={closeMobile} />}
    </>
  );
}
