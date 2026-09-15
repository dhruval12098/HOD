import { createSupabaseServerClient } from '@/lib/server-supabase'
import { buildCategoryPath, buildOptionPath, buildSubcategoryPath } from '@/lib/catalog-paths'

export type ShopByCategoryCard = { id: string; type: 'category' | 'subcategory' | 'option'; name: string; imageUrl: string | null; imageAlt: string; href: string }
export type ShopByCategoryData = { heading: string; shopAllLabel: string; shopAllLink: string; desktopColumns: number; tabletColumns: number; mobileColumns: number; cards: ShopByCategoryCard[] }
type Category = { id: string; name: string; slug: string; status: string; banner_desktop_image_path: string | null; banner_mobile_image_path: string | null; banner_desktop_image_alt: string | null; banner_mobile_image_alt: string | null }
type Subcategory = { id: string; category_id: string; name: string; slug: string; status: string; image_path: string | null; icon_svg_path: string | null; image_alt: string | null }
type Option = { id: string; subcategory_id: string; name: string; slug: string; status: string; image_path: string | null; icon_svg_path: string | null; image_alt: string | null }

const base = process.env.NEXT_PUBLIC_SUPABASE_URL
const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
function publicUrl(path: string | null) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/storage/v1/object/public/')) return base ? `${base}${path}` : path
  return base ? `${base}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, '')}` : path
}

export async function getFreshShopByCategory(): Promise<ShopByCategoryData | null> {
  const db = createSupabaseServerClient()
  const { data: section, error: sectionError } = await db.from('homepage_shop_by_category').select('id, heading, shop_all_label, shop_all_link, desktop_columns, tablet_columns, mobile_columns').eq('section_key', 'home_shop_by_category').eq('is_enabled', true).maybeSingle()
  if (sectionError || !section) return null
  const { data: items, error: itemError } = await db.from('homepage_shop_by_category_items').select('id, item_type, category_id, subcategory_id, option_id, display_order').eq('section_id', section.id).eq('is_active', true).order('display_order')
  if (itemError || !items?.length) return null
  const categoryIds = new Set<string>(), subcategoryIds = new Set<string>(), optionIds = new Set<string>()
  for (const item of items) { if (item.category_id) categoryIds.add(item.category_id); if (item.subcategory_id) subcategoryIds.add(item.subcategory_id); if (item.option_id) optionIds.add(item.option_id) }
  const [categoryResult, subcategoryResult, optionResult] = await Promise.all([
    categoryIds.size ? db.from('catalog_categories').select('id, name, slug, status, banner_desktop_image_path, banner_mobile_image_path, banner_desktop_image_alt, banner_mobile_image_alt').in('id', [...categoryIds]) : Promise.resolve({ data: [], error: null }),
    subcategoryIds.size ? db.from('catalog_subcategories').select('id, category_id, name, slug, status, image_path, icon_svg_path, image_alt').in('id', [...subcategoryIds]) : Promise.resolve({ data: [], error: null }),
    optionIds.size ? db.from('catalog_options').select('id, subcategory_id, name, slug, status, image_path, icon_svg_path, image_alt').in('id', [...optionIds]) : Promise.resolve({ data: [], error: null }),
  ])
  if (categoryResult.error || subcategoryResult.error || optionResult.error) return null
  const categories = new Map((categoryResult.data as Category[]).filter((x) => x.status === 'active').map((x) => [x.id, x]))
  const selectedSubs = optionIds.size ? [...new Set((optionResult.data as Option[]).map((x) => x.subcategory_id))] : []
  const { data: optionParents } = selectedSubs.length ? await db.from('catalog_subcategories').select('id, category_id, name, slug, status, image_path, icon_svg_path, image_alt').in('id', selectedSubs) : { data: [] }
  const allSubs = [...(subcategoryResult.data as Subcategory[]), ...((optionParents ?? []) as Subcategory[])]
  const subs = new Map(allSubs.filter((x) => x.status === 'active').map((x) => [x.id, x]))
  const parentCategoryIds = [...new Set(allSubs.map((x) => x.category_id).filter((id) => !categories.has(id)))]
  if (parentCategoryIds.length) {
    const { data: parents } = await db.from('catalog_categories').select('id, name, slug, status, banner_desktop_image_path, banner_mobile_image_path, banner_desktop_image_alt, banner_mobile_image_alt').in('id', parentCategoryIds)
    for (const category of (parents ?? []) as Category[]) if (category.status === 'active') categories.set(category.id, category)
  }
  const options = new Map((optionResult.data as Option[]).filter((x) => x.status === 'active').map((x) => [x.id, x]))
  const cards = items.flatMap((item): ShopByCategoryCard[] => {
    try {
      if (item.item_type === 'category' && item.category_id) { const x = categories.get(item.category_id); if (!x) return []; return [{ id: `category-${x.id}`, type: 'category', name: x.name, imageUrl: publicUrl(x.banner_desktop_image_path ?? x.banner_mobile_image_path), imageAlt: x.banner_desktop_image_alt ?? x.banner_mobile_image_alt ?? x.name, href: buildCategoryPath(x) }] }
      if (item.item_type === 'subcategory' && item.subcategory_id) { const x = subs.get(item.subcategory_id), category = x ? categories.get(x.category_id) : null; if (!x || !category) return []; return [{ id: `subcategory-${x.id}`, type: 'subcategory', name: x.name, imageUrl: publicUrl(x.image_path ?? x.icon_svg_path), imageAlt: x.image_alt ?? x.name, href: buildSubcategoryPath(category, x) }] }
      if (item.item_type === 'option' && item.option_id) { const x = options.get(item.option_id), sub = x ? subs.get(x.subcategory_id) : null, category = sub ? categories.get(sub.category_id) : null; if (!x || !sub || !category) return []; return [{ id: `option-${x.id}`, type: 'option', name: x.name, imageUrl: publicUrl(x.image_path ?? x.icon_svg_path), imageAlt: x.image_alt ?? x.name, href: buildOptionPath(category, sub, x) }] }
    } catch { return [] }
    return []
  })
  if (!cards.length) return null
  return { heading: section.heading, shopAllLabel: section.shop_all_label ?? '', shopAllLink: section.shop_all_link ?? '', desktopColumns: Math.min(8, Math.max(2, section.desktop_columns)), tabletColumns: Math.min(6, Math.max(1, section.tablet_columns)), mobileColumns: Math.min(3, Math.max(1, section.mobile_columns)), cards }
}
