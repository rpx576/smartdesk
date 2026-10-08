"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon } from "./icons";

/**
 * Success banner shown after a redirect (`?notice=...`). The parameter is
 * removed from the URL so a refresh or a shared link does not repeat it.
 * After a form redirect the page can keep the previous scroll position (long
 * forms on phones), so the banner scrolls itself into view when it is hidden.
 */
export function Notice({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = ref.current;
    if (banner && banner.getBoundingClientRect().top < 0) banner.scrollIntoView({ block: "nearest" });

    const url = new URL(window.location.href);
    if (!url.searchParams.has("notice")) return;
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="status"
      className="mb-5 flex scroll-mt-20 items-center gap-3 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
    >
      <CheckCircleIcon className="size-5 shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="rounded-md p-1 outline-none hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Cerrar aviso"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
