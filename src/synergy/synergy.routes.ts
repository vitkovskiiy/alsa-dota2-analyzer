import { FastifyInstance } from 'fastify'
import { synergyService } from '../container/index.js'
import { BadRequestError } from '../errors/index.js'

export async function synergyRoutes(app: FastifyInstance) {
  // GET /heroes/:id/synergy?limit=5
  app.get<{ Params: { id: string }; Querystring: { limit?: string } }>(
    '/heroes/:id/synergy',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string', pattern: '^[1-9][0-9]*$' } },
          required: ['id'],
        },
        querystring: {
          type: 'object',
          properties: { limit: { type: 'integer', minimum: 1, maximum: 20 } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const heroId = Number(req.params.id)
      if (isNaN(heroId) || heroId < 1) {
        throw new BadRequestError('Invalid hero id')
      }
      const limit = Math.min(Number(req.query.limit ?? 5), 20)
      if (Number.isNaN(limit) || limit < 1 || limit > 20) {
        throw new BadRequestError('Invalid limit')
      }
      const synergies = await synergyService.topForHero(heroId, limit)
      return reply.send(synergies)
    },
  )
}
