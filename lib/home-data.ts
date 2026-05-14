import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { formatUsd } from '@/lib/money';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createHomeSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables for home data.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type HomeHeroContent = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  slider_enabled?: boolean;
  slider_items?: Array<{
    sort_order: number;
    image_path: string;
    mobile_image_path?: string;
    button_text: string;
    button_link: string;
  }>;
};

export type HomeMarqueeData = {
  title: string;
  items: Array<{ quote: string; author: string }>;
};

export type HomeCollectionItem = {
  sort_order: number;
  label: string;
  title: string;
  description: string;
  image_path: string;
  link: string;
};

export type HomeMaterialItem = {
  sort_order: number;
  title: string;
  description: string;
  icon_path: string;
};

export type HomeDiscoverItem = {
  sort_order: number;
  title: string;
  description: string;
  image_path: string;
  image_alt?: string | null;
  href?: string | null;
  shape_id?: string | null;
  target_kind?: string | null;
  target_id?: string | null;
};

export type HomeHipHopSection = {
  eyebrow: string;
  heading_line_1: string;
  heading_line_2: string;
  heading_emphasis: string;
  cta_label: string;
  cta_link: string;
  image_path: string;
  image_alt: string;
};

export type CollectionPageConfig = {
  pageEnabled: boolean;
  showInFooter: boolean;
  showHomeShowcase: boolean;
  showcaseHeading: string;
  showcaseSubtitle: string;
  showcaseCtaLabel: string;
  showcaseCtaHref: string;
  showcaseImageUrl?: string;
  showcaseMobileImageUrl?: string;
};

export type HomeCertificationSection = {
  eyebrow: string;
  heading: string;
};

export type HomeCertificationItem = {
  sort_order: number;
  title: string;
  description: string;
  badge: string;
  icon_path: string;
};

export type HomeCoupleItem = {
  sort_order?: number;
  names: string;
  location: string;
  story: string;
  product_name: string;
  product_link?: string;
  product_detail: string;
  image_path: string;
};

export type HomeTestimonialsData = {
  eyebrow: string;
  heading: string;
  items: Array<{ quote: string; author: string; origin: string; rating?: number }>;
};

export type HomeDiamondInfoItem = {
  id?: string;
  sort_order: number;
  iconSvg?: string | null;
  title: string;
  description: string;
  is_active?: boolean;
};

export type HomeDiamondInfoConfig = {
  videoEnabled: boolean;
  videoUrl?: string;
  videoPosterUrl?: string;
  layoutMode?: string;
  eyebrow?: string;
  sectionHeading?: string;
  sectionSubtext?: string;
  ctaLabel?: string;
  ctaLink?: string;
};

export type HomeBestSellerSection = {
  eyebrow: string;
  heading: string;
  cta_label: string;
  cta_href: string;
};

export type HomeBestSellerProduct = {
  id: string;
  slug: string;
  name: string;
  meta: string;
  price: string;
  badge: string;
  badgeVariant: 'navy' | 'outline';
  detailTemplate?: 'standard' | 'hiphop';
  image?: string;
  metalsFull?: Array<{ id: string; name: string; slug: string; colorHex?: string | null }>;
};

type BestSellerProductRow = {
  id: string;
  slug: string;
  name: string;
  base_price: number | null;
  detail_template?: 'standard' | 'hiphop' | null;
  featured?: boolean | null;
  image_1_path?: string | null;
  gemstone_label?: string | null;
  gemstone_value?: string | null;
  purity_values?: string[] | null;
  subcategory?: { name?: string | null } | { name?: string | null }[] | null;
  option?: { name?: string | null } | { name?: string | null }[] | null;
  category?: { name?: string | null } | { name?: string | null }[] | null;
};

type BestSellerMetalSelectionRow = {
  product_id: string;
  metal_id: string;
  sort_order?: number | null;
};

type BestSellerMetalRow = {
  id: string;
  name: string;
  slug: string;
  color_hex?: string | null;
};

type BestSellerMetalMediaRow = {
  product_id: string;
  metal_id: string;
  image_1_path?: string | null;
  is_default_fallback?: boolean | null;
};

type BestSellerMaterialValueSelectionRow = {
  product_id: string;
  material_value_id: string;
  sort_order?: number | null;
};

type BestSellerMaterialValueRow = {
  id: string;
  name: string;
};

type DiscoverCategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type DiscoverSubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
};

type DiscoverOptionRow = {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
};

type DiscoverStoneShapeRow = {
  id: string;
  name: string;
  slug: string;
};

type DiscoverStyleRow = {
  id: string;
  name: string;
  slug: string;
};

function toPublicUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${supabaseUrl}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'}/${path}`;
}

function readRelationName(
  relation?: { name?: string | null } | { name?: string | null }[] | null
) {
  if (Array.isArray(relation)) return relation[0]?.name || '';
  return relation?.name || '';
}

function buildBestSellerMeta(product: BestSellerProductRow) {
  const bits = [
    readRelationName(product.option) || readRelationName(product.subcategory) || readRelationName(product.category) || '',
    product.gemstone_label && product.gemstone_value ? `${product.gemstone_label} · ${product.gemstone_value}` : '',
    product.purity_values?.[0] || '',
  ].filter(Boolean);

  return bits.join(' · ');
}

function buildBestSellerPrice(value: number | null | undefined) {
  if (!value) return 'Price on Request';
  return formatUsd(value);
}

function normalizeDiscoverText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function slugifyDiscoverValue(value: string | null | undefined) {
  return normalizeDiscoverText(value).replace(/\s+/g, '-');
}

function findExactDiscoverMatch<T extends { name: string; slug: string }>(items: T[], value: string) {
  const normalizedValue = normalizeDiscoverText(value);
  const slugValue = slugifyDiscoverValue(value);
  return items.find((item) => item.slug === slugValue || normalizeDiscoverText(item.name) === normalizedValue) ?? null;
}

function findContainedDiscoverMatch<T extends { name: string; slug: string }>(items: T[], value: string) {
  const haystack = ` ${normalizeDiscoverText(value)} `;

  return (
    items
      .slice()
      .sort((left, right) => {
        const rightLength = Math.max(normalizeDiscoverText(right.name).length, (right.slug ?? '').length);
        const leftLength = Math.max(normalizeDiscoverText(left.name).length, (left.slug ?? '').length);
        return rightLength - leftLength;
      })
      .find((item) => {
        const normalizedName = normalizeDiscoverText(item.name);
        const normalizedSlug = normalizeDiscoverText(item.slug);
        return (
          (normalizedName && haystack.includes(` ${normalizedName} `)) ||
          (normalizedSlug && haystack.includes(` ${normalizedSlug} `))
        );
      }) ?? null
  );
}

function buildCategoryCollectionHref(categorySlug: string, params?: URLSearchParams) {
  const query = params?.toString();
  return query ? `/${categorySlug}?${query}` : `/${categorySlug}`;
}

function buildDiscoverSubcategoryHref(args: {
  subcategory: DiscoverSubcategoryRow;
  categoriesById: Map<string, DiscoverCategoryRow>;
  extraParams?: Record<string, string | null | undefined>;
}) {
  const { subcategory, categoriesById, extraParams } = args;
  const params = new URLSearchParams();

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }

  params.set('subcategory', subcategory.slug);

  const category = categoriesById.get(subcategory.category_id);
  return category?.slug ? buildCategoryCollectionHref(category.slug, params) : `/shop?${params.toString()}`;
}

function buildDiscoverOptionHref(args: {
  option: DiscoverOptionRow;
  subcategoriesById: Map<string, DiscoverSubcategoryRow>;
  categoriesById: Map<string, DiscoverCategoryRow>;
  extraParams?: Record<string, string | null | undefined>;
}) {
  const { option, subcategoriesById, categoriesById, extraParams } = args;
  const subcategory = subcategoriesById.get(option.subcategory_id);
  const params = new URLSearchParams();

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }

  if (subcategory?.slug) {
    params.set('subcategory', subcategory.slug);
  }
  params.set('option', option.slug);

  const category = subcategory ? categoriesById.get(subcategory.category_id) : null;
  return category?.slug ? buildCategoryCollectionHref(category.slug, params) : `/shop?${params.toString()}`;
}

function buildDiscoverFilterHref(filters: Record<string, string | null | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

function resolveDiscoverShapeHref(shapeId: string | null | undefined, stoneShapes: DiscoverStoneShapeRow[]) {
  const matchedShape = stoneShapes.find((entry) => entry.id === shapeId) ?? null;
  return matchedShape ? buildDiscoverFilterHref({ shape: matchedShape.slug }) : '/shop';
}

function resolveDiscoverRingHref(args: {
  title: string;
  targetKind?: string | null;
  targetId?: string | null;
  categories: DiscoverCategoryRow[];
  subcategories: DiscoverSubcategoryRow[];
  options: DiscoverOptionRow[];
  stoneShapes: DiscoverStoneShapeRow[];
  styles: DiscoverStyleRow[];
}) {
  const { title, targetKind, targetId, categories, subcategories, options, stoneShapes, styles } = args;
  const categoriesById = new Map(categories.map((item) => [item.id, item] as const));
  const subcategoriesById = new Map(subcategories.map((item) => [item.id, item] as const));

  if (targetKind && targetId) {
    if (targetKind === 'category') {
      const category = categories.find((entry) => entry.id === targetId) ?? null;
      if (category) return buildCategoryCollectionHref(category.slug);
    }

    if (targetKind === 'subcategory') {
      const subcategory = subcategories.find((entry) => entry.id === targetId) ?? null;
      if (subcategory) {
        return buildDiscoverSubcategoryHref({ subcategory, categoriesById });
      }
    }

    if (targetKind === 'option') {
      const option = options.find((entry) => entry.id === targetId) ?? null;
      if (option) {
        return buildDiscoverOptionHref({ option, subcategoriesById, categoriesById });
      }
    }

    if (targetKind === 'shape') {
      const shape = stoneShapes.find((entry) => entry.id === targetId) ?? null;
      if (shape) return buildDiscoverFilterHref({ shape: shape.slug });
    }

    if (targetKind === 'style') {
      const style = styles.find((entry) => entry.id === targetId) ?? null;
      if (style) return buildDiscoverFilterHref({ style: style.slug });
    }
  }

  const exactOption = findExactDiscoverMatch(options, title);
  if (exactOption) {
    return buildDiscoverOptionHref({ option: exactOption, subcategoriesById, categoriesById });
  }

  const exactSubcategory = findExactDiscoverMatch(subcategories, title);
  if (exactSubcategory) {
    return buildDiscoverSubcategoryHref({ subcategory: exactSubcategory, categoriesById });
  }

  const exactCategory = findExactDiscoverMatch(categories, title);
  if (exactCategory) {
    return buildCategoryCollectionHref(exactCategory.slug);
  }

  const exactStyle = findExactDiscoverMatch(styles, title);
  if (exactStyle) {
    return buildDiscoverFilterHref({ style: exactStyle.slug });
  }

  const exactShape = findExactDiscoverMatch(stoneShapes, title);
  if (exactShape) {
    return buildDiscoverFilterHref({ shape: exactShape.slug });
  }

  const containedShape = findContainedDiscoverMatch(stoneShapes, title);
  const containedOption = findContainedDiscoverMatch(options, title);
  if (containedOption) {
    return buildDiscoverOptionHref({
      option: containedOption,
      subcategoriesById,
      categoriesById,
      extraParams: { shape: containedShape?.slug },
    });
  }

  const containedSubcategory = findContainedDiscoverMatch(subcategories, title);
  if (containedSubcategory) {
    return buildDiscoverSubcategoryHref({
      subcategory: containedSubcategory,
      categoriesById,
      extraParams: { shape: containedShape?.slug },
    });
  }

  const containedStyle = findContainedDiscoverMatch(styles, title);
  if (containedStyle || containedShape) {
    return buildDiscoverFilterHref({
      style: containedStyle?.slug,
      shape: containedShape?.slug,
    });
  }

  const containedCategory = findContainedDiscoverMatch(categories, title);
  if (containedCategory) {
    return buildCategoryCollectionHref(containedCategory.slug);
  }

  return '/shop';
}

function buildBestSellerMetaFromMaterialValue(
  product: BestSellerProductRow,
  materialValueName?: string
) {
  const primaryLabel =
    readRelationName(product.option) || readRelationName(product.subcategory) || readRelationName(product.category) || '';
  const materialLabel = product.gemstone_label && materialValueName ? `${product.gemstone_label} · ${materialValueName}` : '';
  const purityLabel = product.purity_values?.[0] || '';

  return [primaryLabel, materialLabel, purityLabel].filter(Boolean).join(' · ');
}

const loadHomePageData = unstable_cache(
  async () => {
    const supabase = createHomeSupabaseClient();

    const [
      heroResult,
      blogResult,
      collectionResult,
      materialResult,
      discoverShapesResult,
      discoverRingsResult,
      discoverCategoriesResult,
      discoverSubcategoriesResult,
      discoverOptionsResult,
      discoverStoneShapesResult,
      discoverStylesResult,
      hiphopResult,
      collectionPageConfigResult,
      couplesSectionResult,
      diamondInfoResult,
      diamondInfoConfigResult,
      testimonialsSectionResult,
      marqueeSectionResult,
      bestSellerSectionResult,
      bestSellerProductSelectionsResult,
    ] = await Promise.all([
      supabase
        .from('homepage_hero')
        .select('id, eyebrow, headline, subtitle, slider_enabled')
        .eq('section_key', 'home_hero')
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('blog_posts')
        .select('id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, is_published, sort_order, blog_post_tags(tag, sort_order)')
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('collection_items')
        .select('sort_order, label, title, description, image_path, link')
        .order('sort_order', { ascending: true }),
      supabase
        .from('material_strip_items')
        .select('sort_order, title, description, icon_path')
        .order('sort_order', { ascending: true }),
      supabase
        .from('discover_shapes_items')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true }),
      supabase
        .from('discover_rings_items')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true }),
      supabase
        .from('catalog_categories')
        .select('id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true }),
      supabase
        .from('catalog_subcategories')
        .select('id, category_id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true }),
      supabase
        .from('catalog_options')
        .select('id, subcategory_id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true }),
      supabase
        .from('catalog_stone_shapes')
        .select('id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true }),
      supabase
        .from('catalog_styles')
        .select('id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true }),
      supabase
        .from('hiphop_showcase_section')
        .select('eyebrow, heading_line_1, heading_line_2, heading_emphasis, cta_label, cta_link, image_path, image_alt')
        .eq('section_key', 'home_hiphop_showcase')
        .maybeSingle(),
      supabase
        .from('collection_page_config')
        .select('page_enabled, show_in_footer, show_home_showcase, showcase_heading, showcase_subtitle, showcase_cta_label, showcase_cta_href, showcase_image_path, showcase_mobile_image_path')
        .eq('section_key', 'main_collection_page')
        .maybeSingle(),
      supabase
        .from('couples_section')
        .select('id, eyebrow, heading, subtitle')
        .eq('section_key', 'home_couples')
        .maybeSingle(),
      supabase
        .from('diamond_info_feature_items')
        .select('id, sort_order, icon_svg, title, description, is_active')
        .eq('section_key', 'home_diamond_info')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('diamond_info_config')
        .select('video_enabled, video_path, video_poster_path, layout_mode, eyebrow, section_heading, section_subtext, cta_label, cta_link')
        .eq('section_key', 'home_diamond_info')
        .maybeSingle(),
      supabase
        .from('testimonials_section')
        .select('id, eyebrow, heading')
        .eq('section_key', 'home_testimonials')
        .maybeSingle(),
      supabase
        .from('testimonial_marquee')
        .select('id, title')
        .eq('section_key', 'home_testimonial_marquee')
        .maybeSingle(),
      supabase
        .from('cms_home_bestsellers')
        .select('id, eyebrow, heading, cta_label, cta_href')
        .eq('status', 'active')
        .maybeSingle(),
      supabase
        .from('cms_home_bestseller_products')
        .select('section_id, product_id, display_order')
        .order('display_order', { ascending: true }),
    ]);

    const heroData = heroResult.data;
    let sliderItems: HomeHeroContent['slider_items'] = [];
    if (heroData?.id && heroData.slider_enabled) {
        const { data: itemsData } = await supabase
          .from('homepage_hero_slider_items')
          .select('sort_order, image_path, mobile_image_path, button_text, button_link')
          .eq('hero_id', heroData.id)
          .order('sort_order', { ascending: true });
      sliderItems = itemsData ?? [];
    }

    let couplesItems: HomeCoupleItem[] = [];
    if (couplesSectionResult.data?.id) {
      const { data } = await supabase
        .from('couples_items')
        .select('sort_order, names, location, story, product_name, product_link, product_detail, image_path')
        .eq('section_id', couplesSectionResult.data.id)
        .order('sort_order', { ascending: true });
      couplesItems = data ?? [];
    }

    let testimonialsItems: HomeTestimonialsData['items'] = [];
    if (testimonialsSectionResult.data?.id) {
      const { data } = await supabase
        .from('testimonials_items')
        .select('sort_order, quote, author, origin, rating')
        .eq('section_id', testimonialsSectionResult.data.id)
        .order('sort_order', { ascending: true });
      testimonialsItems = data ?? [];
    }

    let marqueeItems: HomeMarqueeData['items'] = [];
    if (marqueeSectionResult.data?.id) {
      const { data } = await supabase
        .from('testimonial_marquee_items')
        .select('sort_order, quote, author')
        .eq('marquee_id', marqueeSectionResult.data.id)
        .order('sort_order', { ascending: true });
      marqueeItems = data ?? [];
    }

    let bestSellerProducts: HomeBestSellerProduct[] = [];
    const discoverCategories = (discoverCategoriesResult.data ?? []) as DiscoverCategoryRow[];
    const discoverSubcategories = (discoverSubcategoriesResult.data ?? []) as DiscoverSubcategoryRow[];
    const discoverOptions = (discoverOptionsResult.data ?? []) as DiscoverOptionRow[];
    const discoverStoneShapes = (discoverStoneShapesResult.data ?? []) as DiscoverStoneShapeRow[];
    const discoverStyles = (discoverStylesResult.data ?? []) as DiscoverStyleRow[];

    if (bestSellerSectionResult.data?.id) {
      const productIds = (bestSellerProductSelectionsResult.data ?? [])
        .filter((item) => item.section_id === bestSellerSectionResult.data?.id)
        .map((item) => item.product_id);

      if (productIds.length) {
        const [
          { data },
          { data: metalSelections },
          { data: metalCatalog },
          { data: metalMediaRows },
          { data: materialValueSelections },
          { data: materialValueCatalog },
        ] = await Promise.all([
          supabase
            .from('products')
            .select(`
              id,
              slug,
              name,
              base_price,
              detail_template,
              featured,
              image_1_path,
              gemstone_label,
              purity_values,
              subcategory:catalog_subcategories(name),
              option:catalog_options(name),
              category:catalog_categories(name)
            `)
            .in('id', productIds)
            .eq('status', 'active'),
          supabase
            .from('product_metal_selections')
            .select('product_id, metal_id, sort_order')
            .in('product_id', productIds)
            .order('sort_order', { ascending: true }),
          supabase
            .from('catalog_metals')
            .select('id, name, slug, color_hex')
            .eq('status', 'active')
            .order('display_order', { ascending: true }),
          supabase
            .from('product_metal_media')
            .select('product_id, metal_id, image_1_path, is_default_fallback')
            .in('product_id', productIds),
          supabase
            .from('product_material_value_selections')
            .select('product_id, material_value_id, sort_order')
            .in('product_id', productIds)
            .order('sort_order', { ascending: true }),
          supabase
            .from('catalog_material_values')
            .select('id, name')
            .eq('status', 'active')
            .order('display_order', { ascending: true }),
        ]);

        const productMap = new Map((data ?? []).map((item) => [item.id, item as BestSellerProductRow]));
        const metalsById = new Map((metalCatalog ?? []).map((item) => {
          const metal = item as BestSellerMetalRow;
          return [metal.id, metal] as const;
        }));
        const selectionsByProduct = new Map<string, BestSellerMetalSelectionRow[]>();
        (metalSelections ?? []).forEach((selection) => {
          const typedSelection = selection as BestSellerMetalSelectionRow;
          const existing = selectionsByProduct.get(typedSelection.product_id) ?? [];
          existing.push(typedSelection);
          selectionsByProduct.set(typedSelection.product_id, existing);
        });
        const mediaByProduct = new Map<string, BestSellerMetalMediaRow[]>();
        (metalMediaRows ?? []).forEach((entry) => {
          const typedEntry = entry as BestSellerMetalMediaRow;
          const existing = mediaByProduct.get(typedEntry.product_id) ?? [];
          existing.push(typedEntry);
          mediaByProduct.set(typedEntry.product_id, existing);
        });
        const materialValuesById = new Map((materialValueCatalog ?? []).map((item) => {
          const materialValue = item as BestSellerMaterialValueRow;
          return [materialValue.id, materialValue] as const;
        }));
        const materialValueSelectionsByProduct = new Map<string, BestSellerMaterialValueSelectionRow[]>();
        (materialValueSelections ?? []).forEach((selection) => {
          const typedSelection = selection as BestSellerMaterialValueSelectionRow;
          const existing = materialValueSelectionsByProduct.get(typedSelection.product_id) ?? [];
          existing.push(typedSelection);
          materialValueSelectionsByProduct.set(typedSelection.product_id, existing);
        });
        bestSellerProducts = productIds
          .map((id) => productMap.get(id) ?? null)
          .filter((product): product is BestSellerProductRow => Boolean(product))
          .map((product, index) => {
            const selectedMetals = (selectionsByProduct.get(product.id) ?? [])
              .map((selection) => metalsById.get(selection.metal_id))
              .filter((metal): metal is BestSellerMetalRow => Boolean(metal))
              .map((metal) => ({
                id: metal.id,
                name: metal.name,
                slug: metal.slug,
                colorHex: metal.color_hex ?? null,
              }));
            const fallbackMedia =
              (mediaByProduct.get(product.id) ?? []).find((entry) => entry.is_default_fallback && entry.image_1_path) ??
              (mediaByProduct.get(product.id) ?? []).find((entry) => entry.image_1_path);
            const primaryMaterialValueName =
              (materialValueSelectionsByProduct.get(product.id) ?? [])
                .map((selection) => materialValuesById.get(selection.material_value_id)?.name)
                .find(Boolean) ?? undefined;

            return {
              id: product.id,
              slug: product.slug,
              name: product.name,
              meta: buildBestSellerMetaFromMaterialValue(product, primaryMaterialValueName),
              price: buildBestSellerPrice(product.base_price),
              badge: index === 0 ? 'Bestseller' : product.featured ? 'Featured' : 'Selected',
              badgeVariant: index === 0 || product.featured ? 'navy' : 'outline',
              detailTemplate: product.detail_template === 'hiphop' ? 'hiphop' : 'standard',
              image: toPublicUrl(fallbackMedia?.image_1_path || product.image_1_path),
              metalsFull: selectedMetals,
            };
          });
      }
    }

    const diamondInfoConfigError = diamondInfoConfigResult.error
    const diamondInfoFeatureError = diamondInfoResult.error
    const collectionPageConfigError = collectionPageConfigResult.error
    const isMissingDiamondInfoConfigTable =
      diamondInfoConfigError?.code === 'PGRST205' ||
      diamondInfoConfigError?.message?.includes("Could not find the table 'public.diamond_info_config'")
    const isMissingDiamondInfoFeatureTable =
      diamondInfoFeatureError?.code === 'PGRST205' ||
      diamondInfoFeatureError?.message?.includes("Could not find the table 'public.diamond_info_feature_items'")
    const isMissingCollectionPageConfigTable =
      collectionPageConfigError?.code === 'PGRST205' ||
      collectionPageConfigError?.message?.includes("Could not find the table 'public.collection_page_config'")

    if (diamondInfoFeatureError && !isMissingDiamondInfoFeatureTable) {
      throw diamondInfoFeatureError
    }
    if (diamondInfoConfigError && !isMissingDiamondInfoConfigTable) {
      throw diamondInfoConfigError
    }
    if (collectionPageConfigError && !isMissingCollectionPageConfigTable) {
      throw collectionPageConfigError
    }

    return {
      heroContent: heroData ? { ...heroData, slider_items: sliderItems ?? [] } : undefined,
      blogRows: blogResult.data ?? [],
      collectionItems: collectionResult.data ?? [],
      materialItems: materialResult.data ?? [],
      discoverShapesItems: (discoverShapesResult.data ?? []).map((item) => ({
        ...item,
        image_path: toPublicUrl(item.image_path) || item.image_path,
        href: resolveDiscoverShapeHref(item.shape_id, discoverStoneShapes),
      })),
      discoverRingsItems: (discoverRingsResult.data ?? []).map((item) => ({
        ...item,
        image_path: toPublicUrl(item.image_path) || item.image_path,
        href: resolveDiscoverRingHref({
          title: item.title,
          targetKind: item.target_kind,
          targetId: item.target_id,
          categories: discoverCategories,
          subcategories: discoverSubcategories,
          options: discoverOptions,
          stoneShapes: discoverStoneShapes,
          styles: discoverStyles,
        }),
      })),
      hiphopSection:
        hiphopResult.data ?? {
          eyebrow: 'Hip Hop Collection · House of Diams',
          heading_line_1: 'Ice That',
          heading_line_2: 'Speaks',
          heading_emphasis: 'Louder.',
          cta_label: 'Shop Iced Pieces',
          cta_link: '/hiphop',
          image_path: '',
          image_alt: 'House of Diams Hip Hop Collection',
        },
      collectionPageConfig: {
        pageEnabled: isMissingCollectionPageConfigTable ? false : (collectionPageConfigResult.data?.page_enabled ?? false),
        showInFooter: isMissingCollectionPageConfigTable ? false : (collectionPageConfigResult.data?.show_in_footer ?? false),
        showHomeShowcase: isMissingCollectionPageConfigTable ? false : (collectionPageConfigResult.data?.show_home_showcase ?? false),
        showcaseHeading: collectionPageConfigResult.data?.showcase_heading ?? 'Collection',
        showcaseSubtitle: collectionPageConfigResult.data?.showcase_subtitle ?? 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.',
        showcaseCtaLabel: collectionPageConfigResult.data?.showcase_cta_label ?? 'Explore Collection',
        showcaseCtaHref: collectionPageConfigResult.data?.showcase_cta_href ?? '/collection',
        showcaseImageUrl: toPublicUrl(collectionPageConfigResult.data?.showcase_image_path),
        showcaseMobileImageUrl: toPublicUrl(collectionPageConfigResult.data?.showcase_mobile_image_path),
      },
      couplesData: {
        eyebrow: couplesSectionResult.data?.eyebrow ?? 'Love Stories',
        heading: couplesSectionResult.data?.heading ?? 'Our Cute Couples',
        subtitle:
          couplesSectionResult.data?.subtitle ??
          'Real couples. Real proposals. Real diamonds. Every ring tells a story.',
        items: couplesItems,
      },
      diamondInfoItems: isMissingDiamondInfoFeatureTable
        ? []
        : (diamondInfoResult.data ?? []).map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
            iconSvg: item.icon_svg ?? '',
            title: item.title ?? '',
            description: item.description ?? '',
            is_active: item.is_active ?? true,
          })),
      diamondInfoConfig: {
        videoEnabled: isMissingDiamondInfoConfigTable ? false : (diamondInfoConfigResult.data?.video_enabled ?? false),
        videoUrl: isMissingDiamondInfoConfigTable ? undefined : toPublicUrl(diamondInfoConfigResult.data?.video_path),
        videoPosterUrl: isMissingDiamondInfoConfigTable ? undefined : toPublicUrl(diamondInfoConfigResult.data?.video_poster_path),
        layoutMode: isMissingDiamondInfoConfigTable ? 'split_video_text' : (diamondInfoConfigResult.data?.layout_mode ?? 'split_video_text'),
        eyebrow: isMissingDiamondInfoConfigTable ? '' : (diamondInfoConfigResult.data?.eyebrow ?? ''),
        sectionHeading: isMissingDiamondInfoConfigTable ? '' : (diamondInfoConfigResult.data?.section_heading ?? ''),
        sectionSubtext: isMissingDiamondInfoConfigTable ? '' : (diamondInfoConfigResult.data?.section_subtext ?? ''),
        ctaLabel: isMissingDiamondInfoConfigTable ? '' : (diamondInfoConfigResult.data?.cta_label ?? ''),
        ctaLink: isMissingDiamondInfoConfigTable ? '' : (diamondInfoConfigResult.data?.cta_link ?? ''),
      },
      testimonialsData: {
        eyebrow: testimonialsSectionResult.data?.eyebrow ?? 'Client Stories',
        heading: testimonialsSectionResult.data?.heading ?? 'What Our Clients Say',
        items: testimonialsItems,
      },
      marqueeData: {
        title: marqueeSectionResult.data?.title ?? 'Loved by Clients Worldwide',
        items: marqueeItems,
      },
      bestSellerSection: {
        eyebrow: bestSellerSectionResult.data?.eyebrow ?? 'House of Diams',
        heading: bestSellerSectionResult.data?.heading ?? 'Our Best Sellers',
        cta_label: bestSellerSectionResult.data?.cta_label ?? 'View All Collection',
        cta_href: bestSellerSectionResult.data?.cta_href ?? '/shop',
      },
      bestSellerProducts,
    };
  },
  ['home-page-data-v3'],
  { revalidate: 30 }
);

export async function getHomePageData() {
  return loadHomePageData();
}
