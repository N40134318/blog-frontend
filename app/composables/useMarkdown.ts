// @ts-ignore
import MarkdownIt from 'markdown-it'
// @ts-ignore
import hljs from 'highlight.js'

const slugify = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
}

const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const normalizeLang = (lang: string) => {
  const value = (lang || '').trim().toLowerCase()
  return value || 'text'
}

const markdownOptions: any = {
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,

  highlight(str: string, lang: string) {
    const normalizedLang = normalizeLang(lang)
    const encodedRawCode = encodeURIComponent(str)

    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, {
          language: lang
        }).value

        return `
<div class="code-block" data-code="${encodedRawCode}">
  <div class="code-block-header">
    <button type="button" class="code-copy-btn">复制</button>
    <span class="code-block-lang">${escapeHtml(normalizedLang)}</span>
  </div>
  <pre><code class="hljs language-${escapeHtml(normalizedLang)}">${highlighted}</code></pre>
</div>
        `.trim()
      } catch (error) {
        // ignore and fall through
      }
    }

    return `
<div class="code-block" data-code="${encodedRawCode}">
  <div class="code-block-header">
    <button type="button" class="code-copy-btn">复制</button>
    <span class="code-block-lang">${escapeHtml(normalizedLang)}</span>
  </div>
  <pre><code class="hljs language-${escapeHtml(normalizedLang)}">${escapeHtml(str)}</code></pre>
</div>
    `.trim()
  }
}

const md = new MarkdownIt(markdownOptions)
const renderer = (md as any).renderer

const defaultHeadingOpen =
  renderer.rules.heading_open ||
  ((tokens: any[], idx: number, options: any, env: any, self: any) => {
    return self.renderToken(tokens, idx, options)
  })

renderer.rules.heading_open = (
  tokens: any[],
  idx: number,
  options: any,
  env: any,
  self: any
) => {
  const titleToken = tokens[idx + 1]
  const title = titleToken?.content || ''
  const slug = slugify(title)

  tokens[idx].attrSet('id', slug)

  return defaultHeadingOpen(tokens, idx, options, env, self)
}

export const renderMarkdown = (content: string) => {
  return md.render(content || '')
}

export type TocItem = {
  id: string
  text: string
  level: number
}

export const extractToc = (content: string): TocItem[] => {
  const lines = (content || '').split('\n')
  const toc: TocItem[] = []

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim())
    if (!match) continue

    const level = match[1]!.length
    const text = match[2]!.trim()

    toc.push({
      id: slugify(text),
      text,
      level
    })
  }

  return toc
}