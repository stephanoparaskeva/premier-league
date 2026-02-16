import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import { addDaysYmd } from '../util/date.js'
import type { MessageGenerator } from '../messageGenerator.js'
import type { Match } from '../types.js'

type Deps = {
  readonly generator: MessageGenerator
  readonly matches: readonly Match[]
}

type WebSocketConnection = {
  readonly socket: WebSocket
}

export const matchesWsRoutes =
  ({ generator, matches }: Deps): FastifyPluginAsync =>
  async (app: FastifyInstance) => {
    app.get('/ws', { websocket: true }, async (ws: WebSocket, _req: FastifyRequest) => {
      await generator.addConnection(ws)

      ws.on('close', async () => generator.removeConnection(ws))
      ws.on('error', async () => generator.removeConnection(ws))
    })
  }
