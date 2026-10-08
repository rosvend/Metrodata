import { describe, expect, it } from "vitest";
import { measure } from "./path";
import { placeParticles } from "./particles";

const line = {
  id: "A",
  parts: [
    measure([
      [0, 0],
      [0, 3],
    ]),
    measure([
      [1, 0],
      [1, 1],
    ]),
  ],
};

describe("placeParticles", () => {
  it("emits the requested number of particles split by part length", () => {
    const pts = placeParticles([line], { A: 8 }, 0);
    expect(pts).toHaveLength(8);
    expect(pts.filter((p) => p.position[0] === 0)).toHaveLength(6);
  });

  it("keeps every particle on its part and moves them over time", () => {
    const a = placeParticles([line], { A: 4 }, 0);
    const b = placeParticles([line], { A: 4 }, 1);
    for (const p of [...a, ...b]) expect([0, 1]).toContain(p.position[0]);
    expect(a.map((p) => p.position[1])).not.toEqual(b.map((p) => p.position[1]));
  });

  it("emits nothing for lines without a count", () => {
    expect(placeParticles([line], {}, 0)).toEqual([]);
  });
});
