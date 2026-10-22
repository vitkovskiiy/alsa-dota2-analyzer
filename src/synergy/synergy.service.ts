import prisma from '../db.js'
import { STATIC_HEROES } from '../heroes/heroes.static.js'
import { STATIC_MATCHES } from '../matches/matches.static.js'

export interface SynergyDTO {
  hero1Id: number
  hero1Name: string
  hero2Id: number
  hero2Name: string
  totalGames: number
  wins: number
  winRate: number
}

export class SynergyService {
  /**
   * Top N synergy pairs for a hero.
   * Single query with include вЂ” no N+1.
   */
  async topForHero(heroId: number, limit = 5): Promise<SynergyDTO[]> {
    try {
      const pairs = await prisma.heroPair.findMany({
        where: {
          OR: [{ hero1Id: heroId }, { hero2Id: heroId }],
          totalGames: { gte: 1 },
        },
        orderBy: { winRate: 'desc' },
        take: limit,
        include: {
          hero1: { select: { id: true, name: true } },
          hero2: { select: { id: true, name: true } },
        },
      })

      if (pairs.length > 0) {
        return pairs.map((p) => ({
          hero1Id: p.hero1.id,
          hero1Name: p.hero1.name,
          hero2Id: p.hero2.id,
          hero2Name: p.hero2.name,
          totalGames: p.totalGames,
          wins: p.wins,
          winRate: p.winRate,
        }))
      }
    } catch {
      // Use the same prototype behavior when PostgreSQL is unavailable.
    }

    return this._staticTopForHero(heroId, limit)
  }

  private _staticTopForHero(heroId: number, limit: number): SynergyDTO[] {
    const heroesById = new Map(STATIC_HEROES.map((hero) => [hero.id, hero]))
    const pairs = new Map<string, SynergyDTO>()

    for (const match of STATIC_MATCHES) {
      const teammates = match.heroes
      for (let i = 0; i < teammates.length; i++) {
        for (let j = i + 1; j < teammates.length; j++) {
          const a = teammates[i]
          const b = teammates[j]
          if (a.side !== b.side || (a.heroId !== heroId && b.heroId !== heroId))
            continue

          const hero1Id = Math.min(a.heroId, b.heroId)
          const hero2Id = Math.max(a.heroId, b.heroId)
          const hero1 = heroesById.get(hero1Id)
          const hero2 = heroesById.get(hero2Id)
          if (!hero1 || !hero2) continue

          const key = `${hero1Id}-${hero2Id}`
          const pair = pairs.get(key) ?? {
            hero1Id,
            hero1Name: hero1.name,
            hero2Id,
            hero2Name: hero2.name,
            totalGames: 0,
            wins: 0,
            winRate: 0,
          }
          pair.totalGames++
          if (a.won) pair.wins++
          pair.winRate = pair.wins / pair.totalGames
          pairs.set(key, pair)
        }
      }
    }

    return [...pairs.values()]
      .sort((a, b) => b.winRate - a.winRate || b.totalGames - a.totalGames)
      .slice(0, limit)
  }

  /**
   * Recompute all HeroPair rows from MatchHero.
   * Called after seeding / importing matches.
   * Uses a transaction per pair to stay consistent.
   */
  async recompute(): Promise<void> {
    // Get all matches with their heroes in one query
    const matches = await prisma.match.findMany({
      include: {
        matchHeroes: { select: { heroId: true, side: true, won: true } },
      },
    })

    // Accumulate (heroA, heroB) в†’ {games, wins}
    const acc = new Map<
      string,
      { h1: number; h2: number; games: number; wins: number }
    >()

    for (const match of matches) {
      const heroes = match.matchHeroes
      for (let i = 0; i < heroes.length; i++) {
        for (let j = i + 1; j < heroes.length; j++) {
          const a = heroes[i]
          const b = heroes[j]
          // Only same-side pairs are "synergy"
          if (a.side !== b.side) continue
          const key = `${Math.min(a.heroId, b.heroId)}-${Math.max(a.heroId, b.heroId)}`
          const existing = acc.get(key) ?? {
            h1: Math.min(a.heroId, b.heroId),
            h2: Math.max(a.heroId, b.heroId),
            games: 0,
            wins: 0,
          }
          existing.games++
          if (a.won) existing.wins++
          acc.set(key, existing)
        }
      }
    }

    // Upsert all pairs
    for (const { h1, h2, games, wins } of acc.values()) {
      await prisma.heroPair.upsert({
        where: { hero1Id_hero2Id: { hero1Id: h1, hero2Id: h2 } },
        update: {
          totalGames: games,
          wins,
          winRate: games > 0 ? wins / games : 0,
        },
        create: {
          hero1Id: h1,
          hero2Id: h2,
          totalGames: games,
          wins,
          winRate: games > 0 ? wins / games : 0,
        },
      })
    }
  }
}

export const synergyService = new SynergyService()
