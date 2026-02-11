const parseYmdUtc = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const formatYmdUtc = (dt: Date): string => {
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const addDaysYmd = (ymd: string, days: number): string => {
  const dt = parseYmdUtc(ymd)
  dt.setUTCDate(dt.getUTCDate() + days)
  return formatYmdUtc(dt)
}

export const isAfterYmd = (a: string, b: string): boolean => a > b
