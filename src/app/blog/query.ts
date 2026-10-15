import type { Article, CategoryId } from "./articles";

export type SortId = "recientes" | "antiguas" | "breves";

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "recientes", label: "Más recientes" },
  { id: "antiguas", label: "Más antiguas" },
  { id: "breves", label: "Lectura más breve" },
];

export type BlogQuery = {
  text: string;
  category: CategoryId | "todas";
  sort: SortId;
  onlySaved: boolean;
  saved: ReadonlySet<string>;
};

/** Lower case without accents, so "facturacion" finds "Facturación". */
export function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function matchesText(article: Article, words: string[]): boolean {
  if (words.length === 0) return true;
  const haystack = normalize(
    [article.title, article.summary, article.takeaway, ...article.tags, ...article.sources.map((s) => s.name)].join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

/** Articles that match every filter, in the chosen order. Never mutates the input. */
export function filterArticles(articles: readonly Article[], query: BlogQuery): Article[] {
  const words = normalize(query.text).split(/\s+/).filter(Boolean);
  const result = articles.filter(
    (article) =>
      (query.category === "todas" || article.category === query.category) &&
      (!query.onlySaved || query.saved.has(article.id)) &&
      matchesText(article, words),
  );
  const byDateDesc = (a: Article, b: Article) => b.date.localeCompare(a.date);
  if (query.sort === "antiguas") return result.sort((a, b) => a.date.localeCompare(b.date));
  if (query.sort === "breves") return result.sort((a, b) => a.readMinutes - b.readMinutes || byDateDesc(a, b));
  return result.sort(byDateDesc);
}

export function countByCategory(articles: readonly Article[]): Record<CategoryId, number> {
  const counts: Record<CategoryId, number> = { facturacion: 0, ia: 0, web: 0, seguridad: 0, datos: 0 };
  for (const article of articles) counts[article.category] += 1;
  return counts;
}

const dayFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

function parseDay(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** "7 de octubre de 2026" for a YYYY-MM-DD day. */
export function formatDay(day: string): string {
  return dayFormat.format(parseDay(day));
}

export function formatShortDay(day: string): string {
  return shortFormat.format(parseDay(day));
}

/** Whole days from `today` (YYYY-MM-DD) to `day`; negative when it has passed. */
export function daysUntil(day: string, today: string): number {
  return Math.round((parseDay(day).getTime() - parseDay(today).getTime()) / 86_400_000);
}
