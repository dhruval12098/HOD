import type { Product } from '@/lib/data/products'
import { unstable_noStore as noStore } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/server-supabase'

const collectionBucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

type ProductKeyValue = {
  key: string
  value: string
}

type ProductDetailSection = {
  id: string
  title: string
  rows: ProductKeyValue[]
  visible: boolean
}

type CatalogCategory = {
  id: string
  code: string
  name: string
  slug: string
}

type CatalogSubcategory = {
  id: string
  category_id: string
  name: string
  slug: string
}

type CatalogOption = {
  id: string
  subcategory_id: string
  name: string
  slug: string
}

type CatalogMetal = {
  id: string
  name: string
  slug: string
}

type CatalogCertificate = {
  id: string
  name: string
  code?: string | null
}

type CatalogGstSlab = {
  id: string
  name: string
  code: string
  percentage: number
}

type CatalogRingSize = {
  id: string
  name: string
  slug: string
}

type ProductContentRule = {
  id: string
  kind: 'shipping' | 'care_warranty'
  name: string
  slug: string
  title: string
  body: string
}

type ProductRow = {
  id: string
  slug: string
  name: string
  detail_template?: 'standard' | 'hiphop' | null
  main_category_id: string
  subcategory_id: string | null
  option_id: string | null
  description: string | null
  tag_line: string | null
  base_price: number | null
  gst_slab_id?: string | null
  stock_quantity?: number | null
  featured: boolean
  image_1_path: string | null
  image_2_path: string | null
  image_3_path: string | null
  image_4_path: string | null
  video_path: string | null
  show_image_1?: boolean | null
  show_image_2?: boolean | null
  show_image_3?: boolean | null
  show_image_4?: boolean | null
  show_video?: boolean | null
  status: string
  custom_order_enabled?: boolean | null
  ready_to_ship?: boolean | null
  hiphop_badges?: string[] | null
  chain_length_options?: string[] | null
  gram_weight_label?: string | null
  gram_weight_value?: string | null
  hiphop_carat_label?: string | null
  hiphop_carat_values?: string[] | null
  purity_values?: string[] | null
  certificate_ids?: string[] | null
  ring_size_ids?: string[] | null
  fit_options?: string[] | null
  fit_label?: string | null
  gemstone_label?: string | null
  gemstone_value?: string | null
  show_purity?: boolean | null
  engraving_enabled?: boolean | null
  engraving_label?: string | null
  shipping_rule_id?: string | null
  care_warranty_rule_id?: string | null
  shipping_enabled?: boolean | null
  care_warranty_enabled?: boolean | null
  shipping_title_override?: string | null
  shipping_body_override?: string | null
  care_warranty_title_override?: string | null
  care_warranty_body_override?: string | null
  features?: string[] | null
  specifications?: ProductKeyValue[] | null
  product_details?: ProductKeyValue[] | null
  detail_sections?: ProductDetailSection[] | null
}

export type StorefrontProduct = Product & {
  dbId: string
  detailTemplate: 'standard' | 'hiphop'
  mainCategoryCode: string
  mainCategoryName: string
  mainCategorySlug: string
  subcategoryName?: string | null
  subcategorySlug?: string | null
  optionName?: string | null
  optionSlug?: string | null
  metalsFull: { id: string; name: string; slug: string }[]
  purities: string[]
  certificateNames: string[]
  ringSizeNames: string[]
  fitLabel: string
  fitOptions: string[]
  gemstoneLabel: string
  gemstoneValue: string
  gemstoneValues: string[]
  showPurity: boolean
  engravingEnabled: boolean
  engravingLabel: string
  featuresList: string[]
  specificationRows: ProductKeyValue[]
  productDetailRows: ProductKeyValue[]
  detailSections: ProductDetailSection[]
  shippingContent: { title: string; body: string } | null
  careWarrantyContent: { title: string; body: string } | null
  descriptionText: string
  tagLineText: string
  customOrderEnabled: boolean
  readyToShip: boolean
  hiphopBadges: string[]
  chainLengthOptions: string[]
  gramWeightLabel: string
  gramWeightValue: string
  hiphopCaratLabel: string
  hiphopCaratValues: string[]
  gstSlabId: string | null
  gstLabel: string
  gstPercentage: number
  stockQuantity: number
}

function toPublicUrl(path: string | null | undefined) {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${collectionBucket}/${path}`
}

function normalizeType(value: string | null | undefined) {
  const source = (value || '').toLowerCase()
  if (source.includes('ear')) return 'earring'
  if (source.includes('neck') || source.includes('pendant')) return source.includes('pendant') ? 'pendant' : 'necklace'
  if (source.includes('bracelet') || source.includes('bangle') || source.includes('tennis')) return 'bracelet'
  if (source.includes('chain')) return 'chain'
  if (source.includes('grill')) return 'grillz'
  return 'ring'
}

function buildShortMeta(args: {
  subcategoryName?: string | null
  optionName?: string | null
  metals: { name: string; slug: string }[]
}) {
  const { subcategoryName, optionName, metals } = args
  const label = optionName || subcategoryName || 'Signature'
  const metal = metals[0]?.name || ''
  return [label, metal].filter(Boolean).join(' · ')
}

function mapCategoryLabel(categoryCode: string): Product['category'] {
  return categoryCode.toLowerCase().includes('hip') ? 'hiphop' : 'fine'
}

function defaultSpecs(product: ProductRow, metals: { name: string; slug: string }[]) {
  return [
    { key: 'Metal', value: metals[0]?.name || 'On Request' },
    { key: 'Crafted In', value: 'Surat, India' },
  ]
}

function buildHiphopSpecRows(product: ProductRow) {
  return [
    product.gram_weight_value ? { key: product.gram_weight_label || 'Gram Weight', value: product.gram_weight_value } : null,
  ].filter(Boolean) as ProductKeyValue[]
}

export async function getStorefrontProducts() {
  noStore()
  const supabase = createSupabaseServerClient()

  const [productsResult, categoriesResult, subcategoriesResult, optionsResult, metalsResult, certificatesResult, ringSizesResult, productContentRulesResult, metalSelectionsResult, gstSlabsResult] =
    await Promise.all([
      supabase.from('products').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('catalog_categories').select('id, code, name, slug'),
      supabase.from('catalog_subcategories').select('id, category_id, name, slug'),
      supabase.from('catalog_options').select('id, subcategory_id, name, slug'),
      supabase.from('catalog_metals').select('id, name, slug'),
      supabase.from('catalog_certificates').select('id, name, code'),
      supabase.from('catalog_ring_sizes').select('id, name, slug'),
      supabase.from('product_content_rules').select('id, kind, name, slug, title, body').eq('status', 'active'),
      supabase.from('product_metal_selections').select('product_id, metal_id, sort_order').order('sort_order', { ascending: true }),
      supabase.from('catalog_gst_slabs').select('id, name, code, percentage').neq('status', 'hidden'),
    ])

  const error =
    productsResult.error ||
    categoriesResult.error ||
    subcategoriesResult.error ||
    optionsResult.error ||
    metalsResult.error ||
    metalSelectionsResult.error

  if (error) {
    throw new Error(error.message)
  }

  const categories = (categoriesResult.data || []) as CatalogCategory[]
  const subcategories = (subcategoriesResult.data || []) as CatalogSubcategory[]
  const options = (optionsResult.data || []) as CatalogOption[]
  const metals = (metalsResult.data || []) as CatalogMetal[]
  const certificates = certificatesResult.error ? ([] as CatalogCertificate[]) : ((certificatesResult.data || []) as CatalogCertificate[])
  const ringSizes = ringSizesResult.error ? ([] as CatalogRingSize[]) : ((ringSizesResult.data || []) as CatalogRingSize[])
  const productContentRules = productContentRulesResult.error ? ([] as ProductContentRule[]) : ((productContentRulesResult.data || []) as ProductContentRule[])
  const gstSlabs = gstSlabsResult.error ? ([] as CatalogGstSlab[]) : ((gstSlabsResult.data || []) as CatalogGstSlab[])
  const products = (productsResult.data || []) as ProductRow[]

  return products.map((product, index) => {
    const category = categories.find((entry) => entry.id === product.main_category_id)
    const subcategory = subcategories.find((entry) => entry.id === product.subcategory_id)
    const option = options.find((entry) => entry.id === product.option_id)
    const productMetalIds = (metalSelectionsResult.data || [])
      .filter((entry) => entry.product_id === product.id)
      .map((entry) => entry.metal_id)

    const selectedMetals = metals.filter((entry) => productMetalIds.includes(entry.id))
    const selectedCertificates = certificates
      .filter((entry) => (product.certificate_ids || []).includes(entry.id))
      .map((entry) => entry.name)
    const selectedRingSizes = ringSizes
      .filter((entry) => (product.ring_size_ids || []).includes(entry.id))
      .map((entry) => entry.name)
    const gstSlab = gstSlabs.find((entry) => entry.id === product.gst_slab_id)
    const shippingRule = productContentRules.find((entry) => entry.id === product.shipping_rule_id && entry.kind === 'shipping')
    const careWarrantyRule = productContentRules.find((entry) => entry.id === product.care_warranty_rule_id && entry.kind === 'care_warranty')

    const visibleImages = [
      product.show_image_1 === false ? null : toPublicUrl(product.image_1_path),
      product.show_image_2 === false ? null : toPublicUrl(product.image_2_path),
      product.show_image_3 === false ? null : toPublicUrl(product.image_3_path),
      product.show_image_4 === false ? null : toPublicUrl(product.image_4_path),
    ].filter(Boolean) as string[]
    const visibleVideoUrl = product.show_video === false ? undefined : toPublicUrl(product.video_path)

    const typeSource = option?.name || subcategory?.name || category?.name

    const baseSpecs = product.specifications?.length ? product.specifications : defaultSpecs(product, selectedMetals)
    const hiphopSpecs = product.detail_template === 'hiphop' ? buildHiphopSpecRows(product) : []

    const storefrontProduct: StorefrontProduct = {
      id: index + 1,
      dbId: product.id,
      slug: product.slug,
      name: product.name,
      detailTemplate: product.detail_template === 'hiphop' ? 'hiphop' : 'standard',
      category: mapCategoryLabel(category?.code || ''),
      type: normalizeType(typeSource),
      stone: 'natural-colourless',
      cut: 'round',
      metals: selectedMetals.map((entry) => entry.slug),
      priceFrom: Number(product.base_price || 0),
      carat: product.gemstone_value || option?.name || category?.name || 'Signature',
      featured: Boolean(product.featured),
      isNew: false,
      shortMeta: buildShortMeta({
        subcategoryName: subcategory?.name,
        optionName: option?.name,
        metals: selectedMetals,
      }),
      gemColor: '#D4A840',
      gemStyle: 'round',
      imageUrl: visibleImages[0],
      galleryUrls: visibleImages.length > 1 ? visibleImages.slice(1) : [],
      videoUrl: visibleVideoUrl,
      mainCategoryCode: category?.code || '',
      mainCategoryName: category?.name || '',
      mainCategorySlug: category?.slug || '',
      subcategoryName: subcategory?.name ?? null,
      subcategorySlug: subcategory?.slug ?? null,
      optionName: option?.name ?? null,
      optionSlug: option?.slug ?? null,
      metalsFull: selectedMetals,
      purities: product.purity_values ?? [],
      certificateNames: selectedCertificates,
      ringSizeNames: selectedRingSizes,
      fitLabel: product.fit_label || 'Fit',
      fitOptions: product.fit_options ?? [],
      gemstoneLabel: product.gemstone_label || 'Stone Type',
      gemstoneValue: (product.gemstone_value || '').split(',').map((entry) => entry.trim()).filter(Boolean)[0] || '',
      gemstoneValues: (product.gemstone_value || '').split(',').map((entry) => entry.trim()).filter(Boolean),
      showPurity: product.show_purity ?? true,
      engravingEnabled: Boolean(product.engraving_enabled),
      engravingLabel: product.engraving_label || 'Complimentary Engraving',
      featuresList: product.features ?? [],
      specificationRows: [...baseSpecs, ...hiphopSpecs],
      productDetailRows: product.product_details ?? [],
      detailSections: (product.detail_sections ?? []).filter((section) => section.visible !== false),
      shippingContent: product.shipping_enabled === false
        ? null
        : {
            title: product.shipping_title_override || shippingRule?.title || 'Shipping',
            body: product.shipping_body_override || shippingRule?.body || '',
          },
      careWarrantyContent: product.care_warranty_enabled === false
        ? null
        : {
            title: product.care_warranty_title_override || careWarrantyRule?.title || 'Care & Warranty',
            body: product.care_warranty_body_override || careWarrantyRule?.body || '',
          },
      descriptionText: product.description || '',
      tagLineText: product.tag_line || '',
      customOrderEnabled: Boolean(product.custom_order_enabled),
      readyToShip: Boolean(product.ready_to_ship),
      hiphopBadges: product.hiphop_badges ?? [],
      chainLengthOptions: product.chain_length_options ?? [],
      gramWeightLabel: product.gram_weight_label || 'Gram Weight',
      gramWeightValue: product.gram_weight_value || '',
      hiphopCaratLabel: product.hiphop_carat_label || 'Diamond Carat',
      hiphopCaratValues: product.hiphop_carat_values ?? [],
      gstSlabId: product.gst_slab_id ?? null,
      gstLabel: gstSlab?.name || '',
      gstPercentage: Number(gstSlab?.percentage || 0),
      stockQuantity: Number(product.stock_quantity || 0),
    }

    return storefrontProduct
  })
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await getStorefrontProducts()
  const exactMatch = products.find((entry) => entry.slug === slug)
  if (exactMatch) return exactMatch

  const legacySlug = slug.replace(/-\d+$/, '')
  if (legacySlug !== slug) {
    return products.find((entry) => entry.slug === legacySlug) || null
  }

  return null
}

export function filterStorefrontProducts(
  products: StorefrontProduct[],
  filters: {
    categorySlug?: string
    subcategorySlug?: string | null
    optionSlug?: string | null
    metalSlug?: string | null
    purity?: string | null
    certificate?: string | null
  }
) {
  const { categorySlug, subcategorySlug, optionSlug, metalSlug, purity, certificate } = filters

  return products.filter((product) => {
    if (categorySlug && product.mainCategorySlug !== categorySlug) return false
    if (subcategorySlug && product.subcategorySlug !== subcategorySlug) return false
    if (optionSlug && product.optionSlug !== optionSlug) return false
    if (metalSlug && !product.metalsFull.some((entry) => entry.slug === metalSlug)) return false
    if (purity && !product.purities.includes(purity)) return false
    if (certificate && !product.certificateNames.some((entry) => entry.toLowerCase().replace(/\s+/g, '-') === certificate)) return false
    return true
  })
}
