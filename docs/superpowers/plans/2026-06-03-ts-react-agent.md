# TypeScript React Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separated TypeScript agent app with a Fastify backend, LangChain.js agent, shared types, and a React chat frontend.

**Architecture:** Use a npm workspace monorepo with `apps/server`, `apps/web`, and `packages/shared`. The backend exposes REST endpoints and injects an agent runner into routes so route behavior can be tested without real model calls. The frontend is a Vite React app that calls the backend through a small API wrapper.

**Tech Stack:** TypeScript, npm workspaces, Fastify, LangChain.js, OpenAI chat models, Vite, React, Vitest, React Testing Library.

---

## File Structure

- Create `package.json`: root workspace scripts for install, dev, test, build, lint.
- Create `tsconfig.base.json`: shared TypeScript compiler defaults.
- Create `.gitignore`: ignores dependency, build, and environment outputs.
- Create `.env.example`: documents backend and frontend environment variables.
- Create `README.md`: setup, development, and test instructions.
- Create `packages/shared/package.json`: shared package metadata.
- Create `packages/shared/tsconfig.json`: shared package compiler config.
- Create `packages/shared/src/types.ts`: request and response contracts.
- Create `packages/shared/src/index.ts`: shared exports.
- Create `packages/shared/tests/types.test.ts`: contract behavior tests.
- Create `apps/server/package.json`: backend scripts and dependencies.
- Create `apps/server/tsconfig.json`: backend compiler config.
- Create `apps/server/vitest.config.ts`: backend test config.
- Create `apps/server/src/config.ts`: environment parsing.
- Create `apps/server/src/tools.ts`: deterministic tool implementations and LangChain tool wrappers.
- Create `apps/server/src/agent.ts`: LangChain agent runner factory.
- Create `apps/server/src/routes.ts`: Fastify routes.
- Create `apps/server/src/index.ts`: server entrypoint.
- Create `apps/server/tests/tools.test.ts`: calculator and time tool tests.
- Create `apps/server/tests/config.test.ts`: config tests.
- Create `apps/server/tests/routes.test.ts`: route tests with injected runner.
- Create `apps/web/package.json`: frontend scripts and dependencies.
- Create `apps/web/index.html`: Vite HTML entry.
- Create `apps/web/tsconfig.json`: frontend compiler config.
- Create `apps/web/vite.config.ts`: Vite and test config.
- Create `apps/web/src/api.ts`: API client.
- Create `apps/web/src/App.tsx`: chat UI.
- Create `apps/web/src/main.tsx`: React entrypoint.
- Create `apps/web/src/styles.css`: frontend styles.
- Create `apps/web/src/App.test.tsx`: UI behavior tests.
- Create `apps/web/src/api.test.ts`: API wrapper tests.

---

### Task 1: Workspace Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Create root workspace files**

Create `package.json`:

```json
{
  "name": "ts-react-agent",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace apps/server",
    "dev:server": "npm run dev --workspace apps/server",
    "dev:web": "npm run dev --workspace apps/web",
    "test": "npm run test --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "engines": {
    "node": ">=20"
  }
}
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

Create `.gitignore`:

```gitignore
node_modules
dist
coverage
.env
.env.local
*.log
```

Create `.env.example`:

```env
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4.1-mini
SERVER_PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

Create `README.md`:

```markdown
# TypeScript React Agent

Separated TypeScript agent app with a Fastify backend and React frontend.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.

## Development

```bash
npm run dev:server
npm run dev:web
```

Backend defaults to `http://localhost:3001`.
Frontend defaults to `http://localhost:5173`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```
```

- [ ] **Step 2: Verify scaffold files are visible**

Run: `rg --files -uu`

Expected: output includes `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`, and `README.md`.

- [ ] **Step 3: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .env.example README.md
git commit -m "chore: scaffold workspace"
```

---

### Task 2: Shared API Contracts

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/tests/types.test.ts`

- [ ] **Step 1: Write the failing shared contract test**

Create `packages/shared/package.json`:

```json
{
  "name": "@ts-react-agent/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "test": "vitest run",
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src"]
}
```

Create `packages/shared/tests/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { ChatRequest, ChatResponse } from "../src/index";

describe("shared chat contracts", () => {
  it("allows a chat request with an optional session id", () => {
    const request: ChatRequest = {
      message: "What time is it?",
      sessionId: "session-123"
    };

    expect(request.message).toBe("What time is it?");
    expect(request.sessionId).toBe("session-123");
  });

  it("allows a successful chat response", () => {
    const response: ChatResponse = {
      message: "It is 12:00.",
      sessionId: "session-123"
    };

    expect(response.message).toBe("It is 12:00.");
    expect(response.sessionId).toBe("session-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace packages/shared`

Expected: FAIL because `packages/shared/src/index.ts` does not exist.

- [ ] **Step 3: Write minimal shared implementation**

Create `packages/shared/src/types.ts`:

```ts
export type ChatRequest = {
  message: string;
  sessionId?: string;
};

export type ChatResponse = {
  message: string;
  sessionId: string;
};

export type ChatErrorResponse = {
  error: string;
};
```

Create `packages/shared/src/index.ts`:

```ts
export type { ChatErrorResponse, ChatRequest, ChatResponse } from "./types";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --workspace packages/shared`

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared chat contracts"
```

---

### Task 3: Backend Tools and Config

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/vitest.config.ts`
- Test: `apps/server/tests/tools.test.ts`
- Test: `apps/server/tests/config.test.ts`
- Create: `apps/server/src/tools.ts`
- Create: `apps/server/src/config.ts`

- [ ] **Step 1: Write failing backend tool and config tests**

Create `apps/server/package.json`:

```json
{
  "name": "@ts-react-agent/server",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@fastify/cors": "^11.0.1",
    "@langchain/core": "^0.3.66",
    "@langchain/langgraph": "^0.4.4",
    "@langchain/openai": "^0.6.9",
    "@ts-react-agent/shared": "file:../../packages/shared",
    "fastify": "^5.4.0",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "tsx": "^4.20.3",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

Create `apps/server/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

Create `apps/server/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node"
  }
});
```

Create `apps/server/tests/tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateExpression, getCurrentTimeText } from "../src/tools";

describe("calculator tool", () => {
  it("calculates arithmetic expressions", () => {
    expect(calculateExpression("2 + 3 * 4")).toBe("14");
  });

  it("rejects unsafe expressions", () => {
    expect(calculateExpression("process.exit()")).toContain("Invalid calculator expression");
  });
});

describe("current time tool", () => {
  it("formats an injected date", () => {
    const date = new Date("2026-06-03T12:34:56.000Z");
    expect(getCurrentTimeText(date)).toBe("2026-06-03T12:34:56.000Z");
  });
});
```

Create `apps/server/tests/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readConfig } from "../src/config";

describe("readConfig", () => {
  it("reads defaults and required API key", () => {
    const config = readConfig({
      OPENAI_API_KEY: "test-key"
    });

    expect(config.openAiApiKey).toBe("test-key");
    expect(config.openAiModel).toBe("gpt-4.1-mini");
    expect(config.port).toBe(3001);
  });

  it("reports a missing API key", () => {
    expect(() => readConfig({})).toThrow("OPENAI_API_KEY is required");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test --workspace apps/server`

Expected: FAIL because `apps/server/src/tools.ts` and `apps/server/src/config.ts` do not exist.

- [ ] **Step 3: Write minimal backend tool and config implementation**

Create `apps/server/src/tools.ts`:

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorPattern = /^[\d\s+\-*/().%]+$/;

export function calculateExpression(expression: string): string {
  if (!calculatorPattern.test(expression)) {
    return "Invalid calculator expression. Use only numbers and arithmetic operators.";
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return "Invalid calculator expression. Result must be a finite number.";
    }

    return String(result);
  } catch {
    return "Invalid calculator expression. Check the syntax and try again.";
  }
}

export function getCurrentTimeText(now = new Date()): string {
  return now.toISOString();
}

export function createAgentTools() {
  const calculator = tool(
    async ({ expression }) => calculateExpression(expression),
    {
      name: "calculator",
      description: "Calculate a simple arithmetic expression.",
      schema: z.object({
        expression: z.string().describe("Arithmetic expression using numbers and operators.")
      })
    }
  );

  const currentTime = tool(
    async () => getCurrentTimeText(),
    {
      name: "current_time",
      description: "Return the current server time as an ISO timestamp.",
      schema: z.object({})
    }
  );

  return [calculator, currentTime];
}
```

Create `apps/server/src/config.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test --workspace apps/server`

Expected: PASS for tool and config tests.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat: add backend tools and config"
```

---

### Task 4: Backend Routes and Agent Runner

**Files:**
- Test: `apps/server/tests/routes.test.ts`
- Create: `apps/server/src/agent.ts`
- Create: `apps/server/src/routes.ts`
- Create: `apps/server/src/index.ts`

- [ ] **Step 1: Write failing route tests**

Create `apps/server/tests/routes.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test --workspace apps/server`

Expected: FAIL because `apps/server/src/routes.ts` does not exist.

- [ ] **Step 3: Write minimal route and agent implementation**

Create `apps/server/src/routes.ts`:

```ts
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
```

Create `apps/server/src/agent.ts`:

```ts
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
```

Create `apps/server/src/index.ts`:

```ts
import cors from "@fastify/cors";
import Fastify from "fastify";
import { createAgentRunner } from "./agent";
import { readConfig } from "./config";
import { registerRoutes } from "./routes";

async function main() {
  const config = readConfig(process.env);
  const server = Fastify({
    logger: true
  });

  await server.register(cors, {
    origin: true
  });

  registerRoutes(server, {
    agentRunner: createAgentRunner(config)
  });

  await server.listen({
    port: config.port,
    host: "0.0.0.0"
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test --workspace apps/server`

Expected: PASS for config, tools, and routes tests.

- [ ] **Step 5: Commit**

```bash
git add apps/server
git commit -m "feat: add backend agent api"
```

---

### Task 5: React API Wrapper and Chat UI

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Test: `apps/web/src/api.test.ts`
- Test: `apps/web/src/App.test.tsx`
- Create: `apps/web/src/api.ts`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/styles.css`

- [ ] **Step 1: Write failing frontend tests**

Create `apps/web/package.json`:

```json
{
  "name": "@ts-react-agent/web",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "test": "vitest run",
    "build": "tsc -p tsconfig.json && vite build",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@ts-react-agent/shared": "file:../../packages/shared",
    "@vitejs/plugin-react": "^4.6.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "vite": "^7.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Create `apps/web/vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts"
  }
});
```

Create `apps/web/src/test-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `apps/web/src/api.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./api";

describe("sendChatMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts a chat request and returns the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        message: "hello back",
        sessionId: "session-1"
      })))
    );

    const result = await sendChatMessage({
      message: "hello",
      sessionId: "session-1"
    });

    expect(result).toEqual({
      message: "hello back",
      sessionId: "session-1"
    });
  });

  it("throws a readable backend error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        error: "message is required"
      }), { status: 400 }))
    );

    await expect(sendChatMessage({ message: "" })).rejects.toThrow("message is required");
  });
});
```

Create `apps/web/src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./api";

describe("App", () => {
  it("sends a user message and renders the assistant response", async () => {
    vi.spyOn(api, "sendChatMessage").mockResolvedValue({
      message: "The answer is 4.",
      sessionId: "session-1"
    });

    render(<App />);

    await userEvent.type(screen.getByLabelText("Message"), "2 + 2");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("2 + 2")).toBeInTheDocument();
    expect(await screen.findByText("The answer is 4.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test --workspace apps/web`

Expected: FAIL because `apps/web/src/api.ts` and `apps/web/src/App.tsx` do not exist.

- [ ] **Step 3: Write minimal frontend implementation**

Create `apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TypeScript React Agent</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `apps/web/src/api.ts`:

```ts
import type { ChatErrorResponse, ChatRequest, ChatResponse } from "@ts-react-agent/shared";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const body = (await response.json()) as ChatResponse | ChatErrorResponse;

  if (!response.ok) {
    throw new Error("error" in body ? body.error : "Chat request failed");
  }

  return body as ChatResponse;
}
```

Create `apps/web/src/App.tsx`:

```tsx
import { FormEvent, useMemo, useState } from "react";
import { sendChatMessage } from "./api";
import "./styles.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getSessionId() {
  const existing = window.localStorage.getItem("ts-react-agent-session-id");

  if (existing) {
    return existing;
  }

  const created = `session-${crypto.randomUUID()}`;
  window.localStorage.setItem("ts-react-agent-session-id", created);
  return created;
}

export default function App() {
  const sessionId = useMemo(() => getSessionId(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await sendChatMessage({ message, sessionId });
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.message
        }
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chat request failed");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="Agent chat">
        <header className="chat-header">
          <h1>TypeScript Agent</h1>
        </header>

        <div className="message-list">
          {messages.length === 0 ? (
            <p className="empty-state">Ask the agent something.</p>
          ) : (
            messages.map((message) => (
              <article className={`message message-${message.role}`} key={message.id}>
                <span>{message.role === "user" ? "You" : "Agent"}</span>
                <p>{message.content}</p>
              </article>
            ))
          )}
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="message-input">Message</label>
          <input
            id="message-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about time, math, or anything else"
          />
          <button type="submit" disabled={isSending}>
            {isSending ? "Sending" : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
```

Create `apps/web/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `apps/web/src/styles.css`:

```css
:root {
  color: #172026;
  background: #f4f7f5;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.chat-panel {
  width: min(860px, 100%);
  height: min(760px, calc(100vh - 48px));
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  border: 1px solid #d6ded8;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e3e8e4;
}

.chat-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 20px 24px;
}

.empty-state {
  color: #6a756f;
  margin: auto;
}

.message {
  max-width: 78%;
  padding: 12px 14px;
  border-radius: 8px;
}

.message span {
  display: block;
  color: #52615a;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.message p {
  margin: 0;
  line-height: 1.5;
}

.message-user {
  align-self: flex-end;
  background: #e8f1ff;
}

.message-assistant {
  align-self: flex-start;
  background: #eef5ee;
}

.error-message {
  margin: 0;
  padding: 0 24px 12px;
  color: #b42318;
}

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e3e8e4;
}

.composer label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.composer input {
  min-width: 0;
  border: 1px solid #cbd5cf;
  border-radius: 8px;
  padding: 12px 14px;
}

.composer button {
  border: 0;
  border-radius: 8px;
  background: #1f6f5f;
  color: white;
  padding: 0 18px;
  font-weight: 700;
  cursor: pointer;
}

.composer button:disabled {
  background: #8ba39b;
  cursor: not-allowed;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test --workspace apps/web`

Expected: PASS for API and App tests.

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat: add react chat frontend"
```

---

### Task 6: Full Workspace Verification and Remote Sync

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Install dependencies**

Run: `npm install`

Expected: dependency installation completes and creates `package-lock.json`.

- [ ] **Step 2: Run all tests**

Run: `npm test`

Expected: shared, server, and web test suites pass.

- [ ] **Step 3: Run all builds**

Run: `npm run build`

Expected: shared, server, and web builds complete.

- [ ] **Step 4: Update README if command output differs from documented commands**

If commands require different workspace names or environment setup, update `README.md` with the verified commands.

- [ ] **Step 5: Commit verification docs or lockfile changes**

```bash
git add package-lock.json README.md
git commit -m "chore: verify workspace setup"
```

- [ ] **Step 6: Push all commits**

```bash
git push origin main
```

Expected: remote `origin/main` includes all implementation commits.
