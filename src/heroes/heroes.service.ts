import prisma from '../db.js'
import { STATIC_HEROES } from './heroes.static.js'

export interface HeroDTO {
  id: number
  name: string
  role: string
}

export class HeroesService {
  /**
   * Phase 1: static list.
   * Phase 2: replaced by DB call.
   * Falls back to static when DB is empty OR unavailable.
   */
  async findAll(): Promise<HeroDTO[]> {
    try {
      const heroes = await prisma.hero.findMany({
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      })
      if (heroes.length === 0) return STATIC_HEROES
      return heroes
    } catch {
      return STATIC_HEROES
    }
  }

  async findById(id: number): Promise<HeroDTO | null> {
    try {
      const hero = await prisma.hero.findUnique({
        where: { id },
        select: { id: true, name: true, role: true },
      })
      // DB null → fall back to static (covers empty-DB phase)
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
      await prisma.hero.upsert({
        where: { name: hero.name },
        update: {},
        create: { name: hero.name, role: hero.role },
      })
    }
  }
}

export const heroesService = new HeroesService()
