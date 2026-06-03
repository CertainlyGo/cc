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

  return {
    openAiApiKey,
    openAiModel: env.OPENAI_MODEL ?? "gpt-4.1-mini",
    port: Number(env.SERVER_PORT ?? 3001)
  };
}
