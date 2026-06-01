import { describe, expect, it } from "vitest";

import { languageCourseList, languageCourses } from "./phrasebook-data";

describe("phrasebook content", () => {
  it("includes all four languages", () => {
    expect(languageCourseList.map((c) => c.code).sort()).toEqual(["en", "ja", "ko", "zh"]);
  });

  it("each course has multiple topics with phrases", () => {
    for (const course of languageCourseList) {
      expect(course.topics.length).toBeGreaterThanOrEqual(4);
      for (const topic of course.topics) {
        expect(topic.phrases.length).toBeGreaterThan(0);
        for (const phrase of topic.phrases) {
          expect(phrase.text.trim().length).toBeGreaterThan(0);
          expect(phrase.vi.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("non-English phrases provide a romanization reading", () => {
    for (const code of ["zh", "ja", "ko"] as const) {
      for (const topic of languageCourses[code].topics) {
        for (const phrase of topic.phrases) {
          expect(phrase.reading && phrase.reading.trim().length > 0).toBe(true);
        }
      }
    }
  });
});
