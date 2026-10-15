import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { needs, recommendSolutions, solutions } from "./solutions";

describe("recommendSolutions", () => {
  it("returns nothing when no need is selected", () => {
    assert.deepEqual(recommendSolutions([]), []);
  });

  it("points a single need to its service", () => {
    assert.deepEqual(recommendSolutions(["plazos"]), [{ id: "smartdesk", score: 3 }]);
    assert.deepEqual(recommendSolutions(["vender"]), [{ id: "smartweb", score: 3 }]);
  });

  it("adds up the weights and sorts the best match first", () => {
    assert.deepEqual(recommendSolutions(["documentos", "captar", "datos"]), [
      { id: "smartai", score: 6 },
      { id: "smartweb", score: 2 },
      { id: "smartdesk", score: 1 },
    ]);
  });

  it("keeps the page order on a tie and ignores unknown ids", () => {
    assert.deepEqual(recommendSolutions(["clientes", "repetitivo", "no-existe"]), [
      { id: "smartdesk", score: 3 },
      { id: "smartai", score: 3 },
    ]);
  });

  it("only uses services that exist and unique need ids", () => {
    const ids = new Set(solutions.map((s) => s.id));
    for (const need of needs) for (const id of Object.keys(need.weights)) assert.ok(ids.has(id as never), id);
    assert.equal(new Set(needs.map((n) => n.id)).size, needs.length);
  });
});
