import { describe, expect, it } from "vitest";
import { formatMessageContent } from "../src/agent.js";

describe("formatMessageContent", () => {
  it("keeps string content unchanged", () => {
    expect(formatMessageContent("hello")).toBe("hello");
  });

  it("extracts text from common text content blocks", () => {
    expect(
      formatMessageContent([
        { type: "text", text: "hello" },
        { type: "text", text: "world" }
      ])
    ).toBe("hello\nworld");
  });
});
