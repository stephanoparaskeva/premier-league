import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

import { loadClubs, loadMatches, indexClubsByName } from "./data.js";
import { randomFailurePlugin } from "./middleware/randomFailure.js";
import { clubsRoutes } from "./routes/clubs.js";
import { matchesWsRoutes } from "./routes/matchesWs.js";
import { createMessageGenerator } from "./messageGenerator.js";

const port = Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";

const main = async (): Promise<void> => {
  const [clubs, matches] = await Promise.all([loadClubs(), loadMatches()]);
  const clubsByName = indexClubsByName(clubs);

  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(websocket);
  await app.register(randomFailurePlugin());
  await app.register(clubsRoutes({ clubs }), { prefix: "/clubs" });

  const generator = createMessageGenerator({ matches, clubsByName });
  await app.register(matchesWsRoutes({ generator, matches }), { prefix: "/matches" });

  void generator.start();

  await app.listen({ port, host });
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
