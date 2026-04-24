export type GemStyle = 'chain' | 'tennis' | 'grillz' | 'cross' | 'signet' | 'row' | 'default'

export type HipHopProductType = 'ring' | 'bracelet' | 'chain' | 'pendant' | 'grillz'

export interface HipHopProduct {
  id: number
  slug: string
  name: string
  category: string
  type: HipHopProductType
  stone: string
  cut: string
  metals: string[]
  priceFrom: number
  carat: string
  featured: boolean
  isNew: boolean
  shortMeta: string
  gemColor: string
  gemStyle: GemStyle
}

export const HIPHOP_TYPES: HipHopProductType[] = ['ring', 'bracelet', 'chain', 'pendant']

export const HIPHOP_PRODUCTS: HipHopProduct[] = [
  {
    id: 9,
    slug: 'cuban-link-chain-iced',
    name: 'Iced Cuban Link Chain',
    category: 'hiphop',
    type: 'chain',
    stone: 'cvd-colourless',
    cut: 'round',
    metals: ['14k', '18k-yellow', '925-silver'],
    priceFrom: 6800,
    carat: '12 ct',
    featured: true,
    isNew: true,
    shortMeta: 'Full Iced · 14K · 12ct',
    gemColor: '#20304A',
    gemStyle: 'chain',
  },
  {
    id: 10,
    slug: 'baguette-grillz',
    name: 'Baguette Grillz Top Row',
    category: 'hiphop',
    type: 'grillz',
    stone: 'cvd-colourless',
    cut: 'baguette',
    metals: ['14k', '18k-yellow', '18k-white'],
    priceFrom: 2400,
    carat: '4 ct',
    featured: true,
    isNew: false,
    shortMeta: 'Baguette · 4ct · 14K',
    gemColor: '#20304A',
    gemStyle: 'grillz',
  },
  {
    id: 11,
    slug: 'tennis-chain-hiphop',
    name: 'Tennis Chain',
    category: 'hiphop',
    type: 'chain',
    stone: 'cvd-colourless',
    cut: 'round',
    metals: ['14k', '18k-white', '925-silver'],
    priceFrom: 3600,
    carat: '8 ct',
    featured: true,
    isNew: false,
    shortMeta: '4-prong · 8ct · 20"',
    gemColor: '#20304A',
    gemStyle: 'tennis',
  },
  {
    id: 12,
    slug: 'diamond-pendant-cross',
    name: 'Diamond Cross Pendant',
    category: 'hiphop',
    type: 'pendant',
    stone: 'cvd-colourless',
    cut: 'round',
    metals: ['14k', '18k-yellow'],
    priceFrom: 2800,
    carat: '5 ct',
    featured: false,
    isNew: true,
    shortMeta: 'Full Iced · 5ct · 14K',
    gemColor: '#20304A',
    gemStyle: 'cross',
  },
  {
    id: 13,
    slug: 'hiphop-ring-signet',
    name: 'Iced Signet Ring',
    category: 'hiphop',
    type: 'ring',
    stone: 'cvd-colourless',
    cut: 'baguette',
    metals: ['14k', '18k-yellow'],
    priceFrom: 3200,
    carat: '3.5 ct',
    featured: false,
    isNew: false,
    shortMeta: 'Baguette · 3.5ct · 14K',
    gemColor: '#20304A',
    gemStyle: 'signet',
  },
  {
    id: 14,
    slug: 'hiphop-bracelet-iced',
    name: 'Iced Baguette Bracelet',
    category: 'hiphop',
    type: 'bracelet',
    stone: 'cvd-colourless',
    cut: 'baguette',
    metals: ['14k', '18k-white'],
    priceFrom: 4800,
    carat: '10 ct',
    featured: false,
    isNew: false,
    shortMeta: 'Baguette · 10ct · 14K',
    gemColor: '#20304A',
    gemStyle: 'row',
  },
]
