import Fastify, { FastifyInstance } from 'fastify'
import { heroesRoutes } from './heroes/heroes.routes.js'
import { matchesRoutes } from './matches/matches.routes.js'
import { synergyRoutes } from './synergy/synergy.routes.js'

export interface AppOptions {
  logger?: boolean | object
}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: opts.logger ?? {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  })

  // Health
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // Root / version
  app.get('/version', async () => ({
    name: 'Alsa API',
    description: 'Dota 2 Match Analyzer & Synergy Engine',
    version: '2.0.0',
    sha: process.env.GIT_SHA ?? 'dev',
  }))

  // Domain routes
  app.register(heroesRoutes)
  app.register(matchesRoutes)
  app.register(synergyRoutes)

  return app
}
