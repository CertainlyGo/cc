import { describe, expect, it } from "vitest";
import { readConfig } from "../src/config";

describe("readConfig", () => {
  it("reads defaults and required API key", () => {
    const config = readConfig({
      OPENAI_API_KEY: "test-key"
    });

    expect(config.openAiApiKey).toBe("test-key");
    expect(config.openAiModel).toBe("gpt-4.1-mini");
    expect(config.port).toBe(3001);
  });

  it("reports a missing API key", () => {
    expect(() => readConfig({})).toThrow("OPENAI_API_KEY is required");
  });

  it.each(["abc", "0", "65536", "3001.5"])(
    "rejects invalid SERVER_PORT value %s",
    (serverPort) => {
      expect(() =>
        readConfig({
          OPENAI_API_KEY: "test-key",
          SERVER_PORT: serverPort
        })
      ).toThrow("SERVER_PORT must be an integer between 1 and 65535");
    }
  );
});
