import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { ChatRequest } from "@ts-react-agent/shared";
import type { AppConfig } from "./config";
import { createAgentTools } from "./tools";

export function createAgentRunner(config: AppConfig) {
  const model = new ChatOpenAI({
    apiKey: config.openAiApiKey,
    model: config.openAiModel,
    temperature: 0
  });

  const agent = createReactAgent({
    llm: model,
    tools: createAgentTools()
  });

  return async function runAgent(request: Required<ChatRequest>): Promise<string> {
    const result = await agent.invoke({
      messages: [
        {
          role: "system",
          content: "You are a helpful TypeScript agent. Use tools when they help."
        },
        {
          role: "user",
          content: request.message
        }
      ]
    });

    const lastMessage = result.messages.at(-1);
    const content = lastMessage?.content;

    return typeof content === "string" ? content : JSON.stringify(content ?? "");
  };
}
