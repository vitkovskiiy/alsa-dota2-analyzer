import { FastifyInstance } from 'fastify'
import { synergyService } from './synergy.service.js'

export async function synergyRoutes(app: FastifyInstance) {
  // GET /heroes/:id/synergy?limit=5
  app.get<{ Params: { id: string }; Querystring: { limit?: string } }>(
    '/heroes/:id/synergy',
    async (req, reply) => {
      const heroId = Number(req.params.id)
      if (isNaN(heroId) || heroId < 1) {
        return reply.status(400).send({ error: 'Invalid hero id' })
      }
      const limit = Math.min(Number(req.query.limit ?? 5), 20)
      try {
        const synergies = await synergyService.topForHero(heroId, limit)
        return reply.send(synergies)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return reply
          .status(500)
          .send({ error: 'Failed to load synergy', detail: msg })
      }
    },
  )
}
