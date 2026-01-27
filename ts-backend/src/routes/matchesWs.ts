import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { addDaysYmd } from "../util/date.js";
import type { MessageGenerator } from "../messageGenerator.js";
import type { Match } from "../types.js";

type Deps = {
  readonly generator: MessageGenerator;
  readonly matches: readonly Match[];
};

type WebSocketConnection = {
  readonly socket: WebSocket;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const matchesWsRoutes =
  ({ generator, matches }: Deps): FastifyPluginAsync =>
  async (app: FastifyInstance) => {
    app.get("/ws", { websocket: true }, async (connection: WebSocketConnection, _req: FastifyRequest) => {
      const ws: WebSocket = connection.socket;

      const delayMs = 1000 + Math.random() * 2000;
      app.log.info({ delayMs }, "Accepting connection after delay");
      await sleep(delayMs);

      await generator.addConnection(ws);

      ws.on("message", async (buf: { toString(): string }) => {
        const msg = buf.toString();
        if (msg === "restart") {
          const start = matches[0]?.date;
          if (!start) return;
          generator.setCurrentDate(addDaysYmd(start, -2));
        }
      });

      ws.on("close", async () => {
        await generator.removeConnection(ws);
      });

      ws.on("error", async () => {
        await generator.removeConnection(ws);
      });
    });
  };
