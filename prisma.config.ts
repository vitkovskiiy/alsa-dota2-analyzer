import { defineConfig } from 'prisma/config'
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://alsa:alsa@localhost:5432/alsa_db',
  },
})
