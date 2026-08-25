import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./api";

describe("sendChatMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts a chat request and returns the response", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      message: "hello back",
      sessionId: "session-1"
    })));

    vi.stubGlobal(
      "fetch",
      fetchMock
    );

    const result = await sendChatMessage({
      message: "hello",
      sessionId: "session-1"
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "hello",
        sessionId: "session-1"
      })
    });
    expect(result).toEqual({
      message: "hello back",
      sessionId: "session-1"
    });
  });

  it("uses the configured API base URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3001");

    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      message: "hello back"
    })));

    vi.stubGlobal(
      "fetch",
      fetchMock
    );

    await sendChatMessage({
      message: "hello"
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/api/chat", expect.any(Object));
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

  it("throws a readable fallback for a non-JSON server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>server error</html>", { status: 500 }))
    );

    await expect(sendChatMessage({ message: "hello" })).rejects.toThrow("chat request failed");
  });

  it("throws a readable fallback for a non-JSON success response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 200 }))
    );

    await expect(sendChatMessage({ message: "hello" })).rejects.toThrow("chat request failed");
  });
});
