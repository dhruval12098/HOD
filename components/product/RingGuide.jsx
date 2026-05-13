'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Ruler, X } from 'lucide-react';

const GUIDE_TABS = [
  { id: 'metal', label: 'Metal' },
  { id: 'shape', label: 'Shape' },
  { id: 'style', label: 'Style' },
  { id: 'size', label: 'Size' },
];

const METAL_STEPS = [
  {
    title: 'Find Your Metal',
    intro: 'A quick guided filter to narrow white, yellow, rose, or platinum without leaving the page.',
  },
  {
    title: 'Your everyday wardrobe feels',
    key: 'wardrobe',
    options: [
      { value: 'cool', title: 'Clean & Minimal', hint: 'Monochrome, sharp, precise.' },
      { value: 'warm', title: 'Warm & Classic', hint: 'Earth tones, tailored, timeless.' },
      { value: 'soft', title: 'Soft & Romantic', hint: 'Blush, cream, flowing.' },
      { value: 'bold', title: 'Bold & Maximalist', hint: 'Dark luxury, statement presence.' },
    ],
  },
  {
    title: 'How do you live in your jewellery?',
    key: 'life',
    options: [
      { value: 'active', title: 'Active Life', hint: 'Travel, movement, daily wear.' },
      { value: 'office', title: 'Professional', hint: 'Meetings, desk, everyday polish.' },
      { value: 'evening', title: 'Social & Evening', hint: 'Events, dinners, occasions.' },
    ],
  },
  {
    title: 'Your skin tone is closest to',
    key: 'skin',
    options: [
      { value: 'porcelain', title: 'Porcelain', hint: 'Very light with cool softness.' },
      { value: 'fair', title: 'Fair', hint: 'Light with balanced undertone.' },
      { value: 'medium', title: 'Medium', hint: 'Warm golden balance.' },
      { value: 'tan', title: 'Tan', hint: 'Sun-warmed depth.' },
      { value: 'deep', title: 'Deep', hint: 'Rich warm tone.' },
      { value: 'ebony', title: 'Ebony', hint: 'Deepest tone with strong contrast.' },
    ],
  },
];

const SHAPE_STEPS = [
  {
    title: 'Find Your Shape',
    intro: 'This keeps the decision lighter by showing one question at a time instead of a full comparison grid.',
  },
  {
    title: 'Which energy feels most like you?',
    key: 'energy',
    options: [
      { value: 'elegant', title: 'Elegant', hint: 'Refined and balanced.' },
      { value: 'bold', title: 'Bold', hint: 'Fashion-led and directional.' },
      { value: 'romantic', title: 'Romantic', hint: 'Soft and expressive.' },
      { value: 'modern', title: 'Modern', hint: 'Architectural and clean.' },
    ],
  },
  {
    title: 'What matters most visually?',
    key: 'priority',
    options: [
      { value: 'sparkle', title: 'Maximum Sparkle', hint: 'Light return first.' },
      { value: 'unique', title: 'Something Different', hint: 'Less obvious silhouette.' },
      { value: 'elongate', title: 'Longer Finger Look', hint: 'Elongating shape.' },
      { value: 'timeless', title: 'Forever Classic', hint: 'Always relevant.' },
    ],
  },
  {
    title: 'Your hand shape is closest to',
    key: 'hand',
    options: [
      { value: 'long', title: 'Long Fingers', hint: 'Graceful vertical proportion.' },
      { value: 'petite', title: 'Petite Fingers', hint: 'Benefits from elongation.' },
      { value: 'wide', title: 'Wider Hand', hint: 'Needs balanced spread.' },
      { value: 'average', title: 'Balanced', hint: 'Most shapes can work well.' },
    ],
  },
];

const STYLE_STEPS = [
  {
    title: 'Find Your Setting Style',
    intro: 'This flow narrows the setting language without stacking too much UI above the product details.',
  },
  {
    title: 'The overall look you want is',
    key: 'look',
    options: [
      { value: 'minimal', title: 'Minimal', hint: 'Pure and restrained.' },
      { value: 'sparkly', title: 'Sparkly', hint: 'More visible diamond presence.' },
      { value: 'vintage', title: 'Vintage', hint: 'Detail-rich and storied.' },
      { value: 'nature', title: 'Organic', hint: 'Flowing and sculptural.' },
    ],
  },
  {
    title: 'What should take the spotlight?',
    key: 'focus',
    options: [
      { value: 'centre', title: 'Centre Stone', hint: 'Setting stays quiet.' },
      { value: 'both', title: 'Both Equally', hint: 'Balanced composition.' },
      { value: 'setting', title: 'Setting Detail', hint: 'Craft and structure first.' },
    ],
  },
  {
    title: 'When you wear jewellery, you feel',
    key: 'feel',
    options: [
      { value: 'powerful', title: 'Powerful', hint: 'Jewellery as armour.' },
      { value: 'romantic', title: 'Romantic', hint: 'Jewellery as softness.' },
      { value: 'individual', title: 'Individual', hint: 'Jewellery as expression.' },
    ],
  },
];

const METALS = {
  white: { name: 'White Gold', grade: '14K or 18K White Gold', copy: 'Cool, luminous, and easy to style with modern wardrobes.', tags: ['Bright', 'Modern', 'Versatile'] },
  yellow: { name: 'Yellow Gold', grade: '14K or 18K Yellow Gold', copy: 'Warm, timeless, and especially strong on medium to deep skin tones.', tags: ['Classic', 'Warm', 'Heirloom'] },
  rose: { name: 'Rose Gold', grade: '14K Rose Gold', copy: 'Soft, romantic, and flattering when white feels too sharp.', tags: ['Soft', 'Romantic', 'Distinctive'] },
  platinum: { name: 'Platinum', grade: '950 Platinum', copy: 'Dense, premium, and ideal for cooler palettes or active daily wear.', tags: ['Prestige', 'Durable', 'Rare'] },
};

const SHAPES = {
  round: { name: 'Round', grade: 'Round Brilliant', copy: 'The safest timeless answer when sparkle matters most.', tags: ['Sparkle', 'Classic', 'Balanced'] },
  oval: { name: 'Oval', grade: 'Oval Brilliant', copy: 'Elegant and elongating, with a slightly more modern presence.', tags: ['Elongating', 'Modern', 'Romantic'] },
  pear: { name: 'Pear', grade: 'Pear / Teardrop', copy: 'Expressive and feminine, with more direction than round or cushion.', tags: ['Distinctive', 'Soft', 'Dramatic'] },
  emerald: { name: 'Emerald', grade: 'Emerald Cut', copy: 'Architectural and clean, with broad flashes instead of heavy sparkle.', tags: ['Editorial', 'Cool', 'Refined'] },
  cushion: { name: 'Cushion', grade: 'Cushion Brilliant', copy: 'Soft corners and rich light return for a romantic classic feel.', tags: ['Soft', 'Rich', 'Heirloom'] },
  marquise: { name: 'Marquise', grade: 'Marquise Brilliant', copy: 'The boldest elongating choice with strong finger presence.', tags: ['Bold', 'Rare', 'Longer Look'] },
};

const STYLES = {
  solitaire: { name: 'Solitaire', grade: 'Single Stone Setting', copy: 'The cleanest architecture with full focus on the center stone.', tags: ['Minimal', 'Iconic', 'Timeless'] },
  pave: { name: 'Pave', grade: 'Diamond Pave Band', copy: 'Extra brilliance across the band for a more visibly luxurious feel.', tags: ['Sparkle', 'Luxury', 'Modern'] },
  halo: { name: 'Halo', grade: 'Halo Setting', copy: 'Frames the center stone and increases its visual size and brightness.', tags: ['Romantic', 'Amplified', 'Glamorous'] },
  vintage: { name: 'Vintage', grade: 'Vintage Inspired', copy: 'Best when you want milgrain, detail, and old-world character.', tags: ['Detailed', 'Storied', 'Heirloom'] },
  nature: { name: 'Nature', grade: 'Nature Inspired', copy: 'Organic curves and sculptural motion for a less expected ring.', tags: ['Organic', 'Poetic', 'Unique'] },
  threestone: { name: 'Three Stone', grade: 'Three Stone Setting', copy: 'Balanced, meaningful, and more substantial on hand.', tags: ['Meaningful', 'Balanced', 'Grand'] },
};

const SIZE_ROWS = [
  { eu: '44', us: '3', uk: 'F', d: 14.0, c: 44.2 },
  { eu: '46', us: '3.5', uk: 'G', d: 14.4, c: 45.5 },
  { eu: '47', us: '4', uk: 'H', d: 14.9, c: 46.8 },
  { eu: '48', us: '4.5', uk: 'I', d: 15.3, c: 48.0 },
  { eu: '49', us: '5', uk: 'J / K', d: 15.7, c: 49.3 },
  { eu: '51', us: '5.5', uk: 'K / L', d: 16.1, c: 50.6 },
  { eu: '52', us: '6', uk: 'L / M', d: 16.5, c: 51.9 },
  { eu: '53', us: '6.5', uk: 'M / N', d: 16.9, c: 53.1 },
  { eu: '54', us: '7', uk: 'N / O', d: 17.3, c: 54.4 },
  { eu: '56', us: '7.5', uk: 'O / P', d: 17.7, c: 55.7 },
  { eu: '57', us: '8', uk: 'P / Q', d: 18.2, c: 57.2 },
  { eu: '58', us: '8.5', uk: 'Q / R', d: 18.6, c: 58.5 },
  { eu: '60', us: '9', uk: 'R / S', d: 19.0, c: 59.7 },
  { eu: '61', us: '9.5', uk: 'S / T', d: 19.4, c: 61.0 },
  { eu: '62', us: '10', uk: 'T / U', d: 19.8, c: 62.2 },
];

function scoreMetal(answers) {
  const scores = { white: 0, yellow: 0, rose: 0, platinum: 0 };
  if (answers.wardrobe === 'cool') { scores.white += 3; scores.platinum += 2; }
  if (answers.wardrobe === 'warm') { scores.yellow += 3; scores.rose += 1; }
  if (answers.wardrobe === 'soft') { scores.rose += 3; scores.yellow += 1; }
  if (answers.wardrobe === 'bold') { scores.platinum += 3; scores.white += 1; }
  if (answers.life === 'active') { scores.platinum += 2; scores.white += 1; }
  if (answers.life === 'office') { scores.white += 2; scores.platinum += 1; }
  if (answers.life === 'evening') { scores.yellow += 2; scores.rose += 2; scores.platinum += 1; }
  if (answers.skin === 'porcelain') { scores.white += 3; scores.rose += 2; }
  if (answers.skin === 'fair') { scores.white += 2; scores.rose += 2; scores.yellow += 1; }
  if (answers.skin === 'medium') { scores.yellow += 3; scores.rose += 2; }
  if (answers.skin === 'tan') { scores.yellow += 3; scores.rose += 1; }
  if (answers.skin === 'deep') { scores.yellow += 3; scores.platinum += 1; }
  if (answers.skin === 'ebony') { scores.platinum += 3; scores.yellow += 2; }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function scoreShape(answers) {
  const scores = { round: 0, oval: 0, pear: 0, emerald: 0, cushion: 0, marquise: 0 };
  if (answers.energy === 'elegant') { scores.round += 3; scores.emerald += 2; }
  if (answers.energy === 'bold') { scores.oval += 2; scores.marquise += 3; }
  if (answers.energy === 'romantic') { scores.pear += 3; scores.cushion += 2; }
  if (answers.energy === 'modern') { scores.emerald += 3; scores.oval += 1; }
  if (answers.priority === 'sparkle') { scores.round += 3; scores.cushion += 2; }
  if (answers.priority === 'unique') { scores.oval += 2; scores.pear += 2; scores.marquise += 2; }
  if (answers.priority === 'elongate') { scores.oval += 3; scores.pear += 2; scores.marquise += 3; }
  if (answers.priority === 'timeless') { scores.round += 3; scores.emerald += 2; }
  if (answers.hand === 'long') { scores.cushion += 2; scores.round += 1; }
  if (answers.hand === 'petite') { scores.oval += 3; scores.pear += 2; scores.marquise += 2; }
  if (answers.hand === 'wide') { scores.round += 2; scores.cushion += 2; }
  if (answers.hand === 'average') { scores.round += 1; scores.oval += 1; scores.emerald += 1; }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function scoreStyle(answers) {
  const scores = { solitaire: 0, pave: 0, halo: 0, vintage: 0, nature: 0, threestone: 0 };
  if (answers.look === 'minimal') scores.solitaire += 4;
  if (answers.look === 'sparkly') { scores.pave += 3; scores.halo += 2; }
  if (answers.look === 'vintage') scores.vintage += 4;
  if (answers.look === 'nature') scores.nature += 4;
  if (answers.focus === 'centre') scores.solitaire += 3;
  if (answers.focus === 'both') { scores.halo += 2; scores.threestone += 3; }
  if (answers.focus === 'setting') { scores.vintage += 2; scores.nature += 2; scores.pave += 2; }
  if (answers.feel === 'powerful') { scores.solitaire += 2; scores.threestone += 2; }
  if (answers.feel === 'romantic') { scores.halo += 3; scores.pave += 2; }
  if (answers.feel === 'individual') { scores.nature += 3; scores.vintage += 2; }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function closestSize(method, value) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return null;
  let best = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  SIZE_ROWS.forEach((row) => {
    const diff = Math.abs((method === 'diameter' ? row.d : row.c) - numeric);
    if (diff < bestDiff) {
      best = row;
      bestDiff = diff;
    }
  });
  return best;
}

function SmallOption({ title, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[8px] border border-[rgba(10,22,40,0.12)] bg-white px-4 py-3 text-left transition hover:border-[rgba(184,151,42,0.45)] hover:bg-[#faf7f2]"
      style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
    >
      <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0A1628]">{title}</div>
      <div className="mt-1 text-[11px] leading-[1.6] text-[#6A6A6A]">{hint}</div>
    </button>
  );
}

function ResultInline({ result }) {
  return (
    <div className="rounded-[10px] border border-[rgba(184,151,42,0.22)] bg-[#faf7f2] px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
        Suggested Match
      </div>
      <div className="mt-2 text-[28px] leading-none text-[#0A1628] font-display-title">{result.name}</div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#6A6A6A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
        {result.grade}
      </div>
      <p className="mt-3 text-[12px] leading-[1.75] text-[#253246]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
        {result.copy}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {result.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] border border-[rgba(184,151,42,0.24)] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#B8972A]"
            style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlowGuide({ label, steps, currentStep, answers, onStart, onBack, onRestart, onAnswer, result }) {
  const step = steps[currentStep];
  const questionIndex = Math.max(currentStep, 1);
  const totalQuestions = steps.length - 1;

  if (currentStep === 0) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
            {label} Guide
          </div>
          <h3 className="mt-2 text-[28px] leading-[1.02] text-[#0A1628] font-display-title">{step.title}</h3>
          <p className="mt-3 max-w-[720px] text-[12px] leading-[1.8] text-[#253246]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
            {step.intro}
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="rounded-[8px] bg-[#0A1628] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#faf7f2] transition hover:bg-[#253246]"
          style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
        >
          Start Guide
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
              {label} Complete
            </div>
            <h3 className="mt-2 text-[26px] leading-[1.02] text-[#0A1628] font-display-title">Your best fit</h3>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-[8px] border border-[rgba(10,22,40,0.14)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
            style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
          >
            Start Over
          </button>
        </div>
        <ResultInline result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
            {label} Step {questionIndex} of {totalQuestions}
          </div>
          <h3 className="mt-2 text-[24px] leading-[1.08] text-[#0A1628] font-display-title">{step.title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[8px] border border-[rgba(10,22,40,0.12)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
            style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-[8px] border border-[rgba(10,22,40,0.12)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
            style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {step.options.map((option) => (
          <SmallOption
            key={option.value}
            title={option.title}
            hint={option.hint}
            onClick={() => onAnswer(step.key, option.value)}
          />
        ))}
      </div>

      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8B94A5]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
        Current selection: {answers[step.key] ? step.options.find((option) => option.value === answers[step.key])?.title : 'None'}
      </div>
    </div>
  );
}

export default function RingGuide() {
  const [activeGuide, setActiveGuide] = useState('metal');
  const [isOpen, setIsOpen] = useState(false);
  const [metalStep, setMetalStep] = useState(0);
  const [shapeStep, setShapeStep] = useState(0);
  const [styleStep, setStyleStep] = useState(0);
  const [sizeStep, setSizeStep] = useState(0);
  const [metalAnswers, setMetalAnswers] = useState({ wardrobe: '', life: '', skin: '' });
  const [shapeAnswers, setShapeAnswers] = useState({ energy: '', priority: '', hand: '' });
  const [styleAnswers, setStyleAnswers] = useState({ look: '', focus: '', feel: '' });
  const [sizeMethod, setSizeMethod] = useState('');
  const [sizeValue, setSizeValue] = useState('');

  const metalResult = useMemo(() => (
    metalAnswers.wardrobe && metalAnswers.life && metalAnswers.skin ? METALS[scoreMetal(metalAnswers)] : null
  ), [metalAnswers]);
  const shapeResult = useMemo(() => (
    shapeAnswers.energy && shapeAnswers.priority && shapeAnswers.hand ? SHAPES[scoreShape(shapeAnswers)] : null
  ), [shapeAnswers]);
  const styleResult = useMemo(() => (
    styleAnswers.look && styleAnswers.focus && styleAnswers.feel ? STYLES[scoreStyle(styleAnswers)] : null
  ), [styleAnswers]);
  const sizeResult = useMemo(() => (
    sizeMethod ? closestSize(sizeMethod, sizeValue) : null
  ), [sizeMethod, sizeValue]);

  const restartMetal = () => {
    setMetalAnswers({ wardrobe: '', life: '', skin: '' });
    setMetalStep(0);
  };
  const restartShape = () => {
    setShapeAnswers({ energy: '', priority: '', hand: '' });
    setShapeStep(0);
  };
  const restartStyle = () => {
    setStyleAnswers({ look: '', focus: '', feel: '' });
    setStyleStep(0);
  };
  const restartSize = () => {
    setSizeMethod('');
    setSizeValue('');
    setSizeStep(0);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-8 flex w-full items-center justify-between rounded-[16px] border border-[rgba(10,22,40,0.10)] bg-[#F7F9FC] px-5 py-5 text-left transition hover:border-[rgba(10,22,40,0.18)] hover:bg-white"
        style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
      >
        <span className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(10,22,40,0.10)] bg-white text-[#0A1628] shadow-[0_10px_24px_rgba(10,22,40,0.06)]">
            <Ruler size={22} />
          </span>
          <span>
            <span className="block text-[19px] leading-[1.1] text-[#0A1628] font-display-title">
              Find your <em className="font-normal italic">ring size</em>
            </span>
            <span className="mt-1 block text-[12px] tracking-[0.04em] text-[#7A8496]">
              Quick guided sizing — 4 methods
            </span>
          </span>
        </span>
        <ArrowRight size={22} className="text-[#7A8496]" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="relative max-h-[88vh] w-full max-w-[1180px] overflow-y-auto rounded-[24px] bg-white p-5 shadow-[0_24px_90px_rgba(10,22,40,0.28)] sm:p-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(10,22,40,0.10)] bg-white text-[#0A1628] transition hover:bg-[#FAFBFD]"
              aria-label="Close ring guide"
            >
              <X size={18} />
            </button>

            <section className="rounded-[18px] border border-[rgba(10,22,40,0.10)] bg-white px-4 py-5 shadow-[0_14px_36px_rgba(10,22,40,0.04)] sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(10,22,40,0.08)] pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
            Ring Guide
          </div>
          <h2 className="mt-2 text-[32px] leading-[0.98] text-[#0A1628] font-display-title">
            Quick help, <em className="font-normal italic">without the long scroll</em>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {GUIDE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGuide(tab.id)}
              className={`rounded-[8px] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                activeGuide === tab.id
                  ? 'bg-[#0A1628] text-[#faf7f2]'
                  : 'border border-[rgba(10,22,40,0.12)] bg-white text-[#6A6A6A] hover:border-[#0A1628] hover:text-[#0A1628]'
              }`}
              style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5">
        {activeGuide === 'metal' ? (
          <FlowGuide
            label="Metal"
            steps={METAL_STEPS}
            currentStep={metalResult ? METAL_STEPS.length : metalStep}
            answers={metalAnswers}
            onStart={() => setMetalStep(1)}
            onBack={() => setMetalStep((value) => Math.max(0, value - 1))}
            onRestart={restartMetal}
            onAnswer={(key, value) => {
              setMetalAnswers((current) => ({ ...current, [key]: value }));
              setMetalStep((current) => Math.min(METAL_STEPS.length - 1, current + 1));
            }}
            result={metalResult}
          />
        ) : null}

        {activeGuide === 'shape' ? (
          <FlowGuide
            label="Shape"
            steps={SHAPE_STEPS}
            currentStep={shapeResult ? SHAPE_STEPS.length : shapeStep}
            answers={shapeAnswers}
            onStart={() => setShapeStep(1)}
            onBack={() => setShapeStep((value) => Math.max(0, value - 1))}
            onRestart={restartShape}
            onAnswer={(key, value) => {
              setShapeAnswers((current) => ({ ...current, [key]: value }));
              setShapeStep((current) => Math.min(SHAPE_STEPS.length - 1, current + 1));
            }}
            result={shapeResult}
          />
        ) : null}

        {activeGuide === 'style' ? (
          <FlowGuide
            label="Style"
            steps={STYLE_STEPS}
            currentStep={styleResult ? STYLE_STEPS.length : styleStep}
            answers={styleAnswers}
            onStart={() => setStyleStep(1)}
            onBack={() => setStyleStep((value) => Math.max(0, value - 1))}
            onRestart={restartStyle}
            onAnswer={(key, value) => {
              setStyleAnswers((current) => ({ ...current, [key]: value }));
              setStyleStep((current) => Math.min(STYLE_STEPS.length - 1, current + 1));
            }}
            result={styleResult}
          />
        ) : null}

        {activeGuide === 'size' ? (
          <div className="space-y-4">
            {sizeStep === 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                    Size Guide
                  </div>
                  <h3 className="mt-2 text-[28px] leading-[1.02] text-[#0A1628] font-display-title">Find your ring size</h3>
                  <p className="mt-3 max-w-[720px] text-[12px] leading-[1.8] text-[#253246]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                    Choose the method you have available. The estimate updates instantly and keeps the page much shorter than a full chart-first layout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSizeStep(1)}
                  className="rounded-[8px] bg-[#0A1628] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#faf7f2] transition hover:bg-[#253246]"
                  style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
                >
                  Start Guide
                </button>
              </div>
            ) : null}

            {sizeStep === 1 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                      Size Step 1 of 2
                    </div>
                    <h3 className="mt-2 text-[24px] leading-[1.08] text-[#0A1628] font-display-title">Choose your measuring method</h3>
                  </div>
                  <button
                    type="button"
                    onClick={restartSize}
                    className="rounded-[8px] border border-[rgba(10,22,40,0.12)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
                    style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
                  >
                    Reset
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SmallOption title="Existing Ring" hint="Measure the inside diameter in millimetres." onClick={() => { setSizeMethod('diameter'); setSizeValue(''); setSizeStep(2); }} />
                  <SmallOption title="String Method" hint="Measure the finger circumference in millimetres." onClick={() => { setSizeMethod('circumference'); setSizeValue(''); setSizeStep(2); }} />
                </div>
              </div>
            ) : null}

            {sizeStep === 2 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                      Size Step 2 of 2
                    </div>
                    <h3 className="mt-2 text-[24px] leading-[1.08] text-[#0A1628] font-display-title">
                      Enter your {sizeMethod === 'diameter' ? 'diameter' : 'circumference'}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSizeStep(1)}
                      className="rounded-[8px] border border-[rgba(10,22,40,0.12)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
                      style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={restartSize}
                      className="rounded-[8px] border border-[rgba(10,22,40,0.12)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6A6A6A] transition hover:border-[#0A1628] hover:text-[#0A1628]"
                      style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-[10px] border border-[rgba(10,22,40,0.10)] bg-[#faf7f2] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                      {sizeMethod === 'diameter' ? 'Existing Ring' : 'String Method'}
                    </div>
                    <p className="mt-2 text-[11px] leading-[1.7] text-[#6A6A6A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                      {sizeMethod === 'diameter'
                        ? 'Place the ring flat and measure the inner diameter in mm.'
                        : 'Wrap paper around the finger and measure the overlap length in mm.'}
                    </p>
                    <input
                      type="number"
                      min={sizeMethod === 'diameter' ? '12' : '40'}
                      max={sizeMethod === 'diameter' ? '26' : '82'}
                      step={sizeMethod === 'diameter' ? '0.1' : '0.5'}
                      value={sizeValue}
                      onChange={(event) => setSizeValue(event.target.value)}
                      placeholder={sizeMethod === 'diameter' ? 'e.g. 17.3 mm' : 'e.g. 54 mm'}
                      className="mt-3 w-full rounded-[8px] border border-[rgba(10,22,40,0.12)] bg-white px-3 py-3 text-[13px] text-[#0A1628] outline-none transition focus:border-[#B8972A]"
                      style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}
                    />
                    {sizeResult ? (
                      <div className="mt-4 rounded-[8px] border border-[rgba(184,151,42,0.22)] bg-white px-3 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8972A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                          Your Size
                        </div>
                        <div className="mt-1 text-[28px] leading-none text-[#0A1628] font-display-title">EU {sizeResult.eu}</div>
                        <div className="mt-2 text-[10px] leading-[1.7] uppercase tracking-[0.12em] text-[#6A6A6A]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                          US {sizeResult.us} · UK {sizeResult.uk}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="overflow-hidden rounded-[10px] border border-[rgba(10,22,40,0.10)] bg-white">
                    <div className="grid grid-cols-5 bg-[#0A1628] px-3 py-3">
                      {['EU', 'US', 'UK', 'D mm', 'C mm'].map((label) => (
                        <div key={label} className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]" style={{ fontFamily: 'Manrope, var(--font-geist-sans), sans-serif' }}>
                          {label}
                        </div>
                      ))}
                    </div>
                    {SIZE_ROWS.map((row) => {
                      const active = sizeResult?.eu === row.eu;
                      return (
                        <div key={row.eu} className={`grid grid-cols-5 px-3 py-2 border-t border-[rgba(10,22,40,0.06)] ${active ? 'bg-[#faf7f2]' : 'bg-white'}`}>
                          <div className="text-center text-[13px] text-[#0A1628] font-display-title">{row.eu}</div>
                          <div className="text-center text-[13px] text-[#0A1628] font-display-title">{row.us}</div>
                          <div className="text-center text-[13px] text-[#0A1628] font-display-title">{row.uk}</div>
                          <div className="text-center text-[13px] text-[#0A1628] font-display-title">{row.d}</div>
                          <div className="text-center text-[13px] text-[#0A1628] font-display-title">{row.c}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
