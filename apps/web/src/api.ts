import type { ChatErrorResponse, ChatRequest, ChatResponse } from "@ts-react-agent/shared";

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

function isChatErrorResponse(value: unknown): value is ChatErrorResponse {
  return typeof value === "object"
    && value !== null
    && "error" in value
    && typeof value.error === "string";
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error("chat request failed");
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const payload = await readJson(response);

  if (!response.ok) {
    if (isChatErrorResponse(payload)) {
      throw new Error(payload.error);
    }

    throw new Error("chat request failed");
  }

  return payload as ChatResponse;
}
