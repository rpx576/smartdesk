import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildContactMessage, validateContact, whatsappUrl, type ContactInput } from "./whatsapp";

const valid: ContactInput = {
  name: "Ana García",
  company: "Talleres Ana",
  email: "ana@talleres.es",
  topic: "SmartDesk",
  message: "Quiero una demo para mi equipo.",
};

describe("validateContact", () => {
  it("accepts a complete form and an empty email", () => {
    assert.deepEqual(validateContact(valid), {});
    assert.deepEqual(validateContact({ ...valid, email: "  " }), {});
  });

  it("asks for a name, a valid email and a real message", () => {
    const errors = validateContact({ ...valid, name: " ", email: "ana@", message: "hola" });
    assert.deepEqual(Object.keys(errors).sort(), ["email", "message", "name"]);
    assert.ok(validateContact({ ...valid, message: "x".repeat(1001) }).message);
  });
});

describe("buildContactMessage", () => {
  it("includes every filled field", () => {
    const text = buildContactMessage(valid);
    assert.match(text, /^Hola, soy Ana García de Talleres Ana\./);
    assert.match(text, /Asunto: SmartDesk/);
    assert.match(text, /Quiero una demo para mi equipo\./);
    assert.match(text, /Email: ana@talleres\.es/);
  });

  it("leaves out empty optional fields", () => {
    const text = buildContactMessage({ ...valid, company: "", email: "" });
    assert.match(text, /^Hola, soy Ana García\.\n/);
    assert.doesNotMatch(text, /Email:/);
  });
});

describe("whatsappUrl", () => {
  it("opens SmartHub's number with the text encoded", () => {
    assert.equal(whatsappUrl(), "https://wa.me/34655130513");
    const url = new URL(whatsappUrl("Hola & adiós\n¿Qué tal?"));
    assert.equal(url.pathname, "/34655130513");
    assert.equal(url.searchParams.get("text"), "Hola & adiós\n¿Qué tal?");
  });
});
