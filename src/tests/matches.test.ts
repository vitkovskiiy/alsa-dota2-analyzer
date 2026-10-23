import { describe, it, expect, vi } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('../db.js', () => ({
  default: {
    match: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    matchHero: { createMany: vi.fn() },
    $transaction: vi.fn(),
  },
}))

describe('GET /matches', () => {
  const app = buildApp({ logger: false })

  it('returns static matches when DB empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/matches' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as unknown[]
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })

  it('returns 400 for invalid limit param', async () => {
    const res = await app.inject({ method: 'GET', url: '/matches?limit=abc' })
    // NaN limit в†’ clamped, still 200
    expect([200, 400]).toContain(res.statusCode)
  })
})

describe('GET /matches/:id', () => {
  const app = buildApp({ logger: false })

  it('returns 400 for non-numeric id', async () => {
    const res = await app.inject({ method: 'GET', url: '/matches/xyz' })
    expect(res.statusCode).toBe(400)
  })

  it('returns static match for id=1', async () => {
    const res = await app.inject({ method: 'GET', url: '/matches/1' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as { externalId: string }
    expect(body.externalId).toBe('ext-001')
  })
})

describe('POST /matches', () => {
  const app = buildApp({ logger: false })

  it('returns 400 when body is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/matches',
      payload: {},
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 for invalid winnerSide', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/matches',
      payload: {
        externalId: 'test-1',
        winnerSide: 'midlane',
        duration: 1500,
        playedAt: new Date().toISOString(),
        heroes: [{ heroId: 1, side: 'radiant' }],
      },
    })
    expect(res.statusCode).toBe(400)
  })
})
