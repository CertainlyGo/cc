import { describe, expect, it } from "vitest";
import { readConfig } from "../src/config.js";

describe("readConfig", () => {
  it("reads defaults and required API key", () => {
    const config = readConfig({
      OPENAI_API_KEY: "test-key"
    });

    expect(config.openAiApiKey).toBe("test-key");
    expect(config.openAiModel).toBe("gpt-4.1-mini");
    expect(config.openAiBaseUrl).toBeUndefined();
    expect(config.port).toBe(3001);
  });

  it("reads an OpenAI-compatible base URL", () => {
    const config = readConfig({
      OPENAI_API_KEY: "compatible-key",
      OPENAI_BASE_URL: "https://api.example.com/v1",
      OPENAI_MODEL: "qwen-plus"
    });

    expect(config.openAiApiKey).toBe("compatible-key");
    expect(config.openAiBaseUrl).toBe("https://api.example.com/v1");
    expect(config.openAiModel).toBe("qwen-plus");
  });

  it("reports a missing API key", () => {
    expect(() => readConfig({})).toThrow("OPENAI_API_KEY is required");
  });

  it("allows port 0 for ephemeral server binding", () => {
    const config = readConfig({
      OPENAI_API_KEY: "test-key",
      SERVER_PORT: "0"
    });

    expect(config.port).toBe(0);
  });

  it.each(["abc", "-1", "65536", "3001.5"])(
    "rejects invalid SERVER_PORT value %s",
    (serverPort) => {
      expect(() =>
        readConfig({
          OPENAI_API_KEY: "test-key",
          SERVER_PORT: serverPort
        })
      ).toThrow("SERVER_PORT must be an integer between 0 and 65535");
    }
  );
});
