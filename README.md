# TypeScript React Agent

Separated TypeScript agent app with a Fastify backend and React frontend.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.

## Development

The root `npm run dev` command starts the backend only.
For full-stack development, run the backend and frontend in separate terminals:

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

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```
