import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CASE_STUDIES } from "./home";
import { MAINTENANCE_PLANS, SECURITY_BLOCKS, SEO_PLANS, formatPlanPrice } from "./plans";
import { SERVICES } from "./services";
import { hasPendingLegalData, pending } from "./company";

const ALL_TEXT = JSON.stringify({ SERVICES, MAINTENANCE_PLANS, SEO_PLANS, SECURITY_BLOCKS });

describe("service content", () => {
  it("has the four services with unique titles and descriptions", () => {
    assert.deepEqual(SERVICES.map((s) => s.id), ["creacion-web", "mantenimiento-web", "seo", "ciberseguridad"]);
    assert.equal(new Set(SERVICES.map((s) => s.metaTitle)).size, 4);
    assert.equal(new Set(SERVICES.map((s) => s.metaDescription)).size, 4);
    for (const s of SERVICES) assert.ok(s.metaDescription.length <= 160, `${s.id} description too long`);
  });

  it("never claims guarantees or certifications it does not have", () => {
    assert.doesNotMatch(ALL_TEXT, /garantizamos|certificad[oa]s? (en|por)|100 ?%|primera posición garantizada/i);
  });

  it("splits cybersecurity into prevention, audits and intervention", () => {
    assert.deepEqual(SECURITY_BLOCKS.map((b) => b.id), ["preventivo", "auditoria", "intervencion"]);
  });

  it("offers three maintenance plans", () => {
    assert.equal(MAINTENANCE_PLANS.length, 3);
  });

  it("publishes no invented case studies", () => {
    assert.equal(CASE_STUDIES.length, 0);
  });
});

describe("formatPlanPrice", () => {
  it("never shows a price that was not set", () => {
    assert.equal(formatPlanPrice({ price: null, period: "mes" }), "Precio a consultar");
    assert.equal(formatPlanPrice({ price: 90, period: "mes" }), "90 €/mes");
    assert.equal(formatPlanPrice({ price: 450, period: "proyecto", from: true }), "Desde 450 €");
  });
});

describe("legal data", () => {
  it("marks missing owner data as pending", () => {
    assert.equal(pending(null, "NIF"), "[PENDIENTE: NIF]");
    assert.equal(hasPendingLegalData(), true);
  });
});
