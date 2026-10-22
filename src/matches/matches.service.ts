import prisma from '../db.js'
import { STATIC_MATCHES, StaticMatch } from './matches.static.js'

export interface MatchDTO {
  id: number
  externalId: string
  winnerSide: string
  duration: number
  playedAt: string
}

export interface CreateMatchInput {
  externalId: string
  winnerSide: 'radiant' | 'dire'
  duration: number
  playedAt: string
  heroes: Array<{ heroId: number; side: 'radiant' | 'dire' }>
}

export class MatchesService {
  /** GET /matches — list (static fallback when DB empty/unavailable) */
  async findAll(limit = 20, offset = 0): Promise<MatchDTO[]> {
    try {
      const matches = await prisma.match.findMany({
        take: limit,
        skip: offset,
        orderBy: { playedAt: 'desc' },
        select: {
          id: true,
          externalId: true,
          winnerSide: true,
          duration: true,
          playedAt: true,
        },
      })
      if (matches.length === 0) return this._staticList(limit, offset)
      return matches.map((m) => ({ ...m, playedAt: m.playedAt.toISOString() }))
    } catch {
      return this._staticList(limit, offset)
    }
  }

  private _staticList(limit: number, offset: number): MatchDTO[] {
    return STATIC_MATCHES.slice(offset, offset + limit).map((m) => ({
      id: m.id,
      externalId: m.externalId,
      winnerSide: m.winnerSide,
      duration: m.duration,
      playedAt: m.playedAt,
    }))
  }

  /** GET /matches/:id — falls back to static when DB returns null */
  async findById(id: number) {
    try {
      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          matchHeroes: {
            include: { hero: { select: { id: true, name: true, role: true } } },
          },
        },
      })
      if (match === null) {
        // DB empty phase — return static
        return STATIC_MATCHES.find((x) => x.id === id) ?? null
      }
      return {
        ...match,
        playedAt: match.playedAt.toISOString(),
        createdAt: match.createdAt.toISOString(),
      }
    } catch {
      return STATIC_MATCHES.find((x) => x.id === id) ?? null
    }
  }

  /**
   * POST /matches — idempotent via externalId unique constraint.
   * Uses a transaction: match + matchHeroes created atomically.
   * On conflict (duplicate externalId) returns existing record.
   */
  async create(
    input: CreateMatchInput,
  ): Promise<{ id: number; created: boolean }> {
    const existing = await prisma.match.findUnique({
      where: { externalId: input.externalId },
      select: { id: true },
    })
    if (existing) return { id: existing.id, created: false }

    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          externalId: input.externalId,
          winnerSide: input.winnerSide,
          duration: input.duration,
          playedAt: new Date(input.playedAt),
        },
      })
      const side = input.winnerSide
      await tx.matchHero.createMany({
        data: input.heroes.map((h) => ({
          matchId: match.id,
          heroId: h.heroId,
          side: h.side,
          won: h.side === side,
        })),
      })
      return match
    })

    return { id: result.id, created: true }
  }

  /** Seed matches from static data (idempotent) */
  async seed(): Promise<void> {
    for (const m of STATIC_MATCHES) {
      const exists = await prisma.match.findUnique({
        where: { externalId: m.externalId },
      })
      if (exists) continue
      await this.create({
        externalId: m.externalId,
        winnerSide: m.winnerSide,
        duration: m.duration,
        playedAt: m.playedAt,
        heroes: m.heroes,
      })
    }
  }
}

export const matchesService = new MatchesService()
