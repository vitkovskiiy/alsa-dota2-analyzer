export interface StaticMatch {
  id: number
  externalId: string
  winnerSide: 'radiant' | 'dire'
  duration: number
  playedAt: string
  heroes: Array<{ heroId: number; side: 'radiant' | 'dire'; won: boolean }>
}

export const STATIC_MATCHES: StaticMatch[] = [
  {
    id: 1,
    externalId: 'ext-001',
    winnerSide: 'radiant',
    duration: 2520,
    playedAt: '2026-10-01T10:00:00.000Z',
    heroes: [
      { heroId: 1, side: 'radiant', won: true },
      { heroId: 2, side: 'radiant', won: true },
      { heroId: 3, side: 'dire', won: false },
      { heroId: 4, side: 'dire', won: false },
    ],
  },
  {
    id: 2,
    externalId: 'ext-002',
    winnerSide: 'dire',
    duration: 1980,
    playedAt: '2026-10-02T15:30:00.000Z',
    heroes: [
      { heroId: 1, side: 'radiant', won: false },
      { heroId: 5, side: 'radiant', won: false },
      { heroId: 3, side: 'dire', won: true },
      { heroId: 6, side: 'dire', won: true },
    ],
  },
  {
    id: 3,
    externalId: 'ext-003',
    winnerSide: 'radiant',
    duration: 3100,
    playedAt: '2026-10-03T18:00:00.000Z',
    heroes: [
      { heroId: 1, side: 'radiant', won: true },
      { heroId: 2, side: 'radiant', won: true },
      { heroId: 7, side: 'radiant', won: true },
      { heroId: 8, side: 'dire', won: false },
    ],
  },
]
