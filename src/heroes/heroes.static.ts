export interface StaticHero {
  id: number
  name: string
  role: string
}

export const STATIC_HEROES: StaticHero[] = [
  { id: 1, name: 'Anti-Mage', role: 'Carry' },
  { id: 2, name: 'Crystal Maiden', role: 'Support' },
  { id: 3, name: 'Tidehunter', role: 'Offlane' },
  { id: 4, name: 'Invoker', role: 'Mid' },
  { id: 5, name: 'Dazzle', role: 'Support' },
  { id: 6, name: 'Phantom Lancer', role: 'Carry' },
  { id: 7, name: 'Omniknight', role: 'Support' },
  { id: 8, name: 'Earthshaker', role: 'Support' },
]
