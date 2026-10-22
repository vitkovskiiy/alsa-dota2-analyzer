import { FastifyInstance } from 'fastify'
import { matchesService, CreateMatchInput } from './matches.service.js'

interface ListQuery {
  limit?: string
  offset?: string
}
interface IdParam {
  id: string
}

export async function matchesRoutes(app: FastifyInstance) {
  // GET /matches?limit=20&offset=0
  app.get<{ Querystring: ListQuery }>('/matches', async (req, reply) => {
    const limit = Math.min(Number(req.query.limit ?? 20), 100)
    const offset = Math.max(Number(req.query.offset ?? 0), 0)
    if (isNaN(limit) || isNaN(offset)) {
      return reply
        .status(400)
        .send({ error: 'limit and offset must be numbers' })
    }
    const matches = await matchesService.findAll(limit, offset)
    return reply.send(matches)
  })

  // GET /matches/:id
  app.get<{ Params: IdParam }>('/matches/:id', async (req, reply) => {
    const id = Number(req.params.id)
    if (isNaN(id) || id < 1) {
      return reply.status(400).send({ error: 'Invalid match id' })
    }
    const match = await matchesService.findById(id)
    if (!match) return reply.status(404).send({ error: 'Match not found' })
    return reply.send(match)
  })

  // POST /matches
  app.post<{ Body: CreateMatchInput }>('/matches', async (req, reply) => {
    const body = req.body
    if (
      !body?.externalId ||
      !body?.winnerSide ||
      !body?.duration ||
      !body?.playedAt
    ) {
      return reply.status(400).send({ error: 'Missing required fields' })
    }
    if (!['radiant', 'dire'].includes(body.winnerSide)) {
      return reply
        .status(400)
        .send({ error: 'winnerSide must be radiant or dire' })
    }
    if (!Array.isArray(body.heroes) || body.heroes.length === 0) {
      return reply.status(400).send({ error: 'heroes array is required' })
    }
    try {
      const result = await matchesService.create(body)
      const status = result.created ? 201 : 200
      return reply.status(status).send(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return reply
        .status(500)
        .send({ error: 'Failed to create match', detail: msg })
    }
  })
}
