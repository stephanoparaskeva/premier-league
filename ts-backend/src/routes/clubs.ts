import type { FastifyPluginAsync } from 'fastify'
import type { Club } from '../types.js'

type Deps = {
  readonly clubs: readonly Club[]
}

const asArray = (x: unknown): readonly string[] => (Array.isArray(x) ? x.map(String) : x == null ? [] : [String(x)])

const uniq = (xs: readonly string[]): readonly string[] => Array.from(new Set(xs))

const matchesFilter =
  (codes: readonly string[], names: readonly string[]) =>
  (c: Club): boolean =>
    (codes.length === 0 || codes.includes(c.code)) && (names.length === 0 || names.includes(c.name))

const findByCode = (clubs: readonly Club[], code: string): Club | undefined => clubs.find((c) => c.code === code)

export const clubsRoutes =
  ({ clubs }: Deps): FastifyPluginAsync =>
  async (app) => {
    app.get('/', async (req) => {
      const q = req.query as Record<string, unknown>
      const codes = uniq(asArray(q.code))
      const names = uniq(asArray(q.name))
      return clubs.filter(matchesFilter(codes, names))
    })

    app.get<{ Params: { code: string } }>('/:code', async (req, reply) => {
      const club = findByCode(clubs, req.params.code)
      if (!club) return reply.code(404).send({ detail: 'Club not found.' })
      return club
    })
  }
