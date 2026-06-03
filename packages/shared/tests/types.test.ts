import { describe, expect, it } from "vitest";
import type { ChatErrorResponse, ChatRequest, ChatResponse } from "../src/index";

describe("shared chat contracts", () => {
  it("allows a chat request with an optional session id", () => {
    const request: ChatRequest = {
      message: "What time is it?",
      sessionId: "session-123"
    };
    // @ts-expect-error message is required.
    const missingMessage: ChatRequest = {};

    expect(request.message).toBe("What time is it?");
    expect(request.sessionId).toBe("session-123");
    expect(missingMessage).toEqual({});
  });

  it("allows a successful chat response", () => {
    const response: ChatResponse = {
      message: "It is 12:00.",
      sessionId: "session-123"
    };
    // @ts-expect-error sessionId is required.
    const missingSessionId: ChatResponse = {
      message: "It is 12:00."
    };

    expect(response.message).toBe("It is 12:00.");
    expect(response.sessionId).toBe("session-123");
    expect(missingSessionId.message).toBe("It is 12:00.");
  });

  it("allows a chat error response", () => {
    const response: ChatErrorResponse = {
      error: "Something went wrong."
    };
    // @ts-expect-error error is required.
    const missingError: ChatErrorResponse = {};

    expect(response.error).toBe("Something went wrong.");
    expect(missingError).toEqual({});
  });
});
