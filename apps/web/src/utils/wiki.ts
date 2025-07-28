import { getEntry } from 'astro:content'
import { marked } from 'marked'

// Base URLs for different wiki content sources
const SOURCES = {
  R2: 'https://static.ttsg.dev/wiki', // Cloudflare R2 path (placeholder)
}

export interface WikiContent {
  title: string
  content: string
  html: string
  source: 'local' | 'r2' | 'not-found'
  slug: string
  metadata?: Record<string, unknown>
}

/**
 * Fetches wiki content from local collection or R2 storage
 */
export async function fetchWikiContent(slug: string): Promise<WikiContent> {
  // First try to get from local content
  try {
    const entry = await getEntry('wiki', slug)

    if (entry) {
      const content = entry.body
      const html = marked.parse(content)
      return {
        title: slug.replace(/-/g, ' '),
        content,
        html,
        source: 'local',
        slug,
      }
    }
  } catch (error) {
    console.error('Error fetching local wiki content:', error)
  }

  // If not found locally, try to fetch from R2
  try {
    const r2Path = `${SOURCES.R2}/${slug}.md`
    const response = await fetch(r2Path)

    if (response.ok) {
      const content = await response.text()
      const html = marked.parse(content)
      return {
        title: slug.replace(/-/g, ' '),
        content,
        html,
        source: 'r2',
        slug,
      }
    }
  } catch (error) {
    console.error('Error fetching wiki content from R2:', error)
  }

  // Return not found result
  return {
    title: 'Not Found',
    content: `Wiki content "${slug}" not found`,
    html: `<p>Wiki content "${slug}" not found</p>`,
    source: 'not-found',
    slug,
  }
}
