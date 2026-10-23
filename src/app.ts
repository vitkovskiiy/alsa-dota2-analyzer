import Fastify, { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { heroesRoutes } from './heroes/heroes.routes.js'
import { matchesRoutes } from './matches/matches.routes.js'
import { synergyRoutes } from './synergy/synergy.routes.js'
import { asyncLocalStorage } from './common/async-context.js'
import { AppError } from './errors/index.js'

const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Alsa Dota 2 Analyzer</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #0f1026; color: #f5f3ff; }
    a { color: #a5b4fc; }
    header { margin-bottom: 2rem; }
    .card { background: #1e1f3a; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 20px 40px rgba(15, 16, 38, 0.4); }
  </style>
</head>
<body>
  <header>
    <h1>Alsa Dota 2 Analyzer</h1>
    <p>API endpoints: /health, /version, /heroes, /matches, /heroes/:id/synergy</p>
  </header>
  <section class="card">
    <h2>Quick links</h2>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/version">/version</a></li>
      <li><a href="/heroes">/heroes</a></li>
      <li><a href="/matches">/matches</a></li>
    </ul>
  </section>
</body>
</html>`

export interface AppOptions {
  logger?: boolean | object
}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: opts.logger ?? {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  })

  // Business-process/request context for all logs
  app.addHook('onRequest', async (req) => {
    const headerBpId = req.headers['x-business-process-id']
    const businessProcessId =
      typeof headerBpId === 'string' && headerBpId.trim().length > 0
        ? headerBpId.trim()
        : randomUUID()
    const requestId = randomUUID()
    ;(req as any).businessProcessId = businessProcessId
    ;(req as any).requestId = requestId
    asyncLocalStorage.enterWith({ businessProcessId, requestId })
  })

  // Global error handler - single place for error mapping
  app.setErrorHandler((err, req, reply) => {
    const bpId = (req as any).businessProcessId
    const reqId = (req as any).requestId
    const logCtx = { err, businessProcessId: bpId, requestId: reqId }

    // Fastify schema validation errors
    if ((err as any).validation) {
      req.log.error(logCtx, 'Validation error')
      return reply.status(400).send({ error: 'Bad Request' })
    }

    if (err instanceof AppError) {
      if (err.statusCode === 503) {
        reply.header('Retry-After', '2')
      }
      req.log.error(logCtx, err.message)
      return reply.status(err.statusCode).send({ error: err.message })
    }

    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as any).code)
        : ''

    if (code === 'P2002') {
      req.log.error(logCtx, 'Duplicate record')
      return reply.status(409).send({ error: 'Duplicate record' })
    }
    if (code === 'P2003') {
      req.log.error(logCtx, 'Related record does not exist')
      return reply
        .status(400)
        .send({ error: 'One or more heroId values do not exist' })
    }
    if (
      ['P1001', 'P1002', 'P1017', 'ECONNREFUSED', 'ETIMEDOUT'].includes(code)
    ) {
      reply.header('Retry-After', '2')
      req.log.error(logCtx, 'Database is unavailable')
      return reply
        .status(503)
        .send({ error: 'Database is unavailable; retry later' })
    }

    req.log.error(logCtx, (err as Error)?.message || 'Internal server error')
    return reply.status(500).send({ error: 'Internal server error' })
  })

  // Health
  app.get('/', async (_req, reply) =>
    reply.type('text/html; charset=utf-8').send(dashboardHtml),
  )

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
