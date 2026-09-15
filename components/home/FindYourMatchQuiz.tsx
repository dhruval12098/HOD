'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react';

import quizConfigJson from '@/lib/find-your-match-config.json';
import { BrandButton } from '@/components/ui/BrandButton';

type ProductId = 'ring' | 'necklace' | 'bracelet' | 'earring';
type TrackId = 'metal' | 'shape' | 'style' | 'budget';
type Option = { id: string; label: string; sub: string };
type Question = { id: string; text: string; options: Option[] };
type Track = {
  id: string;
  name: string;
  blurb: string;
  questions: Question[];
  matrix?: Record<string, Record<string, string>>;
  runnerMap?: Record<string, { runner: string; copy: string }>;
  base?: Record<string, Record<string, string>>;
  base2?: Record<string, Record<string, string>>;
  override?: Record<string, string>;
  why?: Record<string, string>;
  overrideWhy?: Record<string, string>;
};
type BudgetOption = Option & { carat: string; q: string };
type Product = { id: ProductId; name: string; sub: string; shape: Track; style: Track; budget: BudgetOption[] };
type Result = { name: string; runnerUp: string; reason: string; query: string };
type SavedState = {
  productId?: ProductId;
  answers: Partial<Record<TrackId, Record<string, string>>>;
  results: Partial<Record<TrackId, Result>>;
};

const config = quizConfigJson as unknown as {
  metal: Track & {
    colourMatrix: Record<string, Record<string, string>>;
    karatMap: Record<string, string>;
    karatReason: Record<string, string>;
    colourReason: Record<string, string>;
    altColour: Record<string, string>;
  };
  products: Record<ProductId, Product>;
  trackOrder: TrackId[];
};

const STORAGE_KEY = 'house-of-diams-find-your-match-v1';
const PRODUCT_IDS = Object.keys(config.products) as ProductId[];

function emitQuizEvent(name: 'quiz_open' | 'track_start' | 'question_answer' | 'result' | 'cta_click' | 'abandon', detail: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(`houseofdiams:${name}`, { detail: { ...detail, event: name } }));
}

function optionLabel(question: Question | undefined, id: string | undefined) {
  return question?.options.find((option) => option.id === id)?.label ?? id ?? '';
}

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function resolveResult(product: Product, trackId: TrackId, answers: Record<string, string>): Result {
  if (trackId === 'metal') {
    const wardrobe = answers.wardrobe;
    const life = answers.life;
    const undertone = answers.undertone === 'unsure' ? 'neutral' : answers.undertone;
    const colour = config.metal.colourMatrix[undertone]?.[wardrobe] ?? 'Yellow';
    const karat = config.metal.karatMap[life] ?? '14K';
    const name = `${karat} ${colour} Gold`;
    return {
      name,
      runnerUp: `${karat} ${config.metal.altColour[colour] ?? 'White'} Gold`,
      reason: `Your ${optionLabel(config.metal.questions[0], wardrobe).toLowerCase()} wardrobe points to ${colour.toLowerCase()} gold, and because you chose ${optionLabel(config.metal.questions[1], life).toLowerCase()}, ${config.metal.karatReason[life]}. ${config.metal.colourReason[colour]}.`,
      query: `metal=${slug(name)}`,
    };
  }

  if (trackId === 'budget') {
    const choice = product.budget.find((item) => item.id === answers.budget) ?? product.budget[1];
    const runner = product.budget.find((item) => item.id !== choice.id) ?? choice;
    return {
      name: choice.label,
      runnerUp: runner.label,
      reason: `You chose ${choice.label.toLowerCase()} for ${product.name.toLowerCase()}. That range typically gives you ${choice.carat}, while keeping the search focused on pieces that fit your spend.`,
      query: choice.q,
    };
  }

  const track = product[trackId];
  if (trackId === 'shape') {
    const result = track.matrix?.[answers.visual]?.[answers.energy] ?? 'Round';
    const body = track.runnerMap?.[answers.body];
    let runner = body?.runner ?? 'Oval';
    if (runner === result) runner = result === 'Round' ? 'Oval' : 'Round';
    return {
      name: result,
      runnerUp: runner,
      reason: `You chose ${optionLabel(track.questions[0], answers.energy).toLowerCase()} energy and said ${optionLabel(track.questions[1], answers.visual).toLowerCase()} matters most. ${body?.copy ?? 'Your proportions leave room to follow pure preference.'}`,
      query: `shape=${slug(result)}`,
    };
  }

  const presence = answers.presence;
  const primaryKey = answers.job ?? answers.fit;
  const base = track.base?.[primaryKey]?.[presence] ?? track.base2?.[primaryKey]?.[presence] ?? 'Solitaire';
  const override = answers.say && answers.say !== 'beautiful' ? track.override?.[answers.say] : undefined;
  const result = override ?? base;
  const runner = override && base !== result ? base : result === 'Solitaire' ? 'Bezel' : 'Solitaire';
  const why = override ? track.overrideWhy?.[answers.say] : track.why?.[primaryKey];
  return {
    name: result,
    runnerUp: runner,
    reason: `${optionLabel(track.questions.find((q) => q.id === 'presence'), presence) || 'Your chosen level of presence'} meets the way ${why ?? 'you want the piece to look and feel every day'}.`,
    query: `style=${slug(result)}`,
  };
}

function getTrack(product: Product, trackId: TrackId): Track {
  if (trackId === 'metal') return config.metal;
  if (trackId === 'budget') {
    return { id: 'budget', name: 'Budget', blurb: 'Your preferred range', questions: [{ id: 'budget', text: "What's your budget?", options: product.budget }] };
  }
  return product[trackId];
}

function buildShopHref(productId: ProductId, results: SavedState['results']) {
  const query = [`type=${productId}`, ...config.trackOrder.map((id) => results[id]?.query).filter(Boolean)].join('&');
  return `/shop?${query}`;
}

export function FindYourMatchQuiz() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasHydrated = useRef(false);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<'product' | 'hub' | 'track' | 'result'>('product');
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [state, setState] = useState<SavedState>({ answers: {}, results: {} });
  const hasProgress = Boolean(state.productId || Object.keys(state.answers).length);

  const product = state.productId ? config.products[state.productId] : null;
  const track = product && activeTrack ? getTrack(product, activeTrack) : null;
  const activeResult = activeTrack ? state.results[activeTrack] : undefined;
  const completedCount = Object.keys(state.results).length;

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setState(JSON.parse(saved) as SavedState);
      } catch { /* localStorage may be unavailable in privacy mode */ }
      hasHydrated.current = true;
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* non-blocking persistence */ }
  }, [state]);

  const close = useCallback((abandoned = false) => {
    if (abandoned && hasProgress && screen !== 'hub') emitQuizEvent('abandon', { product: state.productId, track: activeTrack, screen });
    setOpen(false);
    requestAnimationFrame(() => document.getElementById('find-your-match-trigger')?.focus());
  }, [activeTrack, hasProgress, screen, state.productId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button, a')?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, [close, open]);

  const openQuiz = () => {
    setScreen(state.productId ? 'hub' : 'product');
    setOpen(true);
    emitQuizEvent('quiz_open', { returning: Boolean(state.productId) });
  };

  const selectProduct = (id: ProductId) => {
    setState((current) => current.productId === id ? { ...current, productId: id } : { productId: id, answers: {}, results: {} });
    setScreen('hub');
  };

  const startTrack = (id: TrackId) => {
    setActiveTrack(id); setQuestionIndex(0); setScreen('track');
    emitQuizEvent('track_start', { product: state.productId, track: id });
  };

  const answerQuestion = (option: Option) => {
    if (!activeTrack || !track || !product) return;
    const question = track.questions[questionIndex];
    const nextAnswers = { ...(state.answers[activeTrack] ?? {}), [question.id]: option.id };
    setState((current) => ({ ...current, answers: { ...current.answers, [activeTrack]: nextAnswers } }));
    emitQuizEvent('question_answer', { product: product.id, track: activeTrack, question: question.id, answer: option.id });
    if (questionIndex < track.questions.length - 1) { setQuestionIndex((index) => index + 1); return; }
    const result = resolveResult(product, activeTrack, nextAnswers);
    setState((current) => ({ ...current, answers: { ...current.answers, [activeTrack]: nextAnswers }, results: { ...current.results, [activeTrack]: result } }));
    emitQuizEvent('result', { product: product.id, track: activeTrack, result: result.name });
    setScreen('result');
  };

  const shopHref = useMemo(() => state.productId ? buildShopHref(state.productId, state.results) : '/shop', [state.productId, state.results]);

  return <>
    <BrandButton id="find-your-match-trigger" onClick={openQuiz} className="mt-[var(--space-8)] gap-[var(--space-3)]">
      TAKE THE QUIZ <span aria-hidden="true">&rarr;</span>
    </BrandButton>

    {open ? <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-[var(--space-6)]" onMouseDown={(event) => { if (event.target === event.currentTarget) close(true); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative flex max-h-[94dvh] w-full max-w-[58rem] flex-col overflow-hidden bg-[var(--color-brand-accent,#fff)] text-[var(--color-brand-primary,#000)] shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:max-h-[88dvh]">
        <header className="flex shrink-0 items-center justify-between border-b border-black/10 px-[var(--space-5)] py-[var(--space-4)] sm:px-[var(--space-8)]">
          <div className="font-[family-name:var(--font-family-secondary)] text-[10px] font-semibold uppercase tracking-[.22em]">House of Diams · Find Your Match</div>
          <button type="button" aria-label="Close quiz" onClick={() => close(true)} className="grid size-10 place-items-center border border-black/15 transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"><X size={18}/></button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-[var(--space-5)] py-[var(--space-8)] sm:px-[var(--space-10)] sm:py-[var(--space-10)]">
          {screen === 'product' ? <section>
            <p className="font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[.18em] text-black/55">Step 01 · One tap</p>
            <h2 id={titleId} className="mt-[var(--space-3)] font-medium leading-[1.08]" style={{fontFamily:'var(--font-family-primary)',fontSize:'clamp(2rem,5vw,3.75rem)'}}>What are you looking for?</h2>
            <div className="mt-[var(--space-8)] grid gap-px bg-black/15 sm:grid-cols-2">
              {PRODUCT_IDS.map((id) => { const item = config.products[id]; return <button key={id} type="button" onClick={() => selectProduct(id)} className="group flex min-h-32 items-center justify-between bg-white p-[var(--space-6)] text-left transition hover:bg-[var(--color-brand-secondary,#F9F9F9)] focus-visible:relative focus-visible:z-10 focus-visible:outline-2">
                <span><strong className="block font-[family-name:var(--font-family-primary)] text-xl font-medium">{item.name}</strong><span className="mt-2 block font-[family-name:var(--font-family-secondary)] text-sm text-black/60">{item.sub}</span></span><ChevronRight className="transition group-hover:translate-x-1"/>
              </button>; })}
            </div>
          </section> : null}

          {screen === 'hub' && product ? <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[.18em] text-black/55">Step 02 · Your edit</p><h2 id={titleId} className="mt-3 font-medium leading-[1.08]" style={{fontFamily:'var(--font-family-primary)',fontSize:'clamp(1.9rem,4vw,3.25rem)'}}>What do you want help deciding?</h2></div>
              <button type="button" onClick={() => setScreen('product')} className="border-b border-black font-[family-name:var(--font-family-button)] text-xs font-semibold uppercase tracking-[.14em]">{product.name} · Edit</button>
            </div>
            <div className="mt-[var(--space-8)] grid gap-px bg-black/15 sm:grid-cols-2">
              {config.trackOrder.map((id, index) => { const item = getTrack(product,id); const result = state.results[id]; return <button key={id} type="button" onClick={() => startTrack(id)} className="group min-h-40 bg-white p-[var(--space-6)] text-left transition hover:bg-[var(--color-brand-secondary,#F9F9F9)] focus-visible:relative focus-visible:z-10 focus-visible:outline-2">
                <span className="flex items-center justify-between"><span className="font-[family-name:var(--font-family-secondary)] text-[10px] uppercase tracking-[.18em] text-black/45">0{index+1} · {item.questions.length} question{item.questions.length === 1 ? '' : 's'}</span>{result ? <span className="grid size-6 place-items-center bg-black text-white"><Check size={14}/></span>:<ChevronRight size={18}/>}</span>
                <strong className="mt-5 block font-[family-name:var(--font-family-primary)] text-2xl font-medium">{item.name}</strong><span className="mt-2 block font-[family-name:var(--font-family-secondary)] text-sm text-black/60">{result ? `Your match · ${result.name}` : item.blurb}</span>
              </button>; })}
            </div>
            {completedCount > 0 ? <div className="mt-[var(--space-8)] flex flex-col items-start justify-between gap-5 border-t border-black/15 pt-[var(--space-6)] sm:flex-row sm:items-center"><p className="font-[family-name:var(--font-family-secondary)] text-sm text-black/65">{completedCount} of 4 matches found. You can shop now or keep refining.</p><BrandButton href={shopHref} onClick={() => emitQuizEvent('cta_click',{action:'shop_matches',product:product.id})}>SHOP YOUR MATCHES</BrandButton></div> : null}
          </section> : null}

          {screen === 'track' && product && activeTrack && track ? <section>
            <button type="button" onClick={() => setScreen('hub')} className="inline-flex items-center gap-2 font-[family-name:var(--font-family-button)] text-xs font-semibold uppercase tracking-[.14em]"><ArrowLeft size={15}/> Back to your edit</button>
            <div className="mt-[var(--space-8)] flex items-end justify-between border-b border-black/15 pb-[var(--space-4)]"><div><p className="font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[.18em] text-black/55">{track.name} · Question {questionIndex+1} of {track.questions.length}</p><h2 id={titleId} className="mt-3 max-w-[40rem] font-medium leading-[1.12]" style={{fontFamily:'var(--font-family-primary)',fontSize:'clamp(1.75rem,4vw,3rem)'}}>{track.questions[questionIndex].text}</h2></div><span className="font-[family-name:var(--font-family-secondary)] text-sm tabular-nums">{Math.round(((questionIndex+1)/track.questions.length)*100)}%</span></div>
            <div className="mt-[var(--space-6)] grid gap-3 sm:grid-cols-2">
              {track.questions[questionIndex].options.map((option) => <button key={option.id} type="button" onClick={() => answerQuestion(option)} className="group flex min-h-28 items-center justify-between border border-black/15 p-[var(--space-5)] text-left transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"><span><strong className="block font-[family-name:var(--font-family-secondary)] text-sm font-semibold">{option.label}</strong><span className="mt-2 block font-[family-name:var(--font-family-secondary)] text-xs leading-relaxed opacity-60">{option.sub}</span></span><ChevronRight size={18}/></button>)}
            </div>
          </section> : null}

          {screen === 'result' && product && activeTrack && activeResult ? <section>
            <p className="font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[.18em] text-black/55">Your {activeTrack} match</p>
            <h2 id={titleId} className="mt-3 font-medium leading-none" style={{fontFamily:'var(--font-family-primary)',fontSize:'clamp(2.5rem,7vw,5.5rem)'}}>{activeResult.name}</h2>
            <p className="mt-[var(--space-6)] max-w-[42rem] font-[family-name:var(--font-family-secondary)] text-base leading-[1.75] text-black/70">{activeResult.reason}</p>
            <div className="mt-[var(--space-8)] border-y border-black/15 py-[var(--space-5)]"><span className="font-[family-name:var(--font-family-secondary)] text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">Your one alternative</span><p className="mt-2 font-[family-name:var(--font-family-primary)] text-xl font-medium">{activeResult.runnerUp}</p></div>
            <div className="mt-[var(--space-8)] flex flex-wrap gap-3"><BrandButton href={shopHref} onClick={() => emitQuizEvent('cta_click',{action:'shop_result',product:product.id,track:activeTrack})}>SHOP THIS MATCH</BrandButton><BrandButton onClick={() => setScreen('hub')} className="!border !border-black !bg-white !text-black hover:!bg-[var(--color-brand-secondary,#F9F9F9)]">CONTINUE YOUR EDIT</BrandButton></div>
          </section> : null}
        </div>
      </div>
    </div> : null}
  </>;
}
