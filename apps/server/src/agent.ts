import { ChatOpenAI } from "@langchain/openai";
import type { ChatOpenAIFields } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { ChatRequest } from "@ts-react-agent/shared";
import type { AppConfig } from "./config.js";
import { createAgentTools } from "./tools.js";

export function formatMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .flatMap((block) => {
        if (
          typeof block === "object" &&
          block !== null &&
          "type" in block &&
          block.type === "text" &&
          "text" in block &&
          typeof block.text === "string"
        ) {
          return [block.text];
        }

        return [];
      })
      .join("\n");

    if (text) {
      return text;
    }
  }

  return JSON.stringify(content ?? "");
}

export function createChatOpenAIOptions(config: AppConfig): ChatOpenAIFields {
  return {
    apiKey: config.openAiApiKey,
    model: config.openAiModel,
    temperature: 0,
    ...(config.openAiBaseUrl
      ? {
          configuration: {
            baseURL: config.openAiBaseUrl
          }
        }
      : {})
  };
}

export function createAgentRunner(config: AppConfig) {
  const model = new ChatOpenAI(createChatOpenAIOptions(config));

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

    return formatMessageContent(lastMessage?.content);
  };
}
