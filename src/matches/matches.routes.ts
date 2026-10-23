import { FastifyInstance } from 'fastify'
import { matchesService } from '../container/index.js'
import { CreateMatchInput } from './matches.service.js'
import { BadRequestError } from '../errors/index.js'

interface ListQuery {
  limit?: number
  offset?: number
}
interface IdParam {
  id: string
}

export async function matchesRoutes(app: FastifyInstance) {
  // GET /matches?limit=20&offset=0
  app.get<{ Querystring: ListQuery }>(
    '/matches',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            offset: { type: 'integer', minimum: 0 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const limit = Math.min(Number(req.query.limit ?? 20), 100)
      const offset = Math.max(Number(req.query.offset ?? 0), 0)
      const matches = await matchesService.findAll(limit, offset)
      return reply.send(matches)
    },
  )

  // GET /matches/:id
  app.get<{ Params: IdParam }>(
    '/matches/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string', pattern: '^[1-9][0-9]*$' } },
          required: ['id'],
        },
      },
    },
    async (req, reply) => {
      const match = await matchesService.findById(Number(req.params.id))
      if (!match) {
        throw new BadRequestError('Match not found')
      }
      return reply.send(match)
    },
  )

  // POST /matches
  app.post<{ Body: CreateMatchInput }>(
    '/matches',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: [
            'externalId',
            'winnerSide',
            'duration',
            'playedAt',
            'heroes',
          ],
          properties: {
            externalId: { type: 'string', minLength: 1, maxLength: 128 },
            winnerSide: { type: 'string', enum: ['radiant', 'dire'] },
            duration: { type: 'integer', minimum: 1, maximum: 7200 },
            playedAt: { type: 'string', format: 'date-time' },
            heroes: {
              type: 'array',
              minItems: 2,
              maxItems: 10,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['heroId', 'side'],
                properties: {
                  heroId: { type: 'integer', minimum: 1 },
                  side: { type: 'string', enum: ['radiant', 'dire'] },
                },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { body } = req
      const heroIds = body.heroes.map((hero) => hero.heroId)
      if (new Set(heroIds).size !== heroIds.length) {
        throw new BadRequestError('heroId values must be unique')
      }
      if (
        !body.heroes.some((hero) => hero.side === 'radiant') ||
        !body.heroes.some((hero) => hero.side === 'dire')
      ) {
        throw new BadRequestError('Both teams must have at least one hero')
      }

      const result = await matchesService.create(body)
      return reply.status(result.created ? 201 : 200).send(result)
    },
  )
}
