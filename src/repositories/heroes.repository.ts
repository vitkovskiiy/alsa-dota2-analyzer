import prisma from '../db.js'
import { HeroDTO } from '../heroes/heroes.service.js'

export class HeroesRepository {
  async findAll(): Promise<HeroDTO[]> {
    return prisma.hero.findMany({
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: number): Promise<HeroDTO | null> {
    return prisma.hero.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    })
  }

  async upsertByName(hero: { name: string; role: string }): Promise<void> {
    await prisma.hero.upsert({
      where: { name: hero.name },
      update: {},
      create: { name: hero.name, role: hero.role },
    })
  }

  async count(): Promise<number> {
    return prisma.hero.count()
  }
}

export const heroesRepository = new HeroesRepository()
