export type NavbarSectionType =
  | 'category_list'
  | 'manual_links'
  | 'metal_swatches'
  | 'stone_shapes'
  | 'ring_sizes'
  | 'certificates'
  | 'category_link'

export type PublicNavbarItemRow = {
  id: string
  label: string
  slug: string
  item_type: 'mega_menu' | 'direct_link'
  linked_category_id: string | null
  direct_link_url: string | null
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicNavbarSectionRow = {
  id: string
  navbar_item_id: string
  title: string
  section_type: NavbarSectionType
  source_subcategory_id: string | null
  source_category_slug?: string | null
  enable_category_link?: boolean | null
  linked_category_id?: string | null
  column_number: number
  show_as_filter?: boolean | null
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicNavbarSectionSourceItemRow = {
  section_id: string
  source_kind: 'subcategory_option' | 'metal' | 'stone_shape' | 'ring_size' | 'certificate'
  source_item_id: string
  sort_order: number
  is_active: boolean
}

export type PublicCategoryRow = {
  id: string
  name: string
  slug: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicNavbarSectionLinkRow = {
  id: string
  section_id: string
  label: string
  url: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicNavbarFeaturedCardRow = {
  navbar_item_id: string
  image_path: string | null
  image_alt: string | null
  button_label: string | null
  button_url: string | null
  enabled: boolean
}

export type PublicSubcategoryRow = {
  id: string
  category_id: string
  name: string
  slug: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicOptionRow = {
  id: string
  subcategory_id: string
  name: string
  slug: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicMetalRow = {
  id: string
  name: string
  slug: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicStoneShapeRow = {
  id: string
  name: string
  slug: string
  svg_asset_url: string | null
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicRingSizeRow = {
  id: string
  name: string
  slug: string
  display_order: number
  status: 'active' | 'hidden'
}

export type PublicCertificateRow = {
  id: string
  name: string
  code?: string | null
  slug?: string | null
  display_order?: number | null
  status?: 'active' | 'hidden'
}

export type NavbarRenderLink = {
  label: string
  href: string
}

export type NavbarRenderSection = {
  title: string
  type: NavbarSectionType
  twoCol?: boolean
  links?: NavbarRenderLink[]
  metals?: readonly ({ type: 'yellow' | 'rose' | 'white' | 'platinum' | 'default'; label: string; href: string })[]
}

export type NavbarRenderItem = {
  label: string
  href?: string
  mega?: {
    cols: number
    sections: NavbarRenderSection[]
    featuredImage?: {
      imageUrl: string
      imageAlt: string
      buttonLabel: string
      buttonUrl: string
    } | null
  }
}

const METAL_TYPE_MAP: Record<string, 'yellow' | 'rose' | 'white' | 'platinum'> = {
  'yellow-gold': 'yellow',
  '18k-yellow-gold': 'yellow',
  '14k-yellow-gold': 'yellow',
  'yellow_gold': 'yellow',
  yellow: 'yellow',
  'rose-gold': 'rose',
  '18k-rose-gold': 'rose',
  '14k-rose-gold': 'rose',
  'rose_gold': 'rose',
  rose: 'rose',
  'white-gold': 'white',
  '18k-white-gold': 'white',
  '14k-white-gold': 'white',
  'white_gold': 'white',
  white: 'white',
  platinum: 'platinum',
}

function getMetalType(entry: Pick<PublicMetalRow, 'slug' | 'name'>): 'yellow' | 'rose' | 'white' | 'platinum' | 'default' {
  const candidates = [
    entry.slug,
    entry.slug?.replace(/_/g, '-'),
    slugifyValue(entry.name),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    const directMatch = METAL_TYPE_MAP[candidate]
    if (directMatch) return directMatch

    if (candidate.includes('yellow')) return 'yellow'
    if (candidate.includes('rose')) return 'rose'
    if (candidate.includes('white')) return 'white'
    if (candidate.includes('platinum')) return 'platinum'
  }

  return 'default'
}

function buildItemBaseHref(slug: string) {
  return `/${slug}`
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function buildCategoryListLinks(args: {
  itemHref: string
  subcategory: PublicSubcategoryRow
  options: PublicOptionRow[]
}): NavbarRenderLink[] {
  const { itemHref, subcategory, options } = args
  return options
    .filter((entry) => entry.subcategory_id === subcategory.id && entry.status === 'active')
    .sort((left, right) => left.display_order - right.display_order)
    .map((entry) => ({
      label: entry.name,
      href: `${itemHref}?subcategory=${subcategory.slug}&option=${entry.slug}`,
    }))
}

function buildStoneShapeLinks(itemHref: string, stoneShapes: PublicStoneShapeRow[]): NavbarRenderLink[] {
  return stoneShapes
    .filter((entry) => entry.status === 'active')
    .sort((left, right) => left.display_order - right.display_order)
    .map((entry) => ({
      label: entry.name,
      href: `${itemHref}?shape=${entry.slug}`,
    }))
}

function filterBySelectedIds<T extends { id: string }>(items: T[], selectedIds: Set<string>) {
  if (selectedIds.size === 0) return items
  return items.filter((entry) => selectedIds.has(entry.id))
}

function buildRingSizeLinks(itemHref: string, ringSizes: PublicRingSizeRow[]) {
  return ringSizes
    .filter((entry) => entry.status === 'active')
    .sort((left, right) => left.display_order - right.display_order)
    .map((entry) => ({
      label: entry.name,
      href: `${itemHref}?size=${entry.slug}`,
    }))
}

function buildCertificateLinks(itemHref: string, certificates: PublicCertificateRow[]) {
  return certificates
    .filter((entry) => !entry.status || entry.status === 'active')
    .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
    .map((entry) => ({
      label: entry.name,
      href: `${itemHref}?certificate=${slugifyValue(entry.slug || entry.name)}`,
    }))
}

function buildMetalLinks(itemHref: string, metals: PublicMetalRow[]) {
  const activeMetals = metals
    .filter((entry) => entry.status === 'active')
    .sort((left, right) => left.display_order - right.display_order)

  return {
    metals: activeMetals.map((entry) => ({
      type: getMetalType(entry),
      label: entry.name,
      href: `${itemHref}?metal=${entry.slug}`,
    })),
  }
}

export function buildNavbarRenderItems(args: {
  items: PublicNavbarItemRow[]
  sections: PublicNavbarSectionRow[]
  sectionLinks: PublicNavbarSectionLinkRow[]
  sectionSourceItems: PublicNavbarSectionSourceItemRow[]
  featuredCards: PublicNavbarFeaturedCardRow[]
  categories: PublicCategoryRow[]
  subcategories: PublicSubcategoryRow[]
  options: PublicOptionRow[]
  metals: PublicMetalRow[]
  stoneShapes: PublicStoneShapeRow[]
  ringSizes?: PublicRingSizeRow[]
  certificates?: PublicCertificateRow[]
}): NavbarRenderItem[] {
  const {
    items,
    sections,
    sectionLinks,
    sectionSourceItems,
    featuredCards,
    categories,
    subcategories,
    options,
    metals,
    stoneShapes,
    ringSizes = [],
    certificates = [],
  } = args
  const categoriesById = new Map(categories.map((entry) => [entry.id, entry]))
  const subcategoriesById = new Map(subcategories.map((entry) => [entry.id, entry]))
  const optionsBySubcategory = new Map<string, PublicOptionRow[]>()
  const sourceItemsBySection = new Map<string, PublicNavbarSectionSourceItemRow[]>()

  options
    .filter((entry) => entry.status === 'active')
    .forEach((entry) => {
      const existing = optionsBySubcategory.get(entry.subcategory_id) ?? []
      existing.push(entry)
      optionsBySubcategory.set(entry.subcategory_id, existing)
    })

  sectionSourceItems
    .filter((entry) => entry.is_active)
    .forEach((entry) => {
      const existing = sourceItemsBySection.get(entry.section_id) ?? []
      existing.push(entry)
      sourceItemsBySection.set(entry.section_id, existing)
    })

  const dynamicItems = items
    .filter((entry) => entry.status === 'active')
    .sort((left, right) => left.display_order - right.display_order)
    .map((item) => {
      const itemHref = item.direct_link_url ?? buildItemBaseHref(item.slug)
      const visibleSections = sections
        .filter((entry) => entry.navbar_item_id === item.id && entry.status === 'active')
        .sort((left, right) => {
          if (left.column_number !== right.column_number) {
            return left.column_number - right.column_number
          }
          return left.display_order - right.display_order
        })

      if (item.item_type !== 'mega_menu') {
        return {
          label: item.label,
          href: item.direct_link_url ?? buildItemBaseHref(item.slug),
        }
      }

      const itemSections = visibleSections
        .map((section) => {
          const subcategory = section.source_subcategory_id ? subcategoriesById.get(section.source_subcategory_id) : null
          const selectedItems = (sourceItemsBySection.get(section.id) ?? []).sort((left, right) => left.sort_order - right.sort_order)
          const selectedIds = new Set(selectedItems.map((entry) => entry.source_item_id))
          const injectedCategory =
            section.enable_category_link && section.linked_category_id
              ? categoriesById.get(section.linked_category_id)
              : null
          const categoryLink = injectedCategory
            ? [
                {
                  label: injectedCategory.name,
                  href: `/${injectedCategory.slug}`,
                },
              ]
            : []

          if (section.section_type === 'manual_links') {
            return {
              title: section.title,
              type: section.section_type,
              links: sectionLinks
                .filter((entry) => entry.section_id === section.id && entry.status === 'active')
                .sort((left, right) => left.display_order - right.display_order)
                .map((entry) => ({
                  label: entry.label,
                  href: entry.url,
                })),
            } satisfies NavbarRenderSection
          }

          if (section.section_type === 'stone_shapes') {
            const shapeLinks = buildStoneShapeLinks(itemHref, filterBySelectedIds(stoneShapes, selectedIds))
            return {
              title: section.title,
              type: section.section_type,
              twoCol: true,
              links: [...shapeLinks, ...categoryLink],
            } satisfies NavbarRenderSection
          }

          if (section.section_type === 'ring_sizes') {
            const ringLinks = buildRingSizeLinks(itemHref, filterBySelectedIds(ringSizes, selectedIds))
            return {
              title: section.title,
              type: section.section_type,
              links: [...ringLinks, ...categoryLink],
            } satisfies NavbarRenderSection
          }

          if (section.section_type === 'certificates') {
            const certificateLinks = buildCertificateLinks(itemHref, filterBySelectedIds(certificates, selectedIds))
            return {
              title: section.title,
              type: section.section_type,
              links: [...certificateLinks, ...categoryLink],
            } satisfies NavbarRenderSection
          }

          if (section.section_type === 'metal_swatches') {
            const metalData = buildMetalLinks(
              itemHref,
              metals.filter((entry) => selectedIds.size === 0 || selectedIds.has(entry.id))
            )
            return {
              title: section.title,
              type: section.section_type,
              metals: metalData.metals,
              links: categoryLink,
            } satisfies NavbarRenderSection
          }

          if (section.section_type === 'category_link' && section.source_category_slug) {
            return {
              title: section.title,
              type: section.section_type,
              links: [
                {
                  label: section.title,
                  href: `/${section.source_category_slug}`,
                },
              ],
            } satisfies NavbarRenderSection
          }

          const subcategoryOptions = subcategory ? (optionsBySubcategory.get(subcategory.id) ?? []).sort((left, right) => left.display_order - right.display_order) : []
          const filteredSubcategoryOptions = subcategoryOptions.filter((entry) => selectedIds.size === 0 || selectedIds.has(entry.id))

          const links = subcategory
            ? filteredSubcategoryOptions.length > 0
              ? buildCategoryListLinks({ itemHref, subcategory, options: filteredSubcategoryOptions })
              : [
                  {
                    label: subcategory.name,
                    href: `${itemHref}?subcategory=${subcategory.slug}`,
                  },
                ]
            : []

          return {
            title: section.title,
            type: section.section_type,
            links: [...links, ...categoryLink],
          } satisfies NavbarRenderSection
        })
        .filter((section) => {
          if (section.type === 'metal_swatches') return (section.metals?.length ?? 0) > 0 || (section.links?.length ?? 0) > 0
          return (section.links?.length ?? 0) > 0
        })

      const featuredCard = featuredCards.find((entry) => entry.navbar_item_id === item.id && entry.enabled)

      return {
        label: item.label,
        href: itemHref,
        mega: {
          cols: Math.max(1, ...itemSections.map((_, index) => visibleSections[index]?.column_number ?? 1)),
          sections: itemSections,
          featuredImage: featuredCard?.image_path
            ? {
                imageUrl: featuredCard.image_path,
                imageAlt: featuredCard.image_alt ?? item.label,
                buttonLabel: featuredCard.button_label ?? '',
                buttonUrl: featuredCard.button_url ?? buildItemBaseHref(item.slug),
              }
            : null,
        },
      }
    })

  return [
    ...dynamicItems,
    { label: 'Hip Hop', href: '/hiphop' },
    { label: 'Bespoke', href: '/bespoke' },
  ]
}
