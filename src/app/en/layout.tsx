import type { ReactNode } from "react";

/**
 * English version of the website (/en). The root layout sets the page
 * language to Spanish, so this wrapper marks its content as English for
 * screen readers and translation tools (`display: contents` keeps the layout untouched).
 */
export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="contents">
      {children}
    </div>
  );
}
