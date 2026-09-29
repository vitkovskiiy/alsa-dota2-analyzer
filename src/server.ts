import { buildApp } from './app'

const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const app = buildApp()

async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`Server is running at http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
for (const signal of signals) {
  process.on(signal, async () => {
    try {
      app.log.info(`Received ${signal}, closing server gracefully...`)
      await app.close()
      process.exit(0)
    } catch (err) {
      app.log.error(err, 'Error during graceful shutdown')
      process.exit(1)
    }
  })
}

start()
