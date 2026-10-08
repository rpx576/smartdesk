"use client";

import { usePathname } from "next/navigation";
import { findNavItem } from "./navigation";

/** Title of the current section, derived from the navigation config. */
export function HeaderTitle() {
  const item = findNavItem(usePathname());
  return (
    <p className="truncate text-base font-semibold text-ink sm:text-lg">{item?.label ?? "SmartDesk"}</p>
  );
}
