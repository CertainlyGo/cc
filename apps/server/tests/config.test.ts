import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadEnvFile, readConfig } from "../src/config.js";

describe("readConfig", () => {
  it("loads environment values from an explicit env file path", () => {
    const directory = mkdtempSync(join(tmpdir(), "ts-react-agent-env-"));
    const envPath = join(directory, ".env");
    const target: Record<string, string> = {};

    writeFileSync(
      envPath,
      [
        "OPENAI_API_KEY=compatible-key",
        "OPENAI_BASE_URL=https://api.example.com/v1",
        "OPENAI_MODEL=qwen-plus"
      ].join("\n")
    );

    loadEnvFile(envPath, target);

    expect(target.OPENAI_API_KEY).toBe("compatible-key");
    expect(target.OPENAI_BASE_URL).toBe("https://api.example.com/v1");
    expect(target.OPENAI_MODEL).toBe("qwen-plus");
  });

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
