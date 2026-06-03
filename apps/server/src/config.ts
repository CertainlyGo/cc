export type AppConfig = {
  openAiApiKey: string;
  openAiModel: string;
  port: number;
};

type Env = Partial<Record<string, string>>;

export function readConfig(env: Env): AppConfig {
  const openAiApiKey = env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const portText = env.SERVER_PORT ?? "3001";
  const port = Number(portText);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SERVER_PORT must be an integer between 1 and 65535");
  }

  return {
    openAiApiKey,
    openAiModel: env.OPENAI_MODEL ?? "gpt-4.1-mini",
    port
  };
}
