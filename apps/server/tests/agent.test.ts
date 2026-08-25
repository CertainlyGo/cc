import { describe, expect, it } from "vitest";
import { createChatOpenAIOptions, formatMessageContent } from "../src/agent.js";

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

describe("createChatOpenAIOptions", () => {
  it("passes an OpenAI-compatible base URL when configured", () => {
    expect(
      createChatOpenAIOptions({
        openAiApiKey: "compatible-key",
        openAiBaseUrl: "https://api.example.com/v1",
        openAiModel: "qwen-plus",
        port: 3001
      })
    ).toEqual({
      apiKey: "compatible-key",
      model: "qwen-plus",
      temperature: 0,
      configuration: {
        baseURL: "https://api.example.com/v1"
      }
    });
  });

  it("omits base URL configuration when not configured", () => {
    expect(
      createChatOpenAIOptions({
        openAiApiKey: "official-key",
        openAiModel: "gpt-4.1-mini",
        port: 3001
      })
    ).toEqual({
      apiKey: "official-key",
      model: "gpt-4.1-mini",
      temperature: 0
    });
  });
});
