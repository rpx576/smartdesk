import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONSENT_MAX_AGE_DAYS, isAnalyticsCookie, parseConsent, readCookie, serializeConsent } from "./consent";

const now = Date.UTC(2026, 10, 11);

describe("consent cookie", () => {
  it("round-trips a choice", () => {
    const consent = { analytics: true, decidedAt: now - 1000 };
    assert.deepEqual(parseConsent(serializeConsent(consent), now), consent);
    assert.deepEqual(parseConsent(serializeConsent({ analytics: false, decidedAt: now }), now), { analytics: false, decidedAt: now });
  });

  it("asks again when the value is missing, malformed, from the future or expired", () => {
    assert.equal(parseConsent(undefined, now), null);
    assert.equal(parseConsent("yes", now), null);
    assert.equal(parseConsent("v1.2.1794402334352", now), null);
    assert.equal(parseConsent(`v1.1.${now + 3_600_000}`, now), null);
    assert.equal(parseConsent(`v1.1.${now - (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000}`, now), null);
  });

  it("reads one cookie", () => {
    assert.equal(readCookie("a=1; adv_consent=v1.0.123; b=2", "adv_consent"), "v1.0.123");
    assert.equal(readCookie("a=1", "adv_consent"), null);
  });

  it("recognises analytics cookies", () => {
    assert.ok(isAnalyticsCookie("_ga"));
    assert.ok(isAnalyticsCookie("_ga_ABC123"));
    assert.ok(!isAnalyticsCookie("adv_consent"));
  });
});
