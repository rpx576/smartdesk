import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARTICLES, CATEGORIES, KEY_DATES, type Article } from "./articles";
import { countByCategory, daysUntil, filterArticles, formatDay, normalize, type BlogQuery } from "./query";

const base: BlogQuery = { text: "", category: "todas", sort: "recientes", onlySaved: false, saved: new Set() };

const image = { id: "photo-1", alt: "", author: "" };

const sample: Article[] = [
  { id: "a", category: "facturacion", date: "2026-01-10", title: "Verifactu", summary: "", takeaway: "", sources: [], tags: ["AEAT"], readMinutes: 5, image },
  { id: "b", category: "ia", date: "2026-03-01", title: "Agentes de IA", summary: "Atención al cliente", takeaway: "", sources: [{ name: "Gartner", url: "https://example.com" }], tags: [], readMinutes: 2, image },
  { id: "c", category: "ia", date: "2025-12-01", title: "Regulación", summary: "Ley de IA", takeaway: "", sources: [], tags: ["UE"], readMinutes: 2, image },
];

const ids = (articles: Article[]) => articles.map((a) => a.id);

describe("filterArticles", () => {
  it("orders by date, newest first by default", () => {
    assert.deepEqual(ids(filterArticles(sample, base)), ["b", "a", "c"]);
    assert.deepEqual(ids(filterArticles(sample, { ...base, sort: "antiguas" })), ["c", "a", "b"]);
  });

  it("orders short reads first, newest first on ties", () => {
    assert.deepEqual(ids(filterArticles(sample, { ...base, sort: "breves" })), ["b", "c", "a"]);
  });

  it("filters by category and saved articles", () => {
    assert.deepEqual(ids(filterArticles(sample, { ...base, category: "ia" })), ["b", "c"]);
    assert.deepEqual(ids(filterArticles(sample, { ...base, onlySaved: true, saved: new Set(["c"]) })), ["c"]);
  });

  it("searches every word in titles, text, tags and sources, ignoring accents and case", () => {
    assert.deepEqual(ids(filterArticles(sample, { ...base, text: "  GARTNER  atencion " })), ["b"]);
    assert.deepEqual(ids(filterArticles(sample, { ...base, text: "aeat" })), ["a"]);
    assert.deepEqual(ids(filterArticles(sample, { ...base, text: "ia inexistente" })), []);
  });

  it("does not reorder the input", () => {
    const copy = [...sample];
    filterArticles(copy, base);
    assert.deepEqual(ids(copy), ["a", "b", "c"]);
  });
});

describe("helpers", () => {
  it("normalizes accents", () => assert.equal(normalize(" Facturación "), "facturacion"));

  it("counts articles per category", () => {
    assert.deepEqual(countByCategory(sample), { facturacion: 1, ia: 2, web: 0, seguridad: 0, datos: 0 });
  });

  it("formats days in Spanish and counts days between them", () => {
    assert.equal(formatDay("2026-10-07"), "7 de octubre de 2026");
    assert.equal(daysUntil("2026-10-20", "2026-10-15"), 5);
    assert.equal(daysUntil("2026-10-10", "2026-10-15"), -5);
  });
});

describe("blog content", () => {
  it("has unique ids, known categories, valid dates and https sources", () => {
    const known = new Set(CATEGORIES.map((c) => c.id));
    assert.equal(new Set(ARTICLES.map((a) => a.id)).size, ARTICLES.length);
    for (const article of [...ARTICLES, ...KEY_DATES]) {
      assert.ok(known.has(article.category));
      assert.match(article.date, /^\d{4}-\d{2}-\d{2}$/);
    }
    for (const article of ARTICLES) {
      assert.ok(article.sources.length > 0, article.id);
      for (const source of article.sources) assert.match(source.url, /^https:\/\//);
    }
  });
});
