"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "./icons";

/**
 * Off-canvas navigation for small screens, built on the native <dialog>
 * element (focus trapping, Escape to close and inert background for free).
 */
export function MobileNav({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close the drawer once a link has navigated somewhere else.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="-ml-1.5 rounded-lg p-1.5 text-ink-muted outline-none hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        aria-label="Abrir menú de navegación"
        aria-haspopup="dialog"
      >
        <MenuIcon className="size-6" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Navegación"
        onClick={(event) => {
          // A click on the backdrop targets the <dialog> element itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40 lg:hidden"
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-ink-muted outline-none hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar menú"
          >
            <CloseIcon className="size-5" />
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}
