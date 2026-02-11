import type { WebSocket } from '@fastify/websocket'
import type { Club, Match, WsPayload } from './types.js'
import { addDaysYmd, isAfterYmd } from './util/date.js'

type GeneratorConfig = {
  readonly dayDurationMs: number
  readonly disconnectRate: number
  readonly codeErrorRate: number
  readonly championsLeagueRate: number
}

const defaults: GeneratorConfig = {
  dayDurationMs: 100,
  disconnectRate: 0.0,
  codeErrorRate: 0.01,
  championsLeagueRate: 0.05
}

type State = {
  readonly currentDate: string
}

const pickOne = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]!

const normalizeMatch =
  (clubsByName: ReadonlyMap<string, Club>, cfg: GeneratorConfig) =>
  (m: Match): Match => {
    const homeClub = clubsByName.get(m.home)
    const awayClub = clubsByName.get(m.away)

    const home = homeClub ? homeClub.code : m.home
    const away = awayClub ? awayClub.code : m.away

    const maybeLower = (s: string) => (Math.random() < cfg.codeErrorRate ? s.toLowerCase() : s)

    return {
      ...m,
      competition: m.competition ?? 'Premier League',
      home: maybeLower(home),
      away: maybeLower(away)
    }
  }

const championsLeagueMatch = (clubsByName: ReadonlyMap<string, Club>, date: string): Match => {
  const home = pickOne(Array.from(clubsByName.values())).name
  const away = pickOne(['Barcelona', 'FC Bayern Munich', 'Dubrava'] as const)
  return {
    round: 'Group Stages',
    competition: 'Champions League',
    date,
    home,
    away,
    score: { ft: [Math.floor(10 * Math.random()), Math.floor(10 * Math.random())] }
  }
}

const safeSendJson = async (ws: WebSocket, payload: WsPayload): Promise<boolean> => {
  try {
    ws.send(JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

const isOpen = (ws: WebSocket): boolean => ws.readyState === ws.OPEN

export type MessageGenerator = {
  readonly addConnection: (ws: WebSocket) => Promise<void>
  readonly removeConnection: (ws: WebSocket) => Promise<void>
  readonly start: () => Promise<void>
  readonly getCurrentDate: () => string
  readonly setCurrentDate: (d: string) => void
}

export const createMessageGenerator = (args: {
  readonly matches: readonly Match[]
  readonly clubsByName: ReadonlyMap<string, Club>
  readonly config?: Partial<GeneratorConfig>
}): MessageGenerator => {
  const cfg: GeneratorConfig = { ...defaults, ...(args.config ?? {}) }

  let state: State = { currentDate: args.matches[0]?.date ?? '1970-01-01' }

  const sockets = new Set<WebSocket>()

  const setCurrentDate = (d: string) => {
    state = { ...state, currentDate: d }
  }

  const addConnection = async (ws: WebSocket) => {
    sockets.add(ws)
  }

  const removeConnection = async (ws: WebSocket) => {
    sockets.delete(ws)
    try {
      if (isOpen(ws)) ws.close()
    } catch {
      // ignore
    }
  }

  const prune = async () => {
    for (const ws of Array.from(sockets)) {
      if (!isOpen(ws)) {
        await removeConnection(ws)
        continue
      }
      if (Math.random() < cfg.disconnectRate) {
        await removeConnection(ws)
      }
    }
  }

  const broadcast = async (payload: WsPayload) => {
    if (sockets.size === 0) return

    for (const ws of Array.from(sockets)) {
      if (!isOpen(ws)) {
        await removeConnection(ws)
        continue
      }
      const ok = await safeSendJson(ws, payload)
      if (!ok) await removeConnection(ws)
    }
  }

  const start = async () => {
    while (true) {
      try {
        await prune()

        if (sockets.size === 0) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }

        const today = state.currentDate
        const todays = args.matches.filter((m) => m.date === today)

        const maybeCL = Math.random() < cfg.championsLeagueRate ? [championsLeagueMatch(args.clubsByName, today)] : []

        const normalized = [...todays, ...maybeCL].map(normalizeMatch(args.clubsByName, cfg))

        if (normalized.length > 0) {
          const payload: WsPayload = normalized.length === 1 ? normalized[0]! : normalized
          await broadcast(payload)
        }

        await new Promise((r) => setTimeout(r, cfg.dayDurationMs))

        const next = addDaysYmd(state.currentDate, 1)
        setCurrentDate(next)

        const last = args.matches[args.matches.length - 1]?.date
        if (last && isAfterYmd(state.currentDate, last)) {
          await broadcast({ type: 'season_finished' })
          for (const ws of Array.from(sockets)) await removeConnection(ws)
          setCurrentDate(addDaysYmd(args.matches[0]!.date, -2))
        }
      } catch {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
  }

  return {
    addConnection,
    removeConnection,
    start,
    getCurrentDate: () => state.currentDate,
    setCurrentDate
  }
}
