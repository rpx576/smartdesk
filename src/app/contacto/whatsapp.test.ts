import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWhatsAppMessage, whatsappDraftUrl } from "./whatsapp";

const draft = { name: "Ana García", company: "Talleres Ana", serviceLabel: "SEO", message: "Quiero mejorar mi posicionamiento." };

describe("buildWhatsAppMessage", () => {
  it("includes every filled field", () => {
    const text = buildWhatsAppMessage(draft);
    assert.match(text, /^Hola, soy Ana García de Talleres Ana\./);
    assert.match(text, /Me interesa: SEO/);
    assert.match(text, /Quiero mejorar mi posicionamiento\./);
  });

  it("leaves out an empty company and keeps placeholders for empty fields", () => {
    const text = buildWhatsAppMessage({ ...draft, company: " ", name: "", message: "" });
    assert.match(text, /^Hola, soy \.\.\.\.\n/);
    assert.equal(text.split("\n")[0], "Hola, soy ....");
  });
});

describe("whatsappDraftUrl", () => {
  it("links to the business number with the text encoded", () => {
    const url = whatsappDraftUrl(draft);
    assert.ok(url.startsWith("https://wa.me/34655130513?text="));
    assert.match(decodeURIComponent(url.split("text=")[1]), /Me interesa: SEO/);
  });
});
