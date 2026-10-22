import prisma from './db.js'
import { heroesService } from './heroes/heroes.service.js'
import { matchesService } from './matches/matches.service.js'
import { synergyService } from './synergy/synergy.service.js'

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
