import { HeroesRepository } from '../repositories/heroes.repository.js'
import { STATIC_HEROES } from './heroes.static.js'

export interface HeroDTO {
  id: number
  name: string
  role: string
}

export class HeroesService {
  constructor(private heroesRepository: HeroesRepository) {}

  async findAll(): Promise<HeroDTO[]> {
    try {
      const heroes = await this.heroesRepository.findAll()
      if (heroes.length === 0) return STATIC_HEROES
      return heroes
    } catch {
      return STATIC_HEROES
    }
  }

  async findById(id: number): Promise<HeroDTO | null> {
    try {
      const hero = await this.heroesRepository.findById(id)
      if (hero === null) {
        return STATIC_HEROES.find((h) => h.id === id) ?? null
      }
      return hero
    } catch {
      return STATIC_HEROES.find((h) => h.id === id) ?? null
    }
  }

  async seed(): Promise<void> {
    for (const hero of STATIC_HEROES) {
      await this.heroesRepository.upsertByName({
        name: hero.name,
        role: hero.role,
      })
    }
  }
}
