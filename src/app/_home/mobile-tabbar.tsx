"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { DEFAULT_LOCALE, getDictionary, localizeHref, type Dictionary, type Locale } from "@/i18n";
import { CloseIcon } from "../smartdesk/(app)/_components/icons";
import {
  BookIcon,
  BotIcon,
  ChartIcon,
  ChevronDownIcon,
  DeskIcon,
  DotsIcon,
  GlobeIcon,
  GridIcon,
  HomeTabIcon,
  MailIcon,
  RocketIcon,
} from "./icons";
import { SMARTAI_HREF, SMARTDESK_HREF, SMARTWEB_HREF } from "./navigation";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type Tab = { href: string; label: string; icon: IconType; match: (path: string) => boolean };

function buildTabs(locale: Locale, dict: Dictionary): Tab[] {
  return [
    { href: localizeHref(locale, "/"), label: dict.nav.home, icon: HomeTabIcon, match: (p) => p === "/" || p === "/en" },
    { href: "/soluciones", label: dict.nav.solutions, icon: GridIcon, match: (p) => p.startsWith("/soluciones") },
    { href: SMARTAI_HREF, label: dict.nav.smartai.label, icon: BotIcon, match: (p) => p.startsWith("/smartai") },
    { href: "/blog", label: dict.nav.blog, icon: BookIcon, match: (p) => p.startsWith("/blog") },
  ];
}

type MenuLink = { label: string; text: string; icon: IconType; href?: string; spanishOnly?: boolean };
type MenuSection = { id: string; label: string; icon: IconType; items: MenuLink[] };

/** The menu sheet: everything, organised in folding sections. A link without href is not built yet ("Pronto"/"Soon"). */
function buildSections(locale: Locale, dict: Dictionary): MenuSection[] {
  const { nav, tabs } = dict;
  const spanishOnly = locale !== DEFAULT_LOCALE;
  return [
    {
      id: "productos",
      label: tabs.sections.products,
      icon: GridIcon,
      items: [
        { label: nav.smartdesk.label, text: tabs.texts.smartdesk, icon: DeskIcon, href: SMARTDESK_HREF, spanishOnly },
        { label: nav.smartai.label, text: tabs.texts.smartai, icon: BotIcon, href: SMARTAI_HREF, spanishOnly },
        { label: nav.smartweb.label, text: tabs.texts.smartweb, icon: GlobeIcon, href: SMARTWEB_HREF, spanishOnly },
      ],
    },
    {
      id: "recursos",
      label: tabs.sections.resources,
      icon: BookIcon,
      items: [
        { label: nav.blog, text: tabs.texts.blog, icon: BookIcon, href: "/blog", spanishOnly },
        { label: nav.pricing, text: tabs.texts.pricing, icon: ChartIcon },
      ],
    },
    {
      id: "empresa",
      label: tabs.sections.company,
      icon: RocketIcon,
      items: [
        { label: nav.idea, text: tabs.texts.idea, icon: RocketIcon, href: localizeHref(locale, "/#idea") },
        { label: nav.contact, text: tabs.texts.contact, icon: MailIcon, href: localizeHref(locale, "/contacto") },
        { label: nav.about, text: tabs.texts.about, icon: GlobeIcon },
      ],
    },
  ];
}

/** Pages reached from the sheet that have no tab of their own: they light up "Más". */
const moreRoutes = [SMARTDESK_HREF, SMARTWEB_HREF, "/contacto", "/en/contacto"];

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";

/**
 * Phone navigation, app style: a floating bar with the main sections and a
 * "Más" sheet for the rest. Only below 768 px (`md:hidden`); larger screens
 * keep the header menu. While it is on screen the page gets bottom padding
 * (`body[data-tabbar]` in globals.css) so nothing hides behind it.
 */
export function MobileTabBar({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const pathname = usePathname();
  const dict = getDictionary(locale);
  const tabs = buildTabs(locale, dict);
  const menuSections = buildSections(locale, dict);
  // The sheet belongs to the page it was opened on, so changing page closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [section, setSection] = useState<string | null>("productos");

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

  const moreActive = open || moreRoutes.some((route) => pathname.startsWith(route));

  return (
    <div className="md:hidden">
      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            tabIndex={-1}
            aria-label={dict.tabs.closeMenu}
            onClick={() => setOpen(false)}
            className="sh-fade absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.tabs.menuAria}
            className="sh-sheet absolute inset-x-0 bottom-0 rounded-t-3xl border border-b-0 border-white/10 bg-slate-900 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >
            <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-base font-semibold text-white">{dict.tabs.menuTitle}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.tabs.close}
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
                          {items.map(({ label: itemLabel, text, icon: ItemIcon, href, spanishOnly }) => {
                            const body = (
                              <>
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-800 text-blue-300">
                                  <ItemIcon className="size-[18px]" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                    {itemLabel}
                                    {!href && (
                                      <span className="rounded-full border border-white/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        {dict.nav.soon}
                                      </span>
                                    )}
                                    {href && spanishOnly && (
                                      <span
                                        title={dict.language.spanishOnly}
                                        className="rounded-full border border-white/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-400"
                                      >
                                        {dict.language.short.es}
                                      </span>
                                    )}
                                  </span>
                                  <span className="block truncate text-xs text-slate-400">{text}</span>
                                </span>
                              </>
                            );
                            return (
                              <li key={itemLabel}>
                                {href ? (
                                  <Link
                                    href={href}
                                    className={`flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 active:bg-white/10 ${focusRing}`}
                                  >
                                    {body}
                                  </Link>
                                ) : (
                                  <span aria-disabled="true" className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 opacity-60">
                                    {body}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className={`flex min-h-12 items-center justify-center rounded-full border border-blue-400/50 text-sm font-semibold text-blue-200 active:bg-blue-500/10 ${focusRing}`}
              >
                {dict.header.login}
              </Link>
              <Link
                href="/register"
                className={`flex min-h-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 active:bg-blue-500 ${focusRing}`}
              >
                {dict.header.start}
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label={dict.tabs.aria}
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-1.5 shadow-2xl shadow-blue-950/60 backdrop-blur-xl"
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon, match }) => {
            const active = !open && match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
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
              {dict.tabs.more}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
