import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNavigation } from "../app/_home/navigation";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import {
  barePath,
  format,
  getDictionary,
  isLocale,
  languageAlternates,
  localeOfPath,
  localizeHref,
  switchLocaleHref,
} from "./index";

/** Every string of a dictionary with its path, e.g. "home.hero.title". */
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => strings(child, path ? `${path}.${key}` : key));
  }
  return [];
}

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(",");

describe("dictionaries", () => {
  const spanish = new Map(strings(es));
  const english = new Map(strings(en));

  it("English has exactly the same texts (keys and list lengths) as Spanish", () => {
    assert.deepEqual([...english.keys()].sort(), [...spanish.keys()].sort());
  });

  it("has no empty text in any language", () => {
    for (const [path, text] of [...spanish, ...english]) assert.notEqual(text.trim(), "", path);
  });

  it("uses the same {placeholders} in both languages", () => {
    for (const [path, text] of spanish) assert.equal(placeholders(english.get(path) ?? ""), placeholders(text), path);
  });

  it("does not leave Spanish text in the English version (except names, brands and the language switch)", () => {
    const allowedSame = /^(SmartDesk|SmartAI|SmartWeb|Español|English|ES|EN|es|en|es_ES|en_GB|\{.*\}|Blog)$/;
    const spanishWords = /\b(para|tu|tus|con|una|un|el|la|los|las|del|que|por|nuestra|empresa|empresas)\b/i;
    for (const [path, text] of english) {
      if (allowedSame.test(text) || path.endsWith("timeLocale")) continue;
      assert.doesNotMatch(text, spanishWords, `${path}: ${text}`);
    }
  });

  it("knows its languages", () => {
    assert.equal(isLocale("en"), true);
    assert.equal(isLocale("fr"), false);
    assert.equal(getDictionary("en"), en);
    assert.equal(getDictionary("es"), es);
  });
});

describe("addresses per language", () => {
  it("strips the language prefix", () => {
    assert.equal(barePath("/en"), "/");
    assert.equal(barePath("/en/contacto"), "/contacto");
    assert.equal(barePath("/contacto"), "/contacto");
    assert.equal(barePath("/en/contacto/"), "/contacto");
    assert.equal(barePath("/english"), "/english", "only the exact /en prefix counts");
    assert.equal(barePath("/#idea"), "/");
  });

  it("tells the language of an address", () => {
    assert.equal(localeOfPath("/en"), "en");
    assert.equal(localeOfPath("/en/contacto"), "en");
    assert.equal(localeOfPath("/contacto"), "es");
    assert.equal(localeOfPath("/enterprise"), "es");
  });

  it("links to translated pages inside the language and leaves the rest alone", () => {
    assert.equal(localizeHref("es", "/contacto"), "/contacto");
    assert.equal(localizeHref("en", "/"), "/en");
    assert.equal(localizeHref("en", "/contacto"), "/en/contacto");
    assert.equal(localizeHref("en", "/#idea"), "/en#idea");
    assert.equal(localizeHref("en", "/#inicio"), "/en#inicio");
    // Not translated yet: still the Spanish page.
    assert.equal(localizeHref("en", "/soluciones"), "/soluciones");
    assert.equal(localizeHref("en", "/smartdesk"), "/smartdesk");
    assert.equal(localizeHref("en", "https://example.com"), "https://example.com");
  });

  it("switches language keeping the page, or going to the home when it is not translated", () => {
    assert.equal(switchLocaleHref("/contacto", "en"), "/en/contacto");
    assert.equal(switchLocaleHref("/en/contacto", "es"), "/contacto");
    assert.equal(switchLocaleHref("/", "en"), "/en");
    assert.equal(switchLocaleHref("/en", "es"), "/");
    assert.equal(switchLocaleHref("/blog", "en"), "/en");
    assert.equal(switchLocaleHref("/smartai", "en"), "/en");
    assert.equal(switchLocaleHref("/en", "en"), "/en");
  });

  it("lists the translations of a page (hreflang)", () => {
    assert.deepEqual(languageAlternates("/contacto"), { es: "/contacto", en: "/en/contacto" });
    assert.deepEqual(languageAlternates("/"), { es: "/", en: "/en" });
  });
});

describe("navigation per language", () => {
  const find = (entries: ReturnType<typeof getNavigation>, label: string) => entries.find((entry) => entry.label === label);

  it("keeps the Spanish menu exactly as it was", () => {
    const menu = getNavigation("es");
    assert.deepEqual(
      menu.map((entry) => entry.label),
      ["Inicio", "Soluciones", "Productos", "Precios", "Blog", "Empresa", "Contacto"],
    );
    assert.equal(find(menu, "Inicio")?.href, "/#inicio");
    assert.equal(find(menu, "Contacto")?.href, "/contacto");
    assert.ok(menu.every((entry) => !entry.spanishOnly));
    assert.deepEqual(
      find(menu, "Productos")?.items?.map((item) => item.href),
      ["/smartdesk", "/smartai", "/smartweb"],
    );
  });

  it("translates the menu and points to the English pages that exist", () => {
    const menu = getNavigation("en");
    assert.deepEqual(
      menu.map((entry) => entry.label),
      ["Home", "Solutions", "Products", "Pricing", "Blog", "Company", "Contact"],
    );
    assert.equal(find(menu, "Home")?.href, "/en#inicio");
    assert.equal(find(menu, "Contact")?.href, "/en/contacto");
    assert.equal(find(menu, "Contact")?.spanishOnly, false);
  });

  it("marks the pages that only exist in Spanish", () => {
    const menu = getNavigation("en");
    assert.equal(find(menu, "Solutions")?.href, "/soluciones");
    assert.equal(find(menu, "Solutions")?.spanishOnly, true);
    assert.equal(find(menu, "Blog")?.spanishOnly, true);
    const products = find(menu, "Products")?.items ?? [];
    assert.ok(products.every((item) => item.spanishOnly));
    // Pages not built yet have no link and no mark.
    assert.equal(find(menu, "Pricing")?.href, undefined);
    assert.equal(find(menu, "Pricing")?.spanishOnly, false);
    const company = find(menu, "Company")?.items ?? [];
    assert.equal(company.find((item) => item.label === "Our idea")?.href, "/en#idea");
  });
});

describe("format", () => {
  it("fills placeholders and leaves unknown ones untouched", () => {
    assert.equal(format("Max {max} chars", { max: 80 }), "Max 80 chars");
    assert.equal(format("{a} and {b}", { a: "x" }), "x and {b}");
  });
});
