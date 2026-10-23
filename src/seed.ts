import prisma from './db.js'
import { heroesService } from './container/index.js'
import { matchesService } from './container/index.js'
import { synergyService } from './container/index.js'

async function main() {
  console.log('Seeding heroes...')
  await heroesService.seed()

  console.log('Seeding matches...')
  await matchesService.seed()

  console.log('Recomputing synergy pairs...')
  await synergyService.recompute()

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
