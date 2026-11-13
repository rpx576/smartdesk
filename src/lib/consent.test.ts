import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONSENT_MAX_AGE_DAYS, effectiveConsent, isAnalyticsCookie, parseConsent, readCookie, serializeConsent } from "./consent";

const now = Date.UTC(2026, 10, 11);

describe("consent cookie", () => {
  it("round-trips a choice", () => {
    const consent = { analytics: true, offered: true, decidedAt: now - 1000 };
    assert.deepEqual(parseConsent(serializeConsent(consent), now), consent);
    const rejected = { analytics: false, offered: false, decidedAt: now };
    assert.deepEqual(parseConsent(serializeConsent(rejected), now), rejected);
  });

  it("reads choices saved in the previous format as made with analytics on offer", () => {
    assert.deepEqual(parseConsent(`v1.1.${now}`, now), { analytics: true, offered: true, decidedAt: now });
    assert.deepEqual(parseConsent(`v1.0.${now}`, now), { analytics: false, offered: true, decidedAt: now });
  });

  it("asks again when the value is missing, malformed, from the future or expired", () => {
    assert.equal(parseConsent(undefined, now), null);
    assert.equal(parseConsent("yes", now), null);
    assert.equal(parseConsent("v1.2.1794402334352", now), null);
    assert.equal(parseConsent(`v2.1.2.${now}`, now), null);
    assert.equal(parseConsent(`v2.1.1.${now + 3_600_000}`, now), null);
    assert.equal(parseConsent(`v2.1.1.${now - (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000}`, now), null);
  });

  it("asks again when analytics is switched on after a choice made without it", () => {
    const withoutAnalytics = { analytics: false, offered: false, decidedAt: now };
    assert.equal(effectiveConsent(withoutAnalytics, true), null);
    assert.deepEqual(effectiveConsent(withoutAnalytics, false), withoutAnalytics);
    const withAnalytics = { analytics: false, offered: true, decidedAt: now };
    assert.deepEqual(effectiveConsent(withAnalytics, true), withAnalytics);
    assert.equal(effectiveConsent(null, false), null);
  });

  it("reads one cookie", () => {
    assert.equal(readCookie("a=1; adv_consent=v2.0.1.123; b=2", "adv_consent"), "v2.0.1.123");
    assert.equal(readCookie("a=1", "adv_consent"), null);
  });

  it("recognises analytics cookies", () => {
    assert.ok(isAnalyticsCookie("_ga"));
    assert.ok(isAnalyticsCookie("_ga_ABC123"));
    assert.ok(!isAnalyticsCookie("adv_consent"));
  });
});
