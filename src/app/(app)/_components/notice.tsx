"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, CloseIcon } from "./icons";

/**
 * Success banner shown after a redirect (`?notice=...`). The parameter is
 * removed from the URL so a refresh or a shared link does not repeat it.
 */
export function Notice({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("notice")) return;
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-5 flex items-center gap-3 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
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
