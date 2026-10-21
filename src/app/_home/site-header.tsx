"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, getDictionary, localizeHref, type Locale } from "@/i18n";
import { CloseIcon, MenuIcon } from "../smartdesk/(app)/_components/icons";
import { ChevronDownIcon, LogoIcon } from "./icons";
import { LanguageSwitcher } from "./language-switcher";
import { MobileTabBar } from "./mobile-tabbar";
import { getNavigation, type MenuItem } from "./navigation";

/** Glass pill with light lines on its edges (`sh-nav-btn` in globals.css). */
const pillClass =
  "sh-nav-btn inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60";

const mobileLinkClass =
  "block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-400/60";

function Badge({ children, title }: { children: string; title?: string }) {
  return (
    <span
      title={title}
      className="rounded-full border border-white/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-400"
    >
      {children}
    </span>
  );
}

/** One option of a dropdown: a link, or a "Pronto"/"Soon" label when the page does not exist yet. */
function DropdownItem({
  item,
  onSelect,
  soon,
  spanishOnly,
}: {
  item: MenuItem;
  onSelect: () => void;
  soon: string;
  spanishOnly: { mark: string; note: string };
}) {
  const content = (
    <>
      <span className="flex items-center gap-2 text-sm font-semibold text-white">
        {item.label}
        {!item.href && <Badge>{soon}</Badge>}
        {item.spanishOnly && <Badge title={spanishOnly.note}>{spanishOnly.mark}</Badge>}
      </span>
      {item.description && <span className="mt-0.5 block text-xs text-slate-400">{item.description}</span>}
    </>
  );
  if (!item.href) {
    return (
      <span aria-disabled="true" className="block cursor-default rounded-lg px-3 py-2.5 opacity-60">
        {content}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className="block rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-blue-500/10 focus-visible:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-400/60"
    >
      {content}
    </Link>
  );
}

/**
 * Website header (dark glass, flows into the hero): logo, main menu with
 * dropdowns (Productos -> SmartDesk opens the management tool), language
 * selector, sign-in buttons and a menu for tablets. Dropdowns close with
 * Escape or a click outside. On phones the bottom bar carries the menu.
 */
export function SiteHeader({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const dict = getDictionary(locale);
  const navigation = getNavigation(locale);
  const spanishOnly = { mark: dict.language.short.es, note: dict.language.spanishOnly };

  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    function onClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu, mobileOpen]);

  const close = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16 md:gap-4">
          <Link
            href={localizeHref(locale, "/")}
            className="flex items-center gap-2 rounded-md text-lg font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          >
            <LogoIcon className="size-7 text-blue-400" />
            SmartHub
          </Link>

          <nav ref={navRef} aria-label={dict.nav.mainAria} className="hidden xl:block">
            <ul className="flex items-center gap-1.5">
              {navigation.map((entry) => (
                <li key={entry.label} className="relative">
                  {entry.items ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={openMenu === entry.label}
                        aria-controls={`menu-${entry.label}`}
                        onClick={() => setOpenMenu(openMenu === entry.label ? null : entry.label)}
                        className={pillClass}
                      >
                        {entry.label}
                        <ChevronDownIcon
                          className={`size-4 transition-transform ${openMenu === entry.label ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openMenu === entry.label && (
                        <ul
                          id={`menu-${entry.label}`}
                          className="sh-pop absolute left-0 top-full z-40 mt-3 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-blue-950/50 backdrop-blur-md"
                        >
                          {entry.items.map((item) => (
                            <li key={item.label}>
                              <DropdownItem item={item} onSelect={close} soon={dict.nav.soon} spanishOnly={spanishOnly} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : entry.href ? (
                    <Link href={entry.href} className={pillClass}>
                      {entry.label}
                      {entry.spanishOnly && <Badge title={spanishOnly.note}>{spanishOnly.mark}</Badge>}
                    </Link>
                  ) : (
                    <span aria-disabled="true" title={dict.nav.comingSoon} className={`${pillClass} cursor-default`}>
                      {entry.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />

            <div className="hidden shrink-0 items-center gap-3 xl:flex">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full border border-blue-400/50 px-4 py-1.5 text-sm font-semibold text-blue-200 outline-none transition-colors hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                {dict.header.login}
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 outline-none transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                {dict.header.start}
              </Link>
            </div>

            {/* Phones: the bottom bar carries the menu, so the top bar only keeps one action. */}
            <Link
              href={localizeHref(locale, "/contacto")}
              className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 outline-none active:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400/60 md:hidden"
            >
              {dict.header.contact}
            </Link>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400/60 max-md:hidden xl:hidden"
            >
              {mobileOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-menu"
            aria-label={dict.nav.mainAria}
            className="sh-pop max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-white/10 bg-slate-950 px-4 pb-6 pt-2 xl:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navigation.map((entry) => (
                <li key={entry.label}>
                  {entry.items ? (
                    <>
                      <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{entry.label}</p>
                      <ul>
                        {entry.items.map((item) => (
                          <li key={item.label}>
                            <DropdownItem item={item} onSelect={close} soon={dict.nav.soon} spanishOnly={spanishOnly} />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : entry.href ? (
                    <Link href={entry.href} onClick={close} className={`${mobileLinkClass} flex items-center gap-2`}>
                      {entry.label}
                      {entry.spanishOnly && <Badge title={spanishOnly.note}>{spanishOnly.mark}</Badge>}
                    </Link>
                  ) : (
                    <span aria-disabled="true" className={`${mobileLinkClass} flex items-center gap-2 opacity-60`}>
                      {entry.label}
                      <Badge>{dict.nav.soon}</Badge>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="rounded-full border border-blue-400/50 px-4 py-2.5 text-center text-sm font-semibold text-blue-200"
              >
                {dict.header.login}
              </Link>
              <Link href="/register" className="rounded-full bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                {dict.header.start}
              </Link>
            </div>
          </nav>
        )}
      </header>
      {/* Outside the header: its backdrop blur would turn the fixed bar into a child of the header. */}
      <MobileTabBar locale={locale} />
    </>
  );
}
