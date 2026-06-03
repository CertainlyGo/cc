import { describe, expect, it } from "vitest";
import type { ChatRequest, ChatResponse } from "../src/index";

describe("shared chat contracts", () => {
  it("allows a chat request with an optional session id", () => {
    const request: ChatRequest = {
      message: "What time is it?",
      sessionId: "session-123"
    };

    expect(request.message).toBe("What time is it?");
    expect(request.sessionId).toBe("session-123");
  });

  it("allows a successful chat response", () => {
    const response: ChatResponse = {
      message: "It is 12:00.",
      sessionId: "session-123"
    };

    expect(response.message).toBe("It is 12:00.");
    expect(response.sessionId).toBe("session-123");
  });
});
