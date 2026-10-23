import { MatchesRepository } from '../repositories/matches.repository.js'
import { STATIC_MATCHES } from './matches.static.js'
import {
  BadRequestError,
  NotFoundError,
  ServiceUnavailableError,
  ConflictError,
} from '../errors/index.js'

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
  constructor(private matchesRepository: MatchesRepository) {}

  /** GET /matches — list (static fallback when DB empty/unavailable) */
  async findAll(limit = 20, offset = 0): Promise<MatchDTO[]> {
    try {
      const matches = await this.matchesRepository.findAll(limit, offset)
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
      const match = await this.matchesRepository.findById(id)
      if (match === null) {
        return STATIC_MATCHES.find((x) => x.id === id) ?? null
      }
      return {
        ...match,
        playedAt: (match as any).playedAt.toISOString(),
        createdAt: (match as any).createdAt.toISOString(),
      }
    } catch {
      return STATIC_MATCHES.find((x) => x.id === id) ?? null
    }
  }

  /**
   * POST /matches — idempotent via externalId unique constraint.
   * Uses a transaction via repository: match + matchHeroes created atomically.
   * On conflict (duplicate externalId) returns existing record.
   */
  async create(
    input: CreateMatchInput,
  ): Promise<{ id: number; created: boolean }> {
    try {
      const existing = await this.matchesRepository.findByExternalId(
        input.externalId,
      )
      if (existing) return { id: existing.id, created: false }

      const result = await this.matchesRepository.createWithHeroes(input)
      return { id: result.id, created: true }
    } catch (error: any) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : ''

      if (code === 'P2002') {
        const duplicate = await this.matchesRepository.findByExternalId(
          input.externalId,
        )
        if (duplicate) return { id: duplicate.id, created: false }
        throw new ConflictError('Duplicate match')
      }
      if (code === 'P2003') {
        throw new BadRequestError('One or more heroId values do not exist')
      }
      if (
        ['P1001', 'P1002', 'P1017', 'ECONNREFUSED', 'ETIMEDOUT'].includes(code)
      ) {
        throw new ServiceUnavailableError(
          'Database is unavailable; retry later',
        )
      }
      throw error
    }
  }

  /** Seed matches from static data (idempotent) */
  async seed(): Promise<void> {
    for (const m of STATIC_MATCHES) {
      const exists = await this.matchesRepository.findByExternalId(m.externalId)
      if (exists) continue
      try {
        await this.create({
          externalId: m.externalId,
          winnerSide: m.winnerSide,
          duration: m.duration,
          playedAt: m.playedAt,
          heroes: m.heroes as any,
        })
      } catch {
        // ignore
      }
    }
  }
}
