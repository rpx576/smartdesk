"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { COMPANY_LINKS, LEGAL_LINKS, PHONE_HREF, SERVICE_LINKS, quoteHref, whatsappUrl } from "@/content/site";
import type { ServiceId } from "@/content/services";
import { ArrowRightIcon, ChevronDownIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { SERVICE_ICONS } from "./service-icon";
import { accentStyle } from "./service-theme";

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Hamburger whose three lines fold into a cross while the menu is open (`sh-burger` in globals.css). */
export function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="menu-movil"
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      onClick={onClick}
      className={`grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden ${focusRing}`}
    >
      <span aria-hidden="true" className="sh-burger" data-open={open}>
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

const rowClass = `sh-menu-row flex min-h-16 w-full items-center justify-between gap-4 px-1 text-left text-2xl font-semibold tracking-tight text-slate-100 aria-[current=page]:text-white ${focusRing}`;

/**
 * Phone and tablet menu: a panel that unfolds from the header like a curtain.
 * A clean list of pages, with the services folded under "Servicios", and the
 * quote button at hand. It locks the page scroll, closes with Escape or a link,
 * and gives the focus back to the menu button.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const servicesId = useId();
  // On a service page the services start unfolded, so the current one is visible.
  const [servicesOpen, setServicesOpen] = useState(() => SERVICE_LINKS.some((link) => isActive(pathname, link.href)));

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      trigger?.focus({ preventScroll: true });
    };
  }, [onClose]);

  // Staggered entrance: each row gets its position in the sequence.
  let step = 0;
  const enter = () => ({ "--i": step++ }) as CSSProperties;

  const [home, ...company] = [{ label: "Inicio", href: "/" }, ...COMPANY_LINKS];

  const pageRow = (link: { label: string; href: string }) => (
    <li key={link.href} style={enter()} className="sh-menu-item border-b border-white/10">
      <Link href={link.href} onClick={onClose} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`group ${rowClass}`}>
        {link.label}
        <ArrowRightIcon className="size-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
      </Link>
    </li>
  );

  return (
    <div
      id="menu-movil"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="sh-menu fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto overscroll-contain lg:hidden"
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
        <nav aria-label="Menú principal">
          <ul className="border-t border-white/10">
            {pageRow(home)}
            <li style={enter()} className="sh-menu-item border-b border-white/10">
              <button type="button" aria-expanded={servicesOpen} aria-controls={servicesId} onClick={() => setServicesOpen(!servicesOpen)} className={rowClass}>
                Servicios
                <ChevronDownIcon className={`size-5 text-slate-400 transition-transform duration-300 ${servicesOpen ? "rotate-180 text-blue-300" : ""}`} />
              </button>
              <div id={servicesId} className="sh-menu-acc" data-open={servicesOpen} inert={!servicesOpen}>
                {/* The folding child carries no padding, so nothing shows while closed. */}
                <div>
                  <ul className="flex flex-col gap-1 pb-4">
                    {SERVICE_LINKS.map((link) => {
                      const Icon = SERVICE_ICONS[link.href.slice(1) as ServiceId];
                      return (
                        <li key={link.href} style={accentStyle(link.href.slice(1) as ServiceId)}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            aria-current={isActive(pathname, link.href) ? "page" : undefined}
                            className={`flex min-h-14 items-center gap-3.5 rounded-2xl px-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/5 aria-[current=page]:bg-white/[0.06] aria-[current=page]:text-white ${focusRing}`}
                          >
                            <span className="acc-chip grid size-9 shrink-0 place-items-center rounded-xl">
                              <Icon className="size-[18px]" />
                            </span>
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
            {company.map(pageRow)}
          </ul>
        </nav>

        <div style={enter()} className="sh-menu-item mt-8 grid gap-2.5">
          <Link
            href={quoteHref()}
            onClick={onClose}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 ${focusRing}`}
          >
            Pedir presupuesto
            <ArrowRightIcon className="size-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={PHONE_HREF}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-white hover:bg-white/5 ${focusRing}`}
            >
              <PhoneIcon className="size-4" />
              Llamar
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
              className={`flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 ${focusRing}`}
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <ul style={enter()} className="sh-menu-item mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-10 text-xs text-slate-500">
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose} className={`rounded hover:text-slate-300 ${focusRing}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
