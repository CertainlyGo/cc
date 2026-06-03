import type { FastifyInstance } from "fastify";
import type { ChatRequest, ChatResponse } from "@ts-react-agent/shared";

export type AgentRunner = (request: Required<ChatRequest>) => Promise<string>;

type RouteDeps = {
  agentRunner: AgentRunner;
};

type ChatRequestBody = {
  message?: unknown;
  sessionId?: unknown;
};

function createSessionId(): string {
  return `session-${crypto.randomUUID()}`;
}

export function registerRoutes(server: FastifyInstance, deps: RouteDeps): void {
  server.get("/api/health", async () => ({ ok: true }));

  server.post<{ Body: ChatRequestBody; Reply: ChatResponse | { error: string } }>(
    "/api/chat",
    async (request, reply) => {
      const { message: rawMessage, sessionId: rawSessionId } = request.body ?? {};

      if (typeof rawMessage !== "string" || !rawMessage.trim()) {
        return reply.code(400).send({ error: "message is required" });
      }

      if (rawSessionId !== undefined && typeof rawSessionId !== "string") {
        return reply.code(400).send({ error: "sessionId must be a string" });
      }

      const message = rawMessage.trim();
      const sessionId = rawSessionId ?? createSessionId();

      try {
        const responseMessage = await deps.agentRunner({ message, sessionId });

        return reply.send({
          message: responseMessage,
          sessionId
        });
      } catch (error) {
        request.log.error({ err: error }, "agent request failed");
        return reply.code(500).send({ error: "agent request failed" });
      }
    }
  );
}
