import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseInline, parseMarkdown, toPlainText } from "./markdown";

const answer = `## Presupuesto

**Cliente:** Talleres Ana

| Concepto | Importe |
| --- | --- |
| Diseño | 720,00 € |
| Desarrollo | 540,00 € |

- Base: 1.260 €
- **Total:** 1.524,60 €

> Nota importante
<script>alert(1)</script>`;

describe("parseMarkdown", () => {
  it("parses headings, paragraphs, tables, lists and quotes", () => {
    const blocks = parseMarkdown(answer);
    assert.deepEqual(
      blocks.map((b) => b.kind),
      ["heading", "paragraph", "table", "list", "quote", "paragraph"],
    );
    assert.deepEqual(blocks[2], {
      kind: "table",
      header: ["Concepto", "Importe"],
      rows: [
        ["Diseño", "720,00 €"],
        ["Desarrollo", "540,00 €"],
      ],
    });
    assert.deepEqual(blocks[3], { kind: "list", ordered: false, items: ["Base: 1.260 €", "**Total:** 1.524,60 €"] });
  });

  it("keeps markup as text", () => {
    const blocks = parseMarkdown(answer);
    assert.deepEqual(blocks.at(-1), { kind: "paragraph", text: "<script>alert(1)</script>" });
  });

  it("handles a partial table while streaming", () => {
    assert.deepEqual(parseMarkdown("| A | B |").map((b) => b.kind), ["paragraph"]);
  });
});

describe("parseInline", () => {
  it("splits bold and italic runs but not snake_case", () => {
    assert.deepEqual(parseInline("Hola **mundo** y _tú_ en mi_variable_x"), [
      { text: "Hola " },
      { text: "mundo", bold: true },
      { text: " y " },
      { text: "tú", italic: true },
      { text: " en mi_variable_x" },
    ]);
  });
});

describe("toPlainText", () => {
  it("removes Markdown syntax", () => {
    assert.equal(toPlainText("## Hola\n**Total:** 5 €\n| A | B |\n| --- | --- |\n| 1 | 2 |"), "Hola\nTotal: 5 €\nA · B\n1 · 2");
  });
});
