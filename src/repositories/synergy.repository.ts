import prisma from '../db.js'

export class SynergyRepository {
  async findPairsForHero(heroId: number, limit: number) {
    return prisma.heroPair.findMany({
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
  }

  async recomputeAll() {
    return prisma.$transaction(async (tx) => {
      const matches = await tx.match.findMany({
        include: {
          matchHeroes: { select: { heroId: true, side: true, won: true } },
        },
      })
      const pairs = new Map<
        string,
        { hero1Id: number; hero2Id: number; totalGames: number; wins: number }
      >()

      for (const match of matches) {
        const heroes = match.matchHeroes
        for (let i = 0; i < heroes.length; i++) {
          for (let j = i + 1; j < heroes.length; j++) {
            const a = heroes[i]
            const b = heroes[j]
            if (a.side !== b.side) continue

            const hero1Id = Math.min(a.heroId, b.heroId)
            const hero2Id = Math.max(a.heroId, b.heroId)
            const key = `${hero1Id}-${hero2Id}`
            const pair = pairs.get(key) ?? {
              hero1Id,
              hero2Id,
              totalGames: 0,
              wins: 0,
            }
            pair.totalGames++
            if (a.won) pair.wins++
            pairs.set(key, pair)
          }
        }
      }

      await tx.heroPair.deleteMany()
      const data = [...pairs.values()].map((pair) => ({
        ...pair,
        winRate: pair.totalGames === 0 ? 0 : pair.wins / pair.totalGames,
      }))
      if (data.length > 0) await tx.heroPair.createMany({ data })
    })
  }
}

export const synergyRepository = new SynergyRepository()
