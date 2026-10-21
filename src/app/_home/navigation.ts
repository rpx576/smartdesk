import { barePath, getDictionary, isTranslatedPath, localizeHref, type Locale } from "@/i18n";

/**
 * Main menu of the SmartHub website. The structure lives here and the words
 * in the dictionaries (src/i18n), so every language shows the same menu.
 * An item without `href` is not built yet and is shown as "Pronto"/"Soon".
 */
export type MenuItem = {
  label: string;
  description?: string;
  href?: string;
  /** The page behind the link exists only in Spanish (shown with an "ES" mark in other languages). */
  spanishOnly?: boolean;
};
export type NavEntry = { label: string; href?: string; items?: MenuItem[]; spanishOnly?: boolean };

/** SmartDesk, the management tool: its own section, entered with the SmartHub account. */
export const SMARTDESK_HREF = "/smartdesk";

/** SmartAI, the AI assistant: product page with the live SmartAI Studio. */
export const SMARTAI_HREF = "/smartai";

/** SmartWeb, websites and online shops: product page with the live SmartWeb Studio. */
export const SMARTWEB_HREF = "/smartweb";

type NavKey = "home" | "solutions" | "products" | "pricing" | "blog" | "company" | "contact" | "about" | "idea";
type ProductKey = "smartdesk" | "smartai" | "smartweb";
type Node = { id: NavKey | ProductKey; href?: string; items?: Node[] };

const structure: Node[] = [
  { id: "home", href: "/#inicio" },
  { id: "solutions", href: "/soluciones" },
  {
    id: "products",
    items: [
      { id: "smartdesk", href: SMARTDESK_HREF },
      { id: "smartai", href: SMARTAI_HREF },
      { id: "smartweb", href: SMARTWEB_HREF },
    ],
  },
  { id: "pricing" },
  { id: "blog", href: "/blog" },
  {
    id: "company",
    items: [{ id: "about" }, { id: "idea", href: "/#idea" }, { id: "contact", href: "/contacto" }],
  },
  { id: "contact", href: "/contacto" },
];

/** The menu in a language: words from its dictionary, links to its own pages when they are translated. */
export function getNavigation(locale: Locale): NavEntry[] {
  const nav = getDictionary(locale).nav;
  const link = (href: string | undefined) => ({
    href: href && localizeHref(locale, href),
    spanishOnly: Boolean(href) && locale !== "es" && !isTranslatedPath(barePath(href as string)),
  });

  return structure.map((node) => {
    const word = nav[node.id];
    const label = typeof word === "string" ? word : word.label;
    if (node.items) {
      return {
        label,
        items: node.items.map((item) => {
          const itemWord = nav[item.id];
          return {
            label: typeof itemWord === "string" ? itemWord : itemWord.label,
            description: typeof itemWord === "string" ? undefined : itemWord.description,
            ...link(item.href),
          };
        }),
      };
    }
    return { label, ...link(node.href) };
  });
}
