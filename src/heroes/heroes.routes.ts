import { FastifyInstance } from 'fastify'
import { heroesService } from './heroes.service.js'

export async function heroesRoutes(app: FastifyInstance) {
  app.get('/heroes', async (_req, reply) => {
    const heroes = await heroesService.findAll()
    return reply.send(heroes)
  })

  app.get<{ Params: { id: string } }>('/heroes/:id', async (req, reply) => {
    const id = Number(req.params.id)
    if (isNaN(id) || id < 1) {
      return reply.status(400).send({ error: 'Invalid hero id' })
    }
    const hero = await heroesService.findById(id)
    if (!hero) return reply.status(404).send({ error: 'Hero not found' })
    return reply.send(hero)
  })
}
