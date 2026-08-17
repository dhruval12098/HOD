import DOMPurify from 'isomorphic-dompurify'

const RICH_TEXT_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li',
  'blockquote', 'cite',
  'pre', 'code',
  'a', 'div', 'span',
]

const RICH_TEXT_ATTRIBUTES = ['href', 'title', 'target', 'rel']

const SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
]

const SVG_ATTRIBUTES = [
  'viewBox', 'width', 'height',
  'fill', 'fill-rule', 'clip-rule',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'd', 'points',
  'cx', 'cy', 'r', 'rx', 'ry',
  'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'transform', 'opacity',
]

export function sanitizeRichText(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: RICH_TEXT_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
}

export function sanitizeEmphasisTitle(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['em'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
}

export function sanitizeInlineSvg(svg: string) {
  return DOMPurify.sanitize(svg, {
    ALLOWED_TAGS: SVG_TAGS,
    ALLOWED_ATTR: SVG_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
}
