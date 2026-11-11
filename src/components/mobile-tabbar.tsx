"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { COMPANY_LINKS, LEGAL_LINKS, SERVICE_LINKS, quoteHref, whatsappUrl } from "@/content/site";
import { BookIcon, ChevronDownIcon, CloseIcon, DotsIcon, FileIcon, GridIcon, HomeTabIcon, MailIcon, UsersIcon, WhatsAppIcon } from "./icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type Tab = { href: string; label: string; icon: IconType; match: (path: string) => boolean; external?: boolean };

const tabs: Tab[] = [
  { href: "/", label: "Inicio", icon: HomeTabIcon, match: (p) => p === "/" },
  { href: "/blog", label: "Blog", icon: BookIcon, match: (p) => p.startsWith("/blog") },
  { href: "/contacto", label: "Contacto", icon: MailIcon, match: (p) => p.startsWith("/contacto") || p === "/gracias" },
  { href: whatsappUrl(), label: "WhatsApp", icon: WhatsAppIcon, match: () => false, external: true },
];

type MenuLink = { label: string; text?: string; href: string };
type MenuSection = { id: string; label: string; icon: IconType; items: MenuLink[] };

/** The menu sheet, organised in folding sections. */
const menuSections: MenuSection[] = [
  { id: "servicios", label: "Servicios", icon: GridIcon, items: SERVICE_LINKS.map(({ label, href, description }) => ({ label, href, text: description })) },
  { id: "empresa", label: "Empresa", icon: UsersIcon, items: COMPANY_LINKS },
  { id: "legal", label: "Información legal", icon: FileIcon, items: LEGAL_LINKS },
];

/** Pages reached from the sheet that have no tab of their own: they light up "Menú". */
const moreRoutes = [...SERVICE_LINKS, ...LEGAL_LINKS, { href: "/sobre-nosotros" }].map((link) => link.href);

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";

/**
 * Phone navigation, app style: a floating bar with the main sections and a
 * "Más" sheet for the rest. Only below 768 px (`md:hidden`); larger screens
 * keep the header menu. While it is on screen the page gets bottom padding
 * (`body[data-tabbar]` in globals.css) so nothing hides behind it.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  // The sheet belongs to the page it was opened on, so changing page closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [section, setSection] = useState<string | null>("servicios");

  useEffect(() => {
    document.body.dataset.tabbar = "1";
    return () => {
      delete document.body.dataset.tabbar;
    };
  }, []);

  // Lock the page scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const more = moreRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      more?.focus();
    };
  }, [open]);

  const moreActive = open || moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  return (
    <div className="md:hidden">
      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="sh-fade absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="sh-sheet absolute inset-x-0 bottom-0 rounded-t-3xl border border-b-0 border-white/10 bg-slate-900 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >
            <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-base font-semibold text-white">Menú</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className={`grid size-10 place-items-center rounded-full text-slate-300 active:bg-white/10 ${focusRing}`}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div className="-mx-1 max-h-[calc(100dvh-17rem)] overflow-y-auto overscroll-contain px-1">
              <ul className="flex flex-col gap-2">
                {menuSections.map(({ id, label, icon: SectionIcon, items }) => {
                  const expanded = section === id;
                  return (
                    <li key={id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <h3>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`menu-section-${id}`}
                          onClick={() => setSection(expanded ? null : id)}
                          className={`flex min-h-14 w-full items-center gap-3 px-4 text-left active:bg-white/5 ${focusRing}`}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                            <SectionIcon className="size-[18px]" />
                          </span>
                          <span className="flex-1 text-sm font-semibold text-white">{label}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                            {items.length}
                          </span>
                          <ChevronDownIcon
                            className={`size-5 text-slate-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </h3>
                      <div id={`menu-section-${id}`} className="sh-acc" data-open={expanded} inert={!expanded}>
                        <ul className="flex flex-col gap-1 px-2 pb-2">
                          {items.map(({ label: itemLabel, text, href }) => (
                            <li key={href}>
                              <Link
                                href={href}
                                aria-current={pathname === href ? "page" : undefined}
                                className={`flex min-h-12 flex-col justify-center rounded-xl px-3 py-1.5 active:bg-white/10 ${focusRing}`}
                              >
                                <span className="text-sm font-semibold text-white">{itemLabel}</span>
                                {text && <span className="block truncate text-xs text-slate-400">{text}</span>}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Link
              href={quoteHref()}
              className={`mt-4 flex min-h-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 active:bg-blue-500 ${focusRing}`}
            >
              Pedir presupuesto
            </Link>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-1.5 shadow-2xl shadow-blue-950/60 backdrop-blur-xl"
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon, match, external }) => {
            const active = !open && match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-current={active ? "page" : undefined}
                  className={`sh-tab flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium ${
                    active ? "sh-tab-active text-white" : "text-slate-400 active:text-white"
                  } ${focusRing}`}
                >
                  <Icon className="size-[22px]" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              ref={moreRef}
              type="button"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen(!open)}
              className={`sh-tab flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium ${
                moreActive ? "sh-tab-active text-white" : "text-slate-400 active:text-white"
              } ${focusRing}`}
            >
              <DotsIcon className="size-[22px]" />
              Menú
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
