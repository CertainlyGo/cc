import { describe, expect, it } from "vitest";
import { calculateExpression, getCurrentTimeText } from "../src/tools";

describe("calculator tool", () => {
  it("calculates arithmetic expressions", () => {
    expect(calculateExpression("2 + 3 * 4")).toBe("14");
  });

  it("rejects unsafe expressions", () => {
    expect(calculateExpression("process.exit()")).toContain("Invalid calculator expression");
  });
});

describe("current time tool", () => {
  it("formats an injected date", () => {
    const date = new Date("2026-06-03T12:34:56.000Z");
    expect(getCurrentTimeText(date)).toBe("2026-06-03T12:34:56.000Z");
  });
});
