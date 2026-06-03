import type { FastifyInstance } from "fastify";
import type { ChatRequest, ChatResponse } from "@ts-react-agent/shared";

export type AgentRunner = (request: Required<ChatRequest>) => Promise<string>;

type RouteDeps = {
  agentRunner: AgentRunner;
};

function createSessionId(): string {
  return `session-${crypto.randomUUID()}`;
}

export function registerRoutes(server: FastifyInstance, deps: RouteDeps): void {
  server.get("/api/health", async () => ({ ok: true }));

  server.post<{ Body: ChatRequest; Reply: ChatResponse | { error: string } }>(
    "/api/chat",
    async (request, reply) => {
      const message = request.body?.message?.trim();

      if (!message) {
        return reply.code(400).send({ error: "message is required" });
      }

      const sessionId = request.body.sessionId ?? createSessionId();
      const responseMessage = await deps.agentRunner({ message, sessionId });

      return reply.send({
        message: responseMessage,
        sessionId
      });
    }
  );
}
