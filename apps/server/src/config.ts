import { config as loadDotenv } from "dotenv";

export type AppConfig = {
  openAiApiKey: string;
  openAiBaseUrl?: string;
  openAiModel: string;
  port: number;
};

type Env = Partial<Record<string, string>>;

export function loadEnvFile(
  envPath: string | URL,
  target?: Record<string, string>
): void {
  loadDotenv({
    path: envPath,
    ...(target ? { processEnv: target } : {})
  });
}

export function readConfig(env: Env): AppConfig {
  const openAiApiKey = env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const portText = env.SERVER_PORT ?? "3001";
  const port = Number(portText);

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("SERVER_PORT must be an integer between 0 and 65535");
  }

  return {
    openAiApiKey,
    openAiBaseUrl: env.OPENAI_BASE_URL,
    openAiModel: env.OPENAI_MODEL ?? "gpt-4.1-mini",
    port
  };
}
