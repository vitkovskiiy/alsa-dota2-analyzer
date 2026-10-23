import { describe, it, expect, vi } from 'vitest'
import { buildApp } from '../app.js'

// Mock DB so health tests don't need a live connection
vi.mock('../db.js', () => ({
  default: {
    hero: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    match: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    heroPair: { findMany: vi.fn().mockResolvedValue([]) },
    $disconnect: vi.fn(),
  },
}))

describe('GET /health', () => {
  const app = buildApp({ logger: false })

  it('returns status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as { status: string }
    expect(body.status).toBe('ok')
  })
})

describe('GET /version', () => {
  const app = buildApp({ logger: false })

  it('returns version 2.0.0', async () => {
    const res = await app.inject({ method: 'GET', url: '/version' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body) as { version: string }
    expect(body.version).toBe('2.0.0')
  })
})
