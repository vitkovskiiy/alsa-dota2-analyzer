import { SynergyRepository } from '../repositories/synergy.repository.js'
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
  constructor(private synergyRepository: SynergyRepository) {}

  async topForHero(heroId: number, limit = 5): Promise<SynergyDTO[]> {
    try {
      const pairs = await this.synergyRepository.findPairsForHero(heroId, limit)

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
      // Use the static prototype when PostgreSQL is empty or unavailable.
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
          pair.winRate = pair.totalGames === 0 ? 0 : pair.wins / pair.totalGames
          pairs.set(key, pair)
        }
      }
    }

    return [...pairs.values()]
      .sort((a, b) => b.winRate - a.winRate || b.totalGames - a.totalGames)
      .slice(0, limit)
  }

  /** Rebuild all HeroPair rows atomically from MatchHero. */
  async recompute(): Promise<void> {
    await this.synergyRepository.recomputeAll()
  }
}
