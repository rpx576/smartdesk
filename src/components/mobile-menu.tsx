"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { COMPANY_LINKS, LEGAL_LINKS, PHONE_DISPLAY, PHONE_HREF, SERVICE_LINKS, quoteHref, whatsappUrl } from "@/content/site";
import type { ServiceId } from "@/content/services";
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { SERVICE_ICONS } from "./service-icon";

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";

const pages = [{ label: "Inicio", href: "/" }, ...COMPANY_LINKS];

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
      className={`flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 pl-3.5 pr-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 lg:hidden ${focusRing}`}
    >
      <span className="max-[359px]:sr-only">{open ? "Cerrar" : "Menú"}</span>
      <span aria-hidden="true" className="sh-burger" data-open={open}>
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

/**
 * Phone and tablet menu: a panel that unfolds from the header like a curtain.
 * Services as cards with their icon, the company pages as a numbered index,
 * and a contact block with the quote button always at hand. It locks the page
 * scroll, closes with Escape or a link, and gives the focus back to the button.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
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

  // Staggered entrance: each block gets its position in the sequence.
  let step = 0;
  const enter = () => ({ style: { "--i": step++ } as CSSProperties, className: "sh-menu-item" });

  return (
    <div
      id="menu-movil"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="sh-menu fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto overscroll-contain lg:hidden"
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
        <nav aria-label="Menú principal" className="flex flex-col gap-8">
          <section>
            <p {...enter()}>
              <span className="sh-menu-eyebrow">Servicios</span>
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2.5">
              {SERVICE_LINKS.map((link) => {
                const Icon = SERVICE_ICONS[link.href.slice(1) as ServiceId];
                const active = isActive(pathname, link.href);
                const item = enter();
                return (
                  <li key={link.href} style={item.style} className={item.className}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`sh-menu-card flex h-full flex-col gap-3 p-3.5 ${focusRing}`}
                    >
                      <span className="grid size-10 place-items-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block text-[0.95rem] font-semibold leading-tight text-white">{link.label}</span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-snug text-slate-400">{link.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <p {...enter()}>
              <span className="sh-menu-eyebrow">Empresa</span>
            </p>
            <ul className="mt-2 border-t border-white/10">
              {pages.map((link, index) => {
                const active = isActive(pathname, link.href);
                const item = enter();
                return (
                  <li key={link.href} style={item.style} className={`${item.className} border-b border-white/10`}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`sh-menu-row group flex min-h-16 items-center gap-4 px-1 ${focusRing}`}
                    >
                      <span className="w-6 font-mono text-xs text-slate-500 group-aria-[current=page]:text-blue-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-2xl font-semibold tracking-tight text-slate-100 group-aria-[current=page]:text-white">
                        {link.label}
                      </span>
                      <ArrowRightIcon className="size-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-300 group-aria-[current=page]:text-blue-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </nav>

        <div {...enter()} className="sh-menu-item mt-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-5">
            <p className="text-lg font-semibold text-white">¿Hablamos de tu proyecto?</p>
            <p className="mt-1 text-sm text-slate-400">Cuéntanos qué necesitas y te preparamos una propuesta.</p>
            <Link
              href={quoteHref()}
              onClick={onClose}
              className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 ${focusRing}`}
            >
              Pedir presupuesto
              <ArrowRightIcon className="size-4" />
            </Link>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
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
                aria-label="WhatsApp (se abre en una pestaña nueva)"
                className={`flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 ${focusRing}`}
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">{PHONE_DISPLAY}</p>
          </div>
        </div>

        <ul {...enter()} className="sh-menu-item mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-8 text-xs text-slate-500">
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
