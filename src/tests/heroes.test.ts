import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'

// Mock DB to avoid real connection in unit tests
vi.mock('../db.js', () => ({
  default: {
    hero: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}))

describe('GET /heroes', () => {
  const app = buildApp({ logger: false })

  it('returns static heroes when DB is empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/heroes' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as unknown[]
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })
})

describe('GET /heroes/:id', () => {
  const app = buildApp({ logger: false })

  it('returns 400 for non-numeric id', async () => {
    const res = await app.inject({ method: 'GET', url: '/heroes/abc' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({ method: 'GET', url: '/heroes/9999' })
    expect(res.statusCode).toBe(404)
  })

  it('returns hero from static data for id=1', async () => {
    const res = await app.inject({ method: 'GET', url: '/heroes/1' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as { id: number; name: string }
    expect(body.id).toBe(1)
    expect(body.name).toBe('Anti-Mage')
  })
})
