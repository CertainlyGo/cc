import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { registerRoutes, type AgentRunner } from "../src/routes.js";

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

  it("rejects a non-string message", async () => {
    const server = buildTestServer(async () => "unused");

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: 42
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "message is required" });
  });

  it("rejects a non-string session ID", async () => {
    const server = buildTestServer(async () => "unused");

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "hello",
        sessionId: 42
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "sessionId must be a string" });
  });

  it("generates a session ID when omitted", async () => {
    let receivedSessionId = "";
    const server = buildTestServer(async ({ sessionId }) => {
      receivedSessionId = sessionId;
      return "reply";
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "hello"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: "reply",
      sessionId: receivedSessionId
    });
    expect(receivedSessionId).toMatch(/^session-/);
  });

  it("returns a generic error when the agent runner fails", async () => {
    const server = buildTestServer(async () => {
      throw new Error("secret provider failure");
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "hello"
      }
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: "agent request failed" });
  });
});
