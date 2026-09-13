import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import katex from 'katex'

hljs.registerLanguage('python', python)

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang === 'python') {
      return hljs.highlight(code, { language: 'python' }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// 缓存
const notebookCache = new Map()
const prefetchQueue = new Set()

// 渲染数学公式
function renderMath(text) {
  // 行内公式 $...$
  text = text.replace(/\$([^$\n]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { throwOnError: false, displayMode: false })
    } catch {
      return match
    }
  })
  
  // 块级公式 $$...$$
  text = text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return '<div class="katex-display">' + katex.renderToString(formula.trim(), { throwOnError: false, displayMode: true }) + '</div>'
    } catch {
      return match
    }
  })
  
  return text
}

// 渲染 Markdown
export function renderMarkdown(text) {
  // 先处理数学公式
  text = renderMath(text)
  // 再渲染 Markdown
  return marked.parse(text)
}

// 加载 Notebook
export async function loadNotebook(path) {
  if (notebookCache.has(path)) {
    return notebookCache.get(path)
  }
  
  try {
    const response = await fetch(`/notebooks/${path}`)
    if (!response.ok) throw new Error('Failed to load notebook')
    
    const data = await response.json()
    const processed = processNotebook(data)
    notebookCache.set(path, processed)
    return processed
  } catch (error) {
    console.error('Error loading notebook:', error)
    throw error
  }
}

// 预取 Notebook
export function prefetchNotebook(path) {
  if (notebookCache.has(path) || prefetchQueue.has(path)) return
  prefetchQueue.add(path)
  loadNotebook(path).finally(() => prefetchQueue.delete(path))
}

// 处理 Notebook 数据
function processNotebook(notebook) {
  const cells = notebook.cells || []
  const headings = []
  let headingIndex = 0
  
  const processedCells = cells.map((cell, index) => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '')
    
    if (cell.cell_type === 'markdown') {
      // 提取标题用于大纲
      const headingMatch = source.match(/^(#{1,4})\s+(.+)$/m)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()
        const id = `heading-${headingIndex++}`
        headings.push({ level, text, id, cellIndex: index })
      }
      
      return {
        type: 'markdown',
        content: renderMarkdown(source),
        rawSource: source,
        id: `cell-${index}`
      }
    } else if (cell.cell_type === 'code') {
      const outputs = (cell.outputs || []).map(output => {
        if (output.output_type === 'stream') {
          return {
            type: 'stream',
            text: Array.isArray(output.text) ? output.text.join('') : output.text
          }
        } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
          const data = output.data || {}
          if (data['image/png']) {
            return {
              type: 'image',
              src: `data:image/png;base64,${data['image/png']}`
            }
          } else if (data['text/plain']) {
            return {
              type: 'text',
              text: Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain']
            }
          }
        } else if (output.output_type === 'error') {
          return {
            type: 'error',
            traceback: output.traceback || []
          }
        }
        return null
      }).filter(Boolean)
      
      return {
        type: 'code',
        source: source,
        highlighted: hljs.highlight(source, { language: 'python' }).value,
        outputs,
        execution_count: cell.execution_count,
        id: `cell-${index}`
      }
    }
    
    return null
  }).filter(Boolean)
  
  return {
    cells: processedCells,
    headings,
    metadata: notebook.metadata || {}
  }
}

// 提取 Notebook 标题
export function extractTitle(notebook) {
  if (!notebook?.cells) return 'Untitled'
  
  for (const cell of notebook.cells) {
    if (cell.cell_type === 'markdown') {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
      const titleMatch = source.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        return titleMatch[1].trim()
      }
    }
  }
  
  return 'Untitled'
}
