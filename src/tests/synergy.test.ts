import { describe, it, expect, vi } from 'vitest'
import { buildApp } from '../app.js'

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn().mockResolvedValue([]),
}))

vi.mock('../db.js', () => ({
  default: {
    heroPair: { findMany },
  },
}))

describe('GET /heroes/:id/synergy', () => {
  const app = buildApp({ logger: false })

  it('computes synergy from static matches when the database is empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/heroes/1/synergy' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toContainEqual({
      hero1Id: 1,
      hero1Name: 'Anti-Mage',
      hero2Id: 2,
      hero2Name: 'Crystal Maiden',
      totalGames: 2,
      wins: 2,
      winRate: 1,
    })
  })

  it('uses static data when PostgreSQL is unavailable', async () => {
    findMany.mockRejectedValueOnce(new Error('database unavailable'))

    const res = await app.inject({ method: 'GET', url: '/heroes/1/synergy' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ hero1Id: 1, hero2Id: 2, totalGames: 2 }),
      ]),
    )
  })
})
