"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, format, getDictionary, switchLocaleHref, type Locale } from "@/i18n";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "./icons";

/**
 * Language selector: a button that opens a small glass menu with one option
 * per language. The options are real links, each going to the same page in
 * that language (or to its home when the page is not translated yet), so every
 * version can be shared and `hrefLang` tells search engines what each one is.
 * Closes with Esc, a click outside, or choosing a language; arrow keys move
 * between options.
 */
export function LanguageSwitcher({ locale, className = "" }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  const { language } = getDictionary(locale);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  // Remember the page where it was opened: navigating to another page closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpenAt(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAt(null);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function moveFocus(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
    const at = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "ArrowDown" ? at + 1 : at - 1;
    items[(next + items.length) % items.length]?.focus();
  }

  return (
    <div ref={root} className={`relative shrink-0 ${className}`}>
      <button
        ref={button}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${language.label}: ${language.names[locale]}`}
        onClick={() => setOpenAt(open ? null : pathname)}
        className="sh-lang-btn group inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-2.5 pr-2 text-xs font-semibold text-slate-100 outline-none backdrop-blur transition-colors hover:border-blue-400/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400/60 aria-expanded:border-blue-400/50 aria-expanded:bg-blue-500/10"
      >
        <GlobeIcon aria-hidden="true" className="size-4 text-blue-300 transition-transform duration-500 group-hover:rotate-[30deg] group-aria-expanded:rotate-[30deg]" />
        <span lang={locale}>{language.short[locale]}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3.5 text-slate-400 transition-transform duration-300 group-aria-expanded:rotate-180"
        />
      </button>

      {open && (
        <div
          id={menuId}
          className="sh-lang-menu absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 origin-top-right max-sm:fixed max-sm:inset-x-4 max-sm:top-[4.25rem] max-sm:w-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-blue-500/10 backdrop-blur-xl"
        >
          <p className="px-3 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-widest text-slate-500">
            {language.label}
          </p>
          <ul onKeyDown={moveFocus} className="grid gap-0.5">
            {LOCALES.map((target) => {
              const active = target === locale;
              return (
                <li key={target}>
                  <Link
                    href={switchLocaleHref(pathname, target)}
                    hrefLang={target}
                    lang={target}
                    aria-current={active ? "true" : undefined}
                    aria-label={format(language.switchTo, { language: language.names[target] })}
                    onClick={() => setOpenAt(null)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                      active ? "bg-blue-500/15 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-8 shrink-0 place-items-center rounded-lg text-[0.7rem] font-bold tracking-wide ${
                        active ? "bg-blue-600 text-white shadow shadow-blue-600/40" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      {language.short[target]}
                    </span>
                    <span className="flex-1 font-medium">{language.names[target]}</span>
                    {active && <CheckIcon aria-hidden="true" className="size-4 text-blue-300" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
