import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clientsListHref, noticeMessage, readClientForm } from "./form-data";

describe("readClientForm", () => {
  it("keeps only the client fields and drops forged tenant data", () => {
    const form = new FormData();
    form.set("name", "Acme");
    form.set("email", "a@acme.test");
    form.set("status", "LEAD");
    form.set("organizationId", "018f0000-0000-7000-8000-000000000002");
    form.set("id", "someone-elses-client");
    form.set("$ACTION_ID_abc", "");

    assert.deepEqual(readClientForm(form), { name: "Acme", email: "a@acme.test", status: "LEAD" });
  });

  it("ignores file uploads posing as text fields", () => {
    const form = new FormData();
    form.set("name", new Blob(["x"]), "evil.txt");
    assert.deepEqual(readClientForm(form), {});
  });
});

describe("noticeMessage", () => {
  it("maps known notices and ignores anything else", () => {
    assert.equal(noticeMessage("created"), "Cliente creado correctamente.");
    assert.equal(noticeMessage("<script>"), undefined);
    assert.equal(noticeMessage("constructor"), undefined);
    assert.equal(noticeMessage(["created"]), undefined);
  });
});

describe("clientsListHref", () => {
  it("always points inside /clients", () => {
    assert.equal(clientsListHref({}), "/clients");
    assert.equal(clientsListHref({ search: "//evil.com", page: "2" }), "/clients?search=%2F%2Fevil.com&page=2");
    assert.equal(clientsListHref({ notice: "deleted" }), "/clients?notice=deleted");
  });

  it("drops invalid positions", () => {
    assert.equal(clientsListHref({ page: "-3" }), "/clients");
    assert.equal(clientsListHref({ page: "abc", search: "rioja" }), "/clients");
    assert.equal(clientsListHref({ search: "rioja", page: 1 }), "/clients?search=rioja");
  });
});
