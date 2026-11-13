import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContactConfig } from "@/config/env";
import { createRateLimiter } from "@/server/security/rate-limit";
import { createContactService, EmailDeliveryError, EmailNotConfiguredError } from "./contact.service";
import { acknowledgementEmail, escapeHtml, teamEmail, type Email } from "./email";
import { resendMailer } from "./mailer";
import { contactSchema } from "./schema";
import { checkSpam, MIN_FILL_MS } from "./spam";

const NOW = 1_800_000_000_000;
const valid = {
  requestType: "presupuesto",
  service: "seo",
  name: "Ana García",
  company: "Talleres Ana",
  email: "ana@talleres.es",
  phone: "+34 600 000 000",
  budget: "1000-3000",
  message: "Quiero mejorar mi posicionamiento local.",
  privacy: true,
  website: "",
  startedAt: NOW - 60_000,
};
const configured: ContactConfig = { resendApiKey: "re_test", to: "equipo@example.com", from: "Web <web@example.com>", turnstileSecret: null };

function service(overrides: Partial<Parameters<typeof createContactService>[0]> = {}) {
  const sent: Email[] = [];
  const instance = createContactService({
    config: () => configured,
    mailer: () => async (email) => {
      sent.push(email);
    },
    limiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
    verifyHuman: async () => true,
    now: () => NOW,
    ...overrides,
  });
  return { instance, sent };
}

describe("contactSchema", () => {
  it("accepts a complete request and normalises empty optional fields", () => {
    const parsed = contactSchema.parse({ ...valid, company: " ", phone: "" });
    assert.equal(parsed.company, undefined);
    assert.equal(parsed.phone, undefined);
  });

  it("requires privacy consent, a valid email, a known service and a real message", () => {
    for (const bad of [{ privacy: false }, { email: "ana@" }, { service: "smartdesk" }, { message: "hola" }, { budget: "mucho" }]) {
      assert.equal(contactSchema.safeParse({ ...valid, ...bad }).success, false, JSON.stringify(bad));
    }
  });

  it("rejects unknown fields", () => {
    assert.equal(contactSchema.safeParse({ ...valid, admin: true }).success, false);
  });
});

describe("checkSpam", () => {
  it("lets a person through and stops bots", () => {
    assert.deepEqual(checkSpam({ website: "", startedAt: NOW - 10_000 }, NOW), { ok: true });
    assert.deepEqual(checkSpam({ website: "http://spam", startedAt: NOW - 10_000 }, NOW), { ok: false, reason: "honeypot" });
    assert.deepEqual(checkSpam({ startedAt: NOW - MIN_FILL_MS + 1 }, NOW), { ok: false, reason: "too-fast" });
    assert.deepEqual(checkSpam({ startedAt: NOW - 2 * 86_400_000 }, NOW), { ok: false, reason: "stale" });
  });
});

describe("emails", () => {
  it("escapes HTML and keeps the subject on one line", () => {
    const input = contactSchema.parse({ ...valid, name: "Ana\r\nBcc: x@y.z", message: "<script>alert(1)</script> hola" });
    const email = teamEmail(input, configured as { to: string; from: string });
    assert.doesNotMatch(email.subject, /[\r\n]/);
    assert.doesNotMatch(email.html, /<script>/);
    assert.match(email.html, /&lt;script&gt;/);
    assert.equal(email.replyTo, "ana@talleres.es");
    assert.equal(escapeHtml(`"'&`), "&quot;&#39;&amp;");
  });

  it("sends the acknowledgement to the visitor", () => {
    const email = acknowledgementEmail(contactSchema.parse(valid), configured as { to: string; from: string });
    assert.equal(email.to, "ana@talleres.es");
    assert.match(email.text, /solicitud de presupuesto sobre SEO/);
  });
});

describe("contactService.submit", () => {
  it("emails the team and the visitor", async () => {
    const { instance, sent } = service();
    assert.deepEqual(await instance.submit(valid, "1.2.3.4"), { sent: true });
    assert.deepEqual(sent.map((email) => email.to), ["equipo@example.com", "ana@talleres.es"]);
  });

  it("silently drops bots without sending anything", async () => {
    const { instance, sent } = service();
    assert.deepEqual(await instance.submit({ ...valid, website: "spam" }, "1.2.3.4"), { sent: false });
    assert.equal(sent.length, 0);
  });

  it("says when email is not configured instead of pretending", async () => {
    const { instance } = service({ config: () => ({ ...configured, resendApiKey: null }) });
    await assert.rejects(instance.submit(valid, "1.2.3.4"), EmailNotConfiguredError);
  });

  it("fails when the team email fails, but not when only the copy fails", async () => {
    const failing = service({ mailer: () => async () => { throw new Error("down"); } });
    await assert.rejects(failing.instance.submit(valid, "1.2.3.4"), EmailDeliveryError);

    let calls = 0;
    const copyFails = service({ mailer: () => async () => { calls += 1; if (calls === 2) throw new Error("bad address"); } });
    assert.deepEqual(await copyFails.instance.submit(valid, "1.2.3.4"), { sent: true });
  });

  it("requires a valid Turnstile token when Turnstile is configured", async () => {
    const { instance } = service({ config: () => ({ ...configured, turnstileSecret: "secret" }), verifyHuman: async () => false });
    await assert.rejects(instance.submit(valid, "1.2.3.4"), /robot/);
  });

  it("limits submissions per address", async () => {
    const { instance } = service({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await instance.submit(valid, "9.9.9.9");
    await assert.rejects(instance.submit(valid, "9.9.9.9"), /varios mensajes/);
    assert.deepEqual(await instance.submit(valid, "8.8.8.8"), { sent: true });
  });
});

describe("resendMailer", () => {
  it("posts to Resend and throws on a refusal", async () => {
    const requests: { url: string; body: Record<string, unknown> }[] = [];
    const ok = resendMailer("re_key", (async (url: string, init: RequestInit) => {
      requests.push({ url, body: JSON.parse(init.body as string) });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch);
    await ok({ to: "a@b.c", from: "x@y.z", subject: "s", text: "t", html: "h", replyTo: "r@s.t" });
    assert.equal(requests[0].url, "https://api.resend.com/emails");
    assert.deepEqual(requests[0].body.to, ["a@b.c"]);
    assert.equal(requests[0].body.reply_to, "r@s.t");

    const refused = resendMailer("re_key", (async () => new Response("no", { status: 422 })) as unknown as typeof fetch);
    await assert.rejects(refused({ to: "a@b.c", from: "x@y.z", subject: "s", text: "t", html: "h" }), /422/);
  });
});
