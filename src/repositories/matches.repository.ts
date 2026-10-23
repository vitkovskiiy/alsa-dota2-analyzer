import prisma from '../db.js'
import { CreateMatchInput } from '../matches/matches.service.js'

export class MatchesRepository {
  async findByExternalId(externalId: string) {
    return prisma.match.findUnique({
      where: { externalId },
      select: { id: true },
    })
  }

  async findAll(limit: number, offset: number) {
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
    return matches
  }

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        matchHeroes: {
          include: { hero: { select: { id: true, name: true, role: true } } },
        },
      },
    })
  }

  async createWithHeroes(input: CreateMatchInput) {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          externalId: input.externalId,
          winnerSide: input.winnerSide,
          duration: input.duration,
          playedAt: new Date(input.playedAt),
        },
      })
      await tx.matchHero.createMany({
        data: input.heroes.map((hero) => ({
          matchId: match.id,
          heroId: hero.heroId,
          side: hero.side,
          won: hero.side === input.winnerSide,
        })),
      })
      return match
    })
  }

  async deleteManyByExternalId(externalId: string) {
    return prisma.match.deleteMany({ where: { externalId } })
  }
}

export const matchesRepository = new MatchesRepository()
