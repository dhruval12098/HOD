import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

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
  product_detail: string;
  image_path: string;
};

export type HomeTestimonialsData = {
  eyebrow: string;
  heading: string;
  items: Array<{ quote: string; author: string; origin: string; rating?: number }>;
};

export type HomeDiamondInfoItem = {
  sort_order: number;
  label: string;
  heading: string;
  paragraph: string;
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
  image?: string;
};

function toPublicUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${supabaseUrl}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'}/${path}`;
}

function buildBestSellerMeta(product: any) {
  const bits = [
    product.option?.name || product.subcategory?.name || product.category?.name || '',
    product.gemstone_label && product.gemstone_value ? `${product.gemstone_label} · ${product.gemstone_value}` : '',
    product.purity_values?.[0] || '',
  ].filter(Boolean);

  return bits.join(' · ');
}

function buildBestSellerPrice(value: number | null | undefined) {
  if (!value) return 'Price on Request';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

const loadHomePageData = unstable_cache(
  async () => {
    const supabase = createHomeSupabaseClient();

    const [
      heroResult,
      blogResult,
      collectionResult,
      materialResult,
      hiphopResult,
      certificationsSectionResult,
      certificationsItemsResult,
      couplesSectionResult,
      diamondInfoResult,
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
        .from('hiphop_showcase_section')
        .select('eyebrow, heading_line_1, heading_line_2, heading_emphasis, cta_label, cta_link, image_path, image_alt')
        .eq('section_key', 'home_hiphop_showcase')
        .maybeSingle(),
      supabase
        .from('certifications_section')
        .select('eyebrow, heading')
        .eq('section_key', 'home_certifications')
        .maybeSingle(),
      supabase
        .from('certifications_items')
        .select('sort_order, title, description, badge, icon_path')
        .order('sort_order', { ascending: true }),
      supabase
        .from('couples_section')
        .select('id, eyebrow, heading, subtitle')
        .eq('section_key', 'home_couples')
        .maybeSingle(),
      supabase
        .from('diamond_info_sections')
        .select('sort_order, label, heading, paragraph')
        .order('sort_order', { ascending: true }),
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
        .select('sort_order, image_path, button_text, button_link')
        .eq('hero_id', heroData.id)
        .order('sort_order', { ascending: true });
      sliderItems = itemsData ?? [];
    }

    let couplesItems: HomeCoupleItem[] = [];
    if (couplesSectionResult.data?.id) {
      const { data } = await supabase
        .from('couples_items')
        .select('sort_order, names, location, story, product_name, product_detail, image_path')
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
    if (bestSellerSectionResult.data?.id) {
      const productIds = (bestSellerProductSelectionsResult.data ?? [])
        .filter((item) => item.section_id === bestSellerSectionResult.data?.id)
        .map((item) => item.product_id);

      if (productIds.length) {
        const { data } = await supabase
          .from('products')
          .select(`
            id,
            slug,
            name,
            base_price,
            featured,
            image_1_path,
            gemstone_label,
            gemstone_value,
            purity_values,
            subcategory:catalog_subcategories(name),
            option:catalog_options(name),
            category:catalog_categories(name)
          `)
          .in('id', productIds)
          .eq('status', 'active');

        const productMap = new Map((data ?? []).map((item) => [item.id, item]));
        bestSellerProducts = productIds
          .map((id) => productMap.get(id))
          .filter(Boolean)
          .map((product: any, index) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            meta: buildBestSellerMeta(product),
            price: buildBestSellerPrice(product.base_price),
            badge: index === 0 ? 'Bestseller' : product.featured ? 'Featured' : 'Selected',
            badgeVariant: index === 0 || product.featured ? 'navy' : 'outline',
            image: toPublicUrl(product.image_1_path),
          }));
      }
    }

    return {
      heroContent: heroData ? { ...heroData, slider_items: sliderItems ?? [] } : undefined,
      blogRows: blogResult.data ?? [],
      collectionItems: collectionResult.data ?? [],
      materialItems: materialResult.data ?? [],
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
      certificationsSection:
        certificationsSectionResult.data ?? {
          eyebrow: 'Our Promise',
          heading: 'Why Choose House of Diams',
        },
      certificationItems: certificationsItemsResult.data ?? [],
      couplesData: {
        eyebrow: couplesSectionResult.data?.eyebrow ?? 'Love Stories',
        heading: couplesSectionResult.data?.heading ?? 'Our Cute Couples',
        subtitle:
          couplesSectionResult.data?.subtitle ??
          'Real couples. Real proposals. Real diamonds. Every ring tells a story.',
        items: couplesItems,
      },
      diamondInfoItems: diamondInfoResult.data ?? [],
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
  ['home-page-data-v1'],
  { revalidate: 300 }
);

export async function getHomePageData() {
  return loadHomePageData();
}
