import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
})

export const renderMarkdown = (content: string) => {
  return md.render(content || '')
}