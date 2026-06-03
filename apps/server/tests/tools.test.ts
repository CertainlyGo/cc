import { describe, expect, it } from "vitest";
import { calculateExpression, createAgentTools, getCurrentTimeText } from "../src/tools.js";

type CalculatorTool = {
  invoke(input: { expression: string }): Promise<unknown>;
  name: string;
};

describe("calculator tool", () => {
  it("calculates arithmetic expressions", () => {
    expect(calculateExpression("2 + 3 * 4")).toBe("14");
  });

  it("rejects unsafe expressions", () => {
    expect(calculateExpression("process.exit()")).toContain("Invalid calculator expression");
  });

  it("handles parentheses and decimals", () => {
    expect(calculateExpression("(2 + 3) * 1.5")).toBe("7.5");
  });

  it("rejects non-finite results", () => {
    expect(calculateExpression("1 / 0")).toContain("Invalid calculator expression");
  });

  it("rejects invalid syntax", () => {
    expect(calculateExpression("2 +")).toContain("Invalid calculator expression");
  });

  it("rejects exponentiation", () => {
    expect(calculateExpression("2 ** 3")).toContain("Invalid calculator expression");
  });
});

describe("createAgentTools", () => {
  it("returns calculator and current_time tools", () => {
    const tools = createAgentTools();

    expect(tools.map(({ name }) => name)).toEqual(["calculator", "current_time"]);
  });

  it("invokes calculator expressions through the tool API", async () => {
    const calculator = createAgentTools().find(
      ({ name }) => name === "calculator"
    ) as CalculatorTool | undefined;

    await expect(calculator?.invoke({ expression: "(2 + 3) * 1.5" })).resolves.toBe("7.5");
  });
});

describe("current time tool", () => {
  it("formats an injected date", () => {
    const date = new Date("2026-06-03T12:34:56.000Z");
    expect(getCurrentTimeText(date)).toBe("2026-06-03T12:34:56.000Z");
  });
});
