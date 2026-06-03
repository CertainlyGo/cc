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
