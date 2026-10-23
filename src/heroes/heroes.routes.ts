import { FastifyInstance } from 'fastify'
import { heroesService } from '../container/index.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'

export async function heroesRoutes(app: FastifyInstance) {
  app.get('/heroes', async (_req, reply) => {
    const heroes = await heroesService.findAll()
    return reply.send(heroes)
  })

  app.get<{ Params: { id: string } }>('/heroes/:id', async (req, reply) => {
    const id = Number(req.params.id)
    if (isNaN(id) || id < 1) {
      throw new BadRequestError('Invalid hero id')
    }
    const hero = await heroesService.findById(id)
    if (!hero) {
      throw new NotFoundError('Hero not found')
    }
    return reply.send(hero)
  })
}
