import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./api";

describe("sendChatMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts a chat request and returns the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        message: "hello back",
        sessionId: "session-1"
      })))
    );

    const result = await sendChatMessage({
      message: "hello",
      sessionId: "session-1"
    });

    expect(result).toEqual({
      message: "hello back",
      sessionId: "session-1"
    });
  });

  it("throws a readable backend error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        error: "message is required"
      }), { status: 400 }))
    );

    await expect(sendChatMessage({ message: "" })).rejects.toThrow("message is required");
  });
});
