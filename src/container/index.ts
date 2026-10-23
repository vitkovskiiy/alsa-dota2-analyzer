import { HeroesRepository } from '../repositories/heroes.repository.js'
import { MatchesRepository } from '../repositories/matches.repository.js'
import { SynergyRepository } from '../repositories/synergy.repository.js'
import { HeroesService } from '../heroes/heroes.service.js'
import { MatchesService } from '../matches/matches.service.js'
import { SynergyService } from '../synergy/synergy.service.js'

const heroesRepository = new HeroesRepository()
const matchesRepository = new MatchesRepository()
const synergyRepository = new SynergyRepository()

export const heroesService = new HeroesService(heroesRepository)
export const matchesService = new MatchesService(matchesRepository)
export const synergyService = new SynergyService(synergyRepository)
