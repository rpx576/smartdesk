import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProposalMessage,
  calculateQuote,
  clampPages,
  configForSector,
  defaultConfig,
  formatEuros,
  normalizeConfig,
  sectors,
  webScore,
  type WebConfig,
} from "./smartweb";

const base: WebConfig = {
  businessName: "Talleres Ana",
  sector: "taller",
  type: "corporativa",
  pages: 5,
  modules: [],
  extras: [],
  palette: "oceano",
  style: "moderno",
  speed: "estandar",
  maintenance: "ninguno",
  headline: 0,
};

describe("calculateQuote", () => {
  it("prices the base project with VAT and a 40 % deposit", () => {
    const quote = calculateQuote(base);
    assert.equal(quote.subtotal, 1290);
    assert.equal(quote.vat, 271);
    assert.equal(quote.total, 1561);
    assert.equal(quote.deposit, 624);
    assert.equal(quote.weeks, 3);
    assert.equal(quote.monthly, 0);
  });

  it("adds extra pages, modules and extras, and does not charge modules included in the type", () => {
    const quote = calculateQuote({ ...base, pages: 7, modules: ["seo", "whatsapp"], extras: ["logo"], maintenance: "crecimiento" });
    assert.deepEqual(
      quote.lines.map((line) => [line.label, line.amount]),
      [
        ["Web corporativa", 1290],
        ["2 páginas extra", 240],
        ["SEO local", 290],
        ["Diseño de logo", 290],
      ],
    );
    assert.equal(quote.subtotal, 2110);
    assert.equal(quote.monthly, 59);
    assert.equal(quote.weeks, 4);
  });

  it("charges 20 % more for express delivery and shortens the deadline", () => {
    const standard = calculateQuote({ ...base, type: "tienda" });
    const express = calculateQuote({ ...base, type: "tienda", speed: "express" });
    assert.equal(express.subtotal, Math.round(standard.subtotal * 1.2));
    assert.ok(express.weeks < standard.weeks);
    assert.equal(express.lines.at(-1)?.label, "Entrega exprés");
  });

  it("keeps a landing page at one page whatever is asked", () => {
    assert.equal(clampPages("landing", 9), 1);
    assert.equal(calculateQuote({ ...base, type: "landing", pages: 9 }).subtotal, 690);
    assert.equal(clampPages("corporativa", 99), 15);
    assert.equal(clampPages("corporativa", 1), 3);
  });
});

describe("webScore", () => {
  it("grows with the modules that bring customers and suggests the missing ones", () => {
    const plain = webScore({ ...base, type: "landing" });
    const full = webScore({ ...base, modules: ["seo", "resenas", "reservas", "smartai"], extras: ["textos"] });
    assert.ok(full.score > plain.score);
    assert.ok(full.score <= 100);
    assert.equal(plain.tips[0].id, "seo");
    assert.ok(!full.tips.some((tip) => tip.id === "seo"));
  });
});

describe("normalizeConfig", () => {
  it("repairs untrusted saved data", () => {
    assert.deepEqual(normalizeConfig(null), { ...defaultConfig });
    const config = normalizeConfig({
      businessName: "x".repeat(80),
      sector: "clinica",
      type: "hack",
      pages: "12",
      modules: ["seo", "nope", 3],
      extras: ["fotos"],
      palette: "rosa",
      headline: 7,
    });
    assert.equal(config.businessName.length, 40);
    assert.equal(config.sector, "clinica");
    assert.equal(config.type, defaultConfig.type);
    assert.equal(config.pages, 12);
    assert.deepEqual(config.modules, ["seo"]);
    assert.deepEqual(config.extras, ["fotos"]);
    assert.equal(config.palette, defaultConfig.palette);
    assert.equal(config.headline, 0);
  });
});

describe("sectors", () => {
  it("suggest a valid starting configuration for every sector", () => {
    for (const sector of sectors) {
      const config = configForSector(sector.id);
      assert.deepEqual(normalizeConfig(config), config);
      assert.equal(sector.services.length, 3);
      assert.equal(sector.products.length, 3);
    }
  });
});

describe("buildProposalMessage", () => {
  it("summarises the configuration and the quote", () => {
    const text = buildProposalMessage({ ...base, modules: ["seo"] });
    assert.match(text, /para Talleres Ana/);
    assert.match(text, /Web corporativa \(5 páginas\)/);
    assert.match(text, /Botón de WhatsApp, SEO local/);
    assert.match(text, new RegExp(`${formatEuros(1580)} \\+ IVA`));
  });

  it("formats euros with grouping", () => {
    assert.equal(formatEuros(1290), "1.290 €");
  });
});
