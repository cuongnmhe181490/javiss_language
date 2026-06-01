import { describe, expect, it } from "vitest";

import { assignmentStatusVi, languageLabelVi, relativeTimeVi } from "./format";

describe("format helpers", () => {
  it("maps language codes to Vietnamese labels", () => {
    expect(languageLabelVi("en")).toBe("Tiếng Anh");
    expect(languageLabelVi("ja")).toBe("Tiếng Nhật");
    expect(languageLabelVi("xx")).toBe("XX");
  });

  it("maps assignment statuses to Vietnamese", () => {
    expect(assignmentStatusVi("active")).toBe("Đang giao");
    expect(assignmentStatusVi("completed")).toBe("Hoàn thành");
    expect(assignmentStatusVi("unknown")).toBe("unknown");
  });

  it("formats relative time", () => {
    expect(relativeTimeVi(undefined)).toBe("");
    expect(relativeTimeVi("not-a-date")).toBe("");
    expect(relativeTimeVi(new Date().toISOString())).toBe("Vừa xong");
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(relativeTimeVi(twoHoursAgo)).toBe("2 giờ trước");
  });
});
