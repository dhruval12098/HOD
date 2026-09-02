import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = (process.env.PERFORMANCE_BASE_URL || '').replace(/\/$/, '')
const chunkRoot = path.join(process.cwd(), '.next', 'static', 'chunks')
const limits = {
  largestChunkBytes: 300 * 1024,
  homeDocumentBytes: 250 * 1024,
  categoryDocumentBytes: 700 * 1024,
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(target) : [target]
  }))).flat()
}

async function responseSize(route) {
  const response = await fetch(`${baseUrl}${route}`, { headers: { accept: 'text/html' } })
  if (!response.ok) throw new Error(`${route} returned ${response.status}`)
  return Buffer.byteLength(await response.text())
}

const chunkFiles = (await filesUnder(chunkRoot)).filter((file) => file.endsWith('.js'))
const chunkSizes = await Promise.all(chunkFiles.map(async (file) => ({ file, bytes: (await stat(file)).size })))
const largestChunk = chunkSizes.sort((left, right) => right.bytes - left.bytes)[0]
const failures = []

if (largestChunk.bytes > limits.largestChunkBytes) {
  failures.push(`Largest JS chunk is ${largestChunk.bytes} bytes (limit ${limits.largestChunkBytes}): ${path.basename(largestChunk.file)}`)
}

console.log(`Largest JS chunk: ${largestChunk.bytes} bytes (${path.basename(largestChunk.file)})`)

if (baseUrl) {
  const homeBytes = await responseSize('/')
  const categoryPath = process.env.PERFORMANCE_CATEGORY_PATH || '/engagement-rings'
  const categoryBytes = await responseSize(categoryPath)
  console.log(`Home document: ${homeBytes} bytes`)
  console.log(`Category document: ${categoryBytes} bytes (${categoryPath})`)
  if (homeBytes > limits.homeDocumentBytes) failures.push(`Home document exceeds ${limits.homeDocumentBytes} bytes`)
  if (categoryBytes > limits.categoryDocumentBytes) failures.push(`Category document exceeds ${limits.categoryDocumentBytes} bytes`)
} else {
  console.log('Set PERFORMANCE_BASE_URL to include live document-size checks.')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
