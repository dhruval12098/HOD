export type LoveLetterType = 'generate_for_me' | 'write_myself' | 'no_letter'

export type LoveLetterOccasionKey =
  | 'proposal'
  | 'anniversary'
  | 'birthday'
  | 'justbecause'
  | 'apology'
  | 'mother'
  | 'newchapter'

export type LoveLetterDraft = {
  sourceSlug?: string
  wantsLetter: boolean
  letterType: LoveLetterType
  recipientName?: string
  senderName?: string
  occasionKey?: LoveLetterOccasionKey | null
  aboutHerText?: string
  customLetterText?: string
  finalLetterText?: string
  finalLetterHtml?: string
}

export const LOVE_LETTER_STORAGE_KEY = 'hod-love-letter-checkout-draft'

const OCCASION_LABELS: Record<LoveLetterOccasionKey, string> = {
  proposal: 'A marriage proposal',
  anniversary: 'An anniversary',
  birthday: 'A birthday',
  justbecause: 'No occasion - just love',
  apology: 'A reconciliation',
  mother: 'A gift for her mother',
  newchapter: 'A new chapter',
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeSentence(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeAboutHer(value: string) {
  return normalizeSentence(value).replace(/^she is\s*/i, '').replace(/^you are\s*/i, '')
}

const GENERATED_TEMPLATES: Record<LoveLetterOccasionKey, (name: string, words: string) => string[]> = {
  proposal: (name, words) => [
    'There is a particular kind of courage it takes to choose someone. Not the courage of battles or storms, but the quieter, braver kind. The kind that says: it is you. It has always been you.',
    words
      ? `You are ${words}. I have held that truth close, and I hold it even more tightly today.`
      : 'You changed the shape of my ordinary days and made the future feel like somewhere I already belong.',
    'This ring is not simply a question. It is also an answer. My answer to every small certainty that kept leading me back to you.',
    `With everything that I am, ${name}, I am asking you to keep choosing us.`,
  ],
  anniversary: (name, words) => [
    'Another year has passed, and I still find new reasons to be grateful that life brought me to you.',
    words
      ? `You are ${words}. I knew it then, and I know it more fully with every year we share.`
      : 'You have turned ordinary days into something softer, steadier, and far more beautiful than I knew to ask for.',
    'This piece is not for the date on the calendar alone. It is for everything we have built in the quiet spaces between the milestones.',
    `Here is to what we have already lived, ${name}, and everything still waiting for us.`,
  ],
  birthday: (name, words) => [
    'Today belongs to you, and so does every joy this year has yet to bring.',
    words
      ? `You are ${words}. The world feels brighter because you are in it.`
      : 'There are people who make every room feel lighter without trying. You have always been one of them.',
    'This is a small keepsake for a life that deserves to be celebrated in every possible way.',
    `Happy birthday, ${name}. May this year return every bit of love you give so effortlessly.`,
  ],
  justbecause: (name, words) => [
    'There is no grand occasion today. No anniversary, no calendar reminder, no reason the world would point to.',
    words
      ? `Only this truth: you are ${words}.`
      : 'Only the ordinary and extraordinary fact that loving you is one of the easiest truths I know.',
    'Some things should be said even when there is no special moment demanding them.',
    `This is for you, ${name}. Just because you are you.`,
  ],
  apology: (name, words) => [
    'Words can arrive late, and mine have. But that does not make them any less true.',
    words
      ? `You are ${words}. You deserved to feel that from me more clearly and more often.`
      : 'You deserved more patience, more care, and more of the gentleness that love should naturally give.',
    'I cannot rewrite what has already happened, but I can offer honesty, intention, and a better version of how I show up from here.',
    `If you allow it, ${name}, I would like to begin again with more tenderness than before.`,
  ],
  mother: (name, words) => [
    'There is a kind of love that teaches us what safety feels like before we even know the word for it.',
    words
      ? `You are ${words}. So much of what is good in me began by being loved by you.`
      : 'Everything I know about care, steadiness, and devotion first took shape in your hands.',
    'This gift is small beside everything you have given, but it carries real gratitude.',
    `With love, always, ${name}. Thank you for being the first home I ever knew.`,
  ],
  newchapter: (name, words) => [
    'Some moments deserve to be marked not loudly, but beautifully.',
    words
      ? `You are ${words}. This next chapter fits you because you have earned every part of it.`
      : 'You have worked, hoped, and endured your way into this moment with more grace than most people ever see.',
    'Wear this as a reminder that you are someone who keeps becoming more fully herself.',
    `This chapter is yours, ${name}. Step into it knowing how deeply you are admired.`,
  ],
}

export function getLoveLetterOccasionLabel(value?: LoveLetterOccasionKey | null) {
  return value ? OCCASION_LABELS[value] : ''
}

export function buildLoveLetterPreview(draft: LoveLetterDraft) {
  if (!draft.wantsLetter || draft.letterType === 'no_letter') {
    return {
      text: '',
      html: '',
    }
  }

  const recipientName = normalizeSentence(draft.recipientName || 'Her')
  const senderName = normalizeSentence(draft.senderName || '')

  if (draft.letterType === 'write_myself') {
    const paragraphs = (draft.customLetterText || '')
      .split(/\n+/)
      .map((entry) => normalizeSentence(entry))
      .filter(Boolean)

    return {
      text: paragraphs.join('\n\n'),
      html: paragraphs.map((entry) => `<p>${escapeHtml(entry)}</p>`).join(''),
      recipientName,
      senderName,
    }
  }

  const occasion = draft.occasionKey || 'justbecause'
  const words = normalizeAboutHer(draft.aboutHerText || '')
  const paragraphs = GENERATED_TEMPLATES[occasion](recipientName, words)

  return {
    text: paragraphs.join('\n\n'),
    html: paragraphs.map((entry) => `<p>${escapeHtml(entry)}</p>`).join(''),
    recipientName,
    senderName,
  }
}

export function saveLoveLetterDraft(draft: LoveLetterDraft) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(LOVE_LETTER_STORAGE_KEY, JSON.stringify(draft))
}

export function readLoveLetterDraft(): LoveLetterDraft | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(LOVE_LETTER_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as LoveLetterDraft
  } catch {
    return null
  }
}

export function clearLoveLetterDraft() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(LOVE_LETTER_STORAGE_KEY)
}
