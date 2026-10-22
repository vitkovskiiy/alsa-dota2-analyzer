import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://alsa:alsa@localhost:5432/alsa_db',
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'test' ? [] : ['warn', 'error'],
})

export default prisma
