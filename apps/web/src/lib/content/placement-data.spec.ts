import { describe, expect, it } from "vitest";

import { evaluatePlacement, placementQuestions } from "./placement-data";

describe("placement evaluation", () => {
  it("has a balanced question set across levels", () => {
    expect(placementQuestions.length).toBeGreaterThanOrEqual(6);
    const levels = new Set(placementQuestions.map((q) => q.level));
    expect(levels.has("A1")).toBe(true);
    expect(levels.has("B2")).toBe(true);
  });

  it("every question's answer is one of its options", () => {
    for (const q of placementQuestions) {
      expect(q.options).toContain(q.answer);
    }
  });

  it("maps low scores to A1 and perfect scores to B2", () => {
    expect(evaluatePlacement(0).level).toBe("A1");
    expect(evaluatePlacement(2).level).toBe("A1");
    expect(evaluatePlacement(4).level).toBe("A2");
    expect(evaluatePlacement(6).level).toBe("B1");
    expect(evaluatePlacement(8).level).toBe("B2");
  });

  it("returns a recommendation for any score", () => {
    for (let i = 0; i <= placementQuestions.length; i += 1) {
      const result = evaluatePlacement(i);
      expect(result.recommendation.length).toBeGreaterThan(0);
      expect(result.title.length).toBeGreaterThan(0);
    }
  });
});
