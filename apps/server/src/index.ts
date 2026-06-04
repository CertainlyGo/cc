import cors from "@fastify/cors";
import Fastify from "fastify";
import { createAgentRunner } from "./agent.js";
import { loadEnvFile, readConfig } from "./config.js";
import { registerRoutes } from "./routes.js";

async function main() {
  loadEnvFile(new URL("../../../.env", import.meta.url));

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
