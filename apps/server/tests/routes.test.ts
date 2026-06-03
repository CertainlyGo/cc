import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { registerRoutes, type AgentRunner } from "../src/routes";

function buildTestServer(agentRunner: AgentRunner) {
  const server = Fastify();
  registerRoutes(server, { agentRunner });
  return server;
}

describe("routes", () => {
  it("returns health status", async () => {
    const server = buildTestServer(async () => "unused");

    const response = await server.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it("returns an agent response", async () => {
    const server = buildTestServer(async ({ message, sessionId }) => {
      return `reply to ${message} in ${sessionId}`;
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "hello",
        sessionId: "session-1"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: "reply to hello in session-1",
      sessionId: "session-1"
    });
  });

  it("rejects an empty message", async () => {
    const server = buildTestServer(async () => "unused");

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "message is required" });
  });
});
