import { es, type Dictionary } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import type { Locale } from "./config";

export type { Dictionary } from "./dictionaries/es";
export * from "./config";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Replaces `{name}` placeholders: format("Max {max}", { max: 80 }) → "Max 80". Unknown placeholders stay as they are. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
