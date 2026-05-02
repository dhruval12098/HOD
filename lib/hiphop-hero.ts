import { createSupabaseServerClient } from '@/lib/server-supabase'

export type HipHopHeroSlide = {
  sort_order: number
  image_path: string
  mobile_image_path?: string
  button_text: string
  button_link: string
}

export type HipHopHeroContent = {
  eyebrow: string
  headline: string
  subtitle: string
  slider_enabled?: boolean
}

export const fallbackHipHopHeroContent: HipHopHeroContent = {
  eyebrow: 'Hip Hop',
  headline: 'Hip Hop Jewellery',
  subtitle: 'Fully iced chains, grillz, pendants and statement rings - handcrafted with CVD diamonds in 14K and 18K gold.',
  slider_enabled: false,
}

export async function getHipHopHeroData() {
  const supabase = createSupabaseServerClient()

  try {
    const { data: section } = await supabase
      .from('hiphop_hero_content')
      .select('*')
      .eq('section_key', 'hiphop_hero')
      .eq('is_active', true)
      .maybeSingle()

    if (section) {
      const { data: items } = await supabase
        .from('hiphop_hero_slider_items')
        .select('id, sort_order, image_path, mobile_image_path, button_text, button_link')
        .eq('hero_id', section.id)
        .order('sort_order', { ascending: true })

      const nextSlides = (items ?? []).filter((item) => item.image_path?.trim())
      const hasBanner = Boolean(section.slider_enabled) && nextSlides.length > 0

      if (hasBanner) {
        return {
          content: {
            eyebrow: section.eyebrow ?? fallbackHipHopHeroContent.eyebrow,
            headline: section.headline ?? fallbackHipHopHeroContent.headline,
            subtitle: section.subtitle ?? fallbackHipHopHeroContent.subtitle,
            slider_enabled: true,
          } satisfies HipHopHeroContent,
          slides: nextSlides as HipHopHeroSlide[],
        }
      }

      return {
        content: {
          eyebrow: section.eyebrow ?? fallbackHipHopHeroContent.eyebrow,
          headline: section.headline ?? fallbackHipHopHeroContent.headline,
          subtitle: section.subtitle ?? fallbackHipHopHeroContent.subtitle,
          slider_enabled: Boolean(section.slider_enabled),
        } satisfies HipHopHeroContent,
        slides: nextSlides as HipHopHeroSlide[],
      }
    }

    const { data: legacySection } = await supabase
      .from('hiphop_showcase_section')
      .select('eyebrow, heading_line_1, heading_line_2, heading_emphasis, cta_label, cta_link, image_path')
      .eq('section_key', 'home_hiphop_showcase')
      .maybeSingle()

    if (legacySection?.image_path) {
      const legacyHeadline = [
        legacySection.heading_line_1,
        legacySection.heading_line_2,
        legacySection.heading_emphasis,
      ]
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .join(' ')

      return {
        content: {
          eyebrow: legacySection.eyebrow ?? fallbackHipHopHeroContent.eyebrow,
          headline: legacyHeadline || fallbackHipHopHeroContent.headline,
          subtitle: fallbackHipHopHeroContent.subtitle,
          slider_enabled: true,
        } satisfies HipHopHeroContent,
        slides: [
          {
            sort_order: 1,
            image_path: legacySection.image_path,
            mobile_image_path: legacySection.image_path,
            button_text: legacySection.cta_label ?? 'Explore',
            button_link: legacySection.cta_link ?? '/hiphop',
          },
        ] satisfies HipHopHeroSlide[],
      }
    }
  } catch {}

  return {
    content: fallbackHipHopHeroContent,
    slides: [] as HipHopHeroSlide[],
  }
}
