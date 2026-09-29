import Fastify, { FastifyInstance } from 'fastify'

export interface AppOptions {
  logger?: boolean | object
}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: opts.logger ?? {
      level: process.env.LOG_LEVEL || 'info',
    },
  })

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.get('/', async () => {
    return {
      name: 'Alsa API',
      description: 'Dota 2 Match Analyzer & Synergy Engine',
      version: '1.0.0',
    }
  })

  return app
}
