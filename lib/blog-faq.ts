import type { BlogPost } from '@/lib/data/blog-posts'

export type BlogFaqItem = {
  question: string
  answer: string
}

type ContentToken = {
  tag: string
  text: string
}

const FAQ_HEADING_PATTERN = /^(?:faqs?|frequently asked questions)(?:\s*[:—-].*)?$/i
const QUESTION_PREFIX_PATTERN = /^(?:q|question)\s*[:.)-]\s*/i

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const hexadecimal = code[1]?.toLowerCase() === 'x'
      const numericValue = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10)
      return Number.isFinite(numericValue) ? String.fromCodePoint(numericValue) : entity
    }
    return namedEntities[code.toLowerCase()] ?? entity
  })
}

function plainText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function getVisibleContentHtml(post: BlogPost) {
  const blocks = (post.contentBlocks ?? []).map((block) => {
    if (block.type === 'heading' && block.heading) return `<h2>${block.heading}</h2>`
    if ((block.type === 'text' || block.type === 'quote') && block.bodyHtml) return block.bodyHtml
    return ''
  })

  return [post.body, ...blocks].filter(Boolean).join('')
}

function tokenizeContent(html: string): ContentToken[] {
  return Array.from(html.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi))
    .map((match) => ({ tag: match[1].toLowerCase(), text: plainText(match[2]) }))
    .filter((token) => token.text.length > 0)
}

export function extractBlogFaqItems(post: BlogPost): BlogFaqItem[] {
  const tokens = tokenizeContent(getVisibleContentHtml(post))
  const items: BlogFaqItem[] = []
  let insideFaqSection = false
  let currentQuestion = ''
  let currentAnswer: string[] = []

  const commitCurrentItem = () => {
    const answer = currentAnswer.join(' ').replace(/\s+/g, ' ').trim()
    if (currentQuestion && answer) items.push({ question: currentQuestion, answer })
    currentQuestion = ''
    currentAnswer = []
  }

  for (const token of tokens) {
    if (FAQ_HEADING_PATTERN.test(token.text)) {
      commitCurrentItem()
      insideFaqSection = true
      continue
    }

    const prefixedQuestion = QUESTION_PREFIX_PATTERN.test(token.text)
    const headingQuestion = insideFaqSection && token.tag.startsWith('h') && token.text.endsWith('?')

    if (prefixedQuestion || headingQuestion) {
      commitCurrentItem()
      currentQuestion = token.text.replace(QUESTION_PREFIX_PATTERN, '').trim()
      insideFaqSection = true
      continue
    }

    if (!insideFaqSection) continue

    if (token.tag === 'h1' || token.tag === 'h2') {
      commitCurrentItem()
      break
    }

    if (currentQuestion) currentAnswer.push(token.text)
  }

  commitCurrentItem()
  return items
}
