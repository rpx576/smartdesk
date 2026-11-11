import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SERVICES } from "@/content/services";
import { INDEXABLE_PATHS, NOINDEX_PATHS, faqJsonLd, pageMetadata, serializeJsonLd, serviceJsonLd } from "./seo";

describe("pageMetadata", () => {
  it("sets canonical, Open Graph, Twitter and the share image", () => {
    const meta = pageMetadata({ title: "T", description: "D", path: "/seo" });
    assert.equal(meta.alternates?.canonical, "/seo");
    assert.ok(JSON.stringify(meta.openGraph).includes("/opengraph-image.jpg"));
    assert.equal((meta.twitter as { card: string }).card, "summary_large_image");
    assert.equal(meta.robots, undefined);
  });

  it("marks private pages as noindex", () => {
    assert.deepEqual(pageMetadata({ title: "T", description: "D", path: "/gracias", noindex: true }).robots, { index: false, follow: true });
  });
});

describe("site map lists", () => {
  it("include the four services and never a private page", () => {
    for (const service of SERVICES) assert.ok((INDEXABLE_PATHS as readonly string[]).includes(service.href));
    for (const path of NOINDEX_PATHS) assert.ok(!(INDEXABLE_PATHS as readonly string[]).includes(path));
  });
});

describe("structured data", () => {
  it("describes each service and its FAQ", () => {
    const data = serviceJsonLd(SERVICES[0], "https://example.com");
    assert.equal(data["@type"], "Service");
    assert.equal(data.url, "https://example.com/creacion-web");
    assert.equal((faqJsonLd(SERVICES[0].faq).mainEntity as unknown[]).length, SERVICES[0].faq.length);
  });

  it("cannot close the script tag", () => {
    assert.doesNotMatch(serializeJsonLd({ text: "</script><script>alert(1)</script>" }), /<\/script>/);
  });
});
