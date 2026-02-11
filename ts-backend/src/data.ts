import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Club, Match } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const readJson = async <T>(relPath: string): Promise<T> => {
  const abs = path.join(__dirname, '..', relPath)
  const raw = await readFile(abs, 'utf8')
  return JSON.parse(raw) as T
}

export const loadClubs = (): Promise<readonly Club[]> => readJson<readonly Club[]>('clubs.json')
export const loadMatches = (): Promise<readonly Match[]> => readJson<readonly Match[]>('matches.json')

export const indexClubsByName = (clubs: readonly Club[]): ReadonlyMap<string, Club> => new Map(clubs.map((c) => [c.name, c]))
