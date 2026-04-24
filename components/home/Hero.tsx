'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type HeroSlide = {
  sort_order: number;
  image_path: string;
  mobile_image_path?: string;
  button_text: string;
  button_link: string;
};

type HeroContent = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  slider_enabled?: boolean;
  slider_items?: HeroSlide[];
};

interface HeroProps {
  onEnquireClick?: () => void;
  initialContent?: HeroContent;
}

const defaultContent: HeroContent = {
  eyebrow: 'Surat, India · Est. 2014 · Fine Jewellery',
  headline: 'Crafted in Light.',
  subtitle:
    'Natural and CVD diamonds, precious gemstones and bespoke fine jewellery — handcrafted in the diamond capital of the world.',
  slider_enabled: false,
  slider_items: [],
};

const getPublicImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default function Hero({ initialContent }: HeroProps) {
  const [content, setContent] = useState<HeroContent>(() => ({
    ...defaultContent,
    ...initialContent,
    slider_items: initialContent?.slider_items ?? [],
  }));
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (initialContent) return;

    const loadHero = async () => {
      const { data: heroData } = await supabase
        .from('homepage_hero')
        .select('id, eyebrow, headline, subtitle, slider_enabled')
        .eq('section_key', 'home_hero')
        .eq('is_active', true)
        .single();

      if (!heroData) return;

      let sliderItems: HeroSlide[] = [];

        if (heroData.slider_enabled) {
          const { data: itemsData } = await supabase
            .from('homepage_hero_slider_items')
            .select('sort_order, image_path, mobile_image_path, button_text, button_link')
            .eq('hero_id', heroData.id)
            .order('sort_order', { ascending: true });

        sliderItems = itemsData ?? [];
      }

      setContent({
        eyebrow: heroData.eyebrow,
        headline: heroData.headline,
        subtitle: heroData.subtitle,
        slider_enabled: heroData.slider_enabled,
        slider_items: sliderItems,
      });
    };

    loadHero();
  }, [initialContent]);

  const slides = useMemo(
    () =>
      (content.slider_items ?? [])
        .filter((item) => item.image_path.trim().length > 0)
        .sort((a, b) => a.sort_order - b.sort_order),
    [content.slider_items]
  );

  useEffect(() => {
    if (!content.slider_enabled || slides.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [content.slider_enabled, slides]);

  const [line1, ...rest] = content.headline.split(' ');
  const line2 = rest.join(' ');
  const currentSlide = slides[activeSlide] ?? slides[0];
  const hasImageHero = Boolean(content.slider_enabled && currentSlide);

  return (
    <section
      className={[
        'relative flex items-center justify-center overflow-hidden',
        hasImageHero
          ? 'min-h-0 px-0 py-0'
          : 'min-h-[92vh] px-[52px] py-[60px] max-md:min-h-[80vh] max-md:px-5 max-md:py-10',
      ].join(' ')}
      style={{
        background: hasImageHero
          ? 'var(--theme-base)'
          : 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(10,22,40,0.08), transparent), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(10,22,40,0.05), transparent), var(--theme-base)',
      }}
    >
      {!hasImageHero ? (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div
            className="absolute rounded-full pointer-events-none animate-[orbFloat_12s_ease-in-out_infinite_alternate]"
            style={{
              width: 380,
              height: 380,
              top: -120,
              right: -100,
              background: 'var(--theme-ink)',
              filter: 'blur(60px)',
              opacity: 0.25,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none animate-[orbFloat_10s_ease-in-out_infinite_alternate]"
            style={{
              width: 300,
              height: 300,
              bottom: -80,
              left: -80,
              background: '#20304a',
              filter: 'blur(60px)',
              opacity: 0.2,
              animationDelay: '2s',
            }}
          />
        </>
      ) : null}

      {content.slider_enabled && currentSlide ? (
        <div className="relative z-[2] w-full">
          <div className="relative overflow-hidden rounded-none border-0 bg-transparent shadow-none backdrop-blur-0">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[rgba(10,22,40,0.42)] via-[rgba(10,22,40,0.1)] to-transparent" />
            <div className="relative h-[288px] sm:h-[360px] md:h-[408px] lg:h-[456px]">
                {slides.map((slide, index) => {
                  const desktopImageUrl = getPublicImageUrl(slide.image_path);
                  const mobileImageUrl = getPublicImageUrl(slide.mobile_image_path || slide.image_path);
                  return (
                    <div
                      key={`${slide.sort_order}-${slide.image_path}`}
                      className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <>
                        <Image
                          src={mobileImageUrl}
                          alt={slide.button_text || `Hero slide ${index + 1}`}
                          fill
                          priority={index === 0}
                          sizes="100vw"
                          className="h-full w-full object-cover sm:hidden"
                        />
                        <Image
                          src={desktopImageUrl}
                          alt={slide.button_text || `Hero slide ${index + 1}`}
                          fill
                          priority={index === 0}
                          sizes="100vw"
                          className="hidden h-full w-full object-cover sm:block"
                        />
                      </>
                    </div>
                  );
                })}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
              <div className="flex flex-col items-start gap-4">
                <Link
                  href={currentSlide.button_link || '#'}
                  className="inline-flex items-center justify-center gap-2.5 bg-[var(--theme-ink)] px-[24px] py-3 text-[9px] uppercase tracking-[0.22em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20304a] sm:px-[28px] sm:py-4 sm:text-[10px] sm:tracking-[0.28em]"
                >
                  {currentSlide.button_text || 'Explore'}
                </Link>

                {slides.length > 1 && (
                  <div className="flex items-center gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={`${slide.sort_order}-dot`}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/45'}`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-[2] max-w-[960px] text-center">
          <div className="mb-9 inline-flex items-center gap-3.5 rounded-full border border-[var(--theme-border-strong)] bg-[rgba(255,255,255,0.5)] px-[22px] py-[9px] text-[10px] font-normal uppercase tracking-[0.32em] text-[var(--theme-ink)] backdrop-blur-[10px] animate-[fadeUp_1s_0.2s_ease_forwards]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--theme-ink)]" />
            {content.eyebrow}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--theme-ink)]" />
          </div>

          <h1 className="mb-8 animate-[fadeUp_1.2s_0.4s_ease_forwards] font-serif text-[clamp(56px,9vw,132px)] font-light leading-[0.95] tracking-[-0.01em] text-[var(--theme-heading)]">
            {line1}
            <br />
            <span className="relative inline-block font-normal text-[var(--theme-ink)]">
              <span className="relative">
                {line2}
                <span
                  className="absolute bottom-[-8px] left-[5%] w-[90%] h-px pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--theme-ink), transparent)' }}
                />
              </span>
            </span>
          </h1>

          <p className="mx-auto mb-11 max-w-[620px] animate-[fadeUp_1.2s_0.6s_ease_forwards] font-serif text-[13px] font-light leading-[2] tracking-[0.14em] text-[var(--theme-muted)]">
            {content.subtitle}
          </p>

          <div className="flex gap-[18px] justify-center flex-wrap animate-[fadeUp_1.2s_0.8s_ease_forwards] max-md:flex-col max-md:w-full">
            <Link
              href="/shop"
              className="group relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden border-none bg-[var(--theme-ink)] px-[34px] py-4 text-[10px] font-normal uppercase tracking-[0.28em] text-white no-underline transition-all duration-400 max-md:justify-center hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.18)]"
            >
              <span className="absolute inset-0 z-0 translate-y-full bg-[#20304a] transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)] group-hover:translate-y-0" />
              <span className="relative z-10">Explore Collection</span>
            </Link>
            <Link
              href="/bespoke"
              className="inline-flex cursor-pointer items-center justify-center gap-2.5 border border-[var(--theme-ink)] bg-transparent px-8 py-[15px] text-[10px] font-normal uppercase tracking-[0.28em] text-[var(--theme-ink)] no-underline transition-all duration-400 hover:bg-[var(--theme-ink)] hover:text-white"
            >
              Commission a Piece
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
