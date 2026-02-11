import type { FastifyPluginAsync } from 'fastify'

type Rates = {
  readonly http500Rate: number
  readonly http502Rate: number
}

const defaultRates: Rates = {
  http500Rate: 0.1,
  http502Rate: 0.1
}

const shouldBypass = (urlPath: string, referer: string | undefined): boolean =>
  urlPath.startsWith('/docs') || (referer ?? '').includes('/docs')

export const randomFailurePlugin =
  (rates: Partial<Rates> = {}): FastifyPluginAsync =>
  async (app) => {
    const r: Rates = { ...defaultRates, ...rates }

    app.addHook('onRequest', async (req, reply) => {
      if (shouldBypass(req.url, req.headers.referer)) return

      const x = Math.random()
      if (x < r.http500Rate) return reply.code(500).send()
      if (x < r.http500Rate + r.http502Rate) return reply.code(502).send()
    })
  }
