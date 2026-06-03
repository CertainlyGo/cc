# TypeScript React Agent Design

## Goal

Build a TypeScript agent application with separated frontend and backend code. The first version should be small, runnable, and easy to extend with more tools or model behavior later.

## Scope

The app will use a monorepo layout:

- `apps/server`: Fastify backend that hosts the agent API.
- `apps/web`: Vite React frontend that provides a chat UI.
- `packages/shared`: Shared TypeScript request and response types.

The first agent will use LangChain.js with OpenAI chat models. It will include two local tools:

- `calculator`: handles simple arithmetic.
- `current_time`: returns the current server time.

The app will not include authentication, persistence, deployment scripts, streaming responses, or a database in the first version.

## Backend

The backend will expose:

- `GET /api/health`: returns service health.
- `POST /api/chat`: accepts `{ message, sessionId? }` and returns the agent response.

Backend modules:

- `src/index.ts`: starts the Fastify server.
- `src/routes.ts`: registers API routes.
- `src/agent.ts`: creates and invokes the LangChain agent.
- `src/tools.ts`: defines the local agent tools.
- `src/config.ts`: reads environment configuration.

If `OPENAI_API_KEY` is missing, the backend should return a clear configuration error instead of failing silently.

## Frontend

The frontend will be a React chat interface with:

- A message list.
- A text input.
- A send button.
- Loading state while waiting for the backend.
- Error display when the request fails.

The frontend will call the backend through a small API wrapper and keep a generated `sessionId` in browser storage so later versions can add multi-turn session behavior.

## Data Flow

1. The user enters a message in the React UI.
2. The frontend sends `POST /api/chat` with the message and session id.
3. The backend validates the payload.
4. The backend invokes the LangChain agent.
5. The agent may call local tools.
6. The backend returns the final assistant message.
7. The frontend appends the response to the message list.

## Testing

Tests should focus on deterministic behavior:

- Shared request and response type usage.
- Backend route validation and error handling.
- Local tool behavior.
- Frontend rendering and API wrapper behavior.

Real model calls should not run in automated tests because they require network access and an API key.

## Repository Sync

All generated project code and documentation should be committed locally and pushed to the configured remote repository `origin`, which points to `https://github.com/CertainlyGo/cc.git`.
