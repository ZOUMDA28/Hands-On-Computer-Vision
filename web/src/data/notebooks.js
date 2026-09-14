<<<<<<< HEAD
import katex from 'katex'
import { NOTEBOOK_CATALOG } from 'virtual:notebook-catalog'

const notebookModules = import.meta.glob('../../../notebooks/**/*.ipynb', {
=======
import { NOTEBOOK_CATALOG } from 'virtual:notebook-catalog'

// Lazy load notebook content (loaded on demand)
const notebookLoaders = import.meta.glob('../../../notebooks/**/*.ipynb', {
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
  query: '?raw',
  import: 'default',
})

<<<<<<< HEAD
const PARTS = [
  ['part1-image-processing', '图像处理基础'],
  ['part2-optimization-3d', '最优化与立体视觉'],
]

const CHAPTER_ORDER = {
  '数字图像的获取和表示': 1,
  '颜色空间的转换': 2,
  '基于直方图统计的处理': 3,
  '图像滤波': 4,
  '特征提取': 5,
  '几何变换': 6,
  '图像拼接模型': 7,
  '相机参数标定': 8,
  '立体视觉点云重建': 9,
}

function getChapterOrder(dir) {
  return CHAPTER_ORDER[dir] ?? 999
}

function isExtraNotebook(id) {
  return /_extra$/.test(id)
}

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
  'raise', 'return', 'try', 'while', 'with', 'yield',
])

const PYTHON_BUILTINS = new Set([
  'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'float', 'int', 'len', 'list',
  'map', 'max', 'min', 'print', 'range', 'reversed', 'round', 'set', 'sorted', 'str',
  'sum', 'tuple', 'type', 'zip',
])

const CODE_PREVIEW_LINES = 28

const UI_TEXT = {
  emptyCode: '空代码块',
  code: '代码',
  line: '行',
  expandOutput: '展开全部输出',
  collapseOutput: '收起输出',
  expandCode: '展开全部',
  collapseCode: '收起代码',
}

function titleFromId(id) {
  return id
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildNotebookEntries(modules, rootDir) {
  return Object.entries(modules)
  .map(([path, load]) => {
    const match = path.match(new RegExp(`${rootDir}/([^/]+)/(.+?)\\.ipynb$`))
    if (!match) return null
    const [, partDir, idPath] = match
    const id = idPath.replace(/\//g, '-')
    const dir = idPath.includes('/') ? idPath.replace(/\/[^/]+$/, '') : ''
    return {
      id,
      partDir,
      dir,
      load,
      order: PARTS.findIndex(([d]) => d === partDir),
      chapterOrder: getChapterOrder(dir),
      title: NOTEBOOK_CATALOG.zh?.[id]?.title || titleFromId(id),
    }
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    const chapterA = getChapterOrder(a.dir)
    const chapterB = getChapterOrder(b.dir)
    if (chapterA !== chapterB) return chapterA - chapterB
    const extraA = isExtraNotebook(a.id) ? 1 : 0
    const extraB = isExtraNotebook(b.id) ? 1 : 0
    return extraA - extraB
  })
}

const NOTEBOOKS = buildNotebookEntries(notebookModules, 'notebooks')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify(text, fallback) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || fallback
}

function inlineMarkdown(text, imageBase = '') {
  const mathSegments = []
  const protectMath = (match) => {
    const token = `@@MATH_${mathSegments.length}@@`
    mathSegments.push(match)
    return token
  }

  let protectedText = String(text)
    .replace(/\$\$[\s\S]+?\$\$/g, protectMath)
    .replace(/\\\[[\s\S]+?\\\]/g, protectMath)
    .replace(/\\\(.+?\\\)/g, protectMath)
    .replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (match, prefix, body) => {
      return `${prefix}${protectMath(`$${body}$`)}`
    })

  let html = escapeHtml(protectedText)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) {
        return `<img src="${src}" alt="${alt}" loading="lazy" />`
      }
      return `<img src="${imageBase}${src}" alt="${alt}" loading="lazy" />`
    }
  )
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Render math segments with KaTeX
  mathSegments.forEach((segment, index) => {
    const isDisplay = segment.startsWith('$$') || segment.startsWith('\\[')
    const formula = segment
      .replace(/^\$\$|\$\$$/g, '')
      .replace(/^\\\[|\\\]$/g, '')
      .replace(/^\\\(|\\\)$/g, '')
      .replace(/^\$|\$$/g, '')
    try {
      const rendered = katex.renderToString(formula, {
        displayMode: isDisplay,
        throwOnError: false,
        strict: false,
      })
      html = html.replace(`@@MATH_${index}@@`, rendered)
    } catch {
      html = html.replace(`@@MATH_${index}@@`, escapeHtml(segment))
    }
  })

  return html
}

function renderTable(lines, imageBase = '') {
  const rows = lines.map(line => (
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map(cell => inlineMarkdown(cell.trim(), imageBase))
  ))
  if (rows.length < 2) return null

  const alignRow = rows[1].every(cell => /^:?-{3,}:?$/.test(cell))
  if (!alignRow) return null

  const head = rows[0].map(cell => `<th>${cell}</th>`).join('')
  const body = rows.slice(2).map(row => (
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  )).join('')
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function flushParagraph(blocks, paragraph, imageBase = '') {
  if (paragraph.length === 0) return
  blocks.push(`<p>${inlineMarkdown(paragraph.join(' '), imageBase)}</p>`)
  paragraph.length = 0
}

// 渲染引用内的一个段落：普通行合并成 <p>，连续的有序/无序列表行渲染成 <ol>/<ul>
function renderQuoteGroup(group, inline) {
  const parts = []
  let text = []
  let listItems = null
  let listOrdered = false

  const flushText = () => {
    if (text.length > 0) {
      parts.push(`<p>${inline(text.join(' '))}</p>`)
      text = []
    }
  }
  const flushList = () => {
    if (listItems && listItems.length > 0) {
      const tag = listOrdered ? 'ol' : 'ul'
      parts.push(`<${tag}>${listItems.map(item => `<li>${inline(item)}</li>`).join('')}</${tag}>`)
    }
    listItems = null
  }

  for (const line of group) {
    const m = line.trim().match(/^([-*+]|\d+\.)\s+(.+)$/)
    if (m) {
      flushText()
      const ordered = /\d+\./.test(m[1])
      if (listItems === null || ordered !== listOrdered) {
        flushList()
        listItems = []
        listOrdered = ordered
      }
      listItems.push(m[2])
    } else {
      flushList()
      text.push(line)
    }
  }
  flushText()
  flushList()
  return parts.join('')
}

function renderMarkdown(source, imageBase = '') {
  const lines = source.split(/\r?\n/)
  const blocks = []
  const paragraph = []
  const headingCounts = new Map()
  const inline = (text) => inlineMarkdown(text, imageBase)

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph(blocks, paragraph, imageBase)
      continue
    }

    if (trimmed.startsWith('$$')) {
      flushParagraph(blocks, paragraph, imageBase)
      const mathLines = [line]
      if (!trimmed.endsWith('$$') || trimmed === '$$') {
        i += 1
        while (i < lines.length) {
          mathLines.push(lines[i])
          if (lines[i].trim().endsWith('$$')) break
          i += 1
        }
      }
      const formula = mathLines.join('\n').replace(/^\$\$|\$\$$/g, '')
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
        })
        blocks.push(`<div class="math-display">${rendered}</div>`)
      } catch {
        blocks.push(`<div class="math-display">${escapeHtml(mathLines.join('\n'))}</div>`)
      }
      continue
    }

    if (trimmed.startsWith('```')) {
      flushParagraph(blocks, paragraph, imageBase)
      const code = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    const tableLines = []
    let j = i
    while (j < lines.length && lines[j].includes('|')) {
      tableLines.push(lines[j])
      j += 1
    }
    if (tableLines.length >= 2) {
      const table = renderTable(tableLines, imageBase)
      if (table) {
        flushParagraph(blocks, paragraph, imageBase)
        blocks.push(table)
        i = j - 1
        continue
      }
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph(blocks, paragraph, imageBase)
      const level = heading[1].length
      const text = heading[2].replace(/\s+#+$/, '')
      const base = slugify(text, `heading-${i}`)
      const count = headingCounts.get(base) || 0
      headingCounts.set(base, count + 1)
      const id = count === 0 ? base : `${base}-${count}`
      blocks.push(`<h${level} id="${id}">${inline(text)}</h${level}>`)
      continue
    }

    const quote = trimmed.match(/^>\s?(.*)$/)
    if (quote) {
      flushParagraph(blocks, paragraph, imageBase)
      const quoteLines = [quote[1]]
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        i += 1
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
      }
      const quoteParagraphs = [[]]
      for (const quoteLine of quoteLines) {
        if (quoteLine.trim() === '') quoteParagraphs.push([])
        else quoteParagraphs[quoteParagraphs.length - 1].push(quoteLine)
      }
      blocks.push(
        `<blockquote>${quoteParagraphs
          .filter((group) => group.length > 0)
          .map((group) => renderQuoteGroup(group, inline))
          .join('')}</blockquote>`
      )
      continue
    }

    const list = trimmed.match(/^([-*+]|\d+\.)\s+(.+)$/)
    if (list) {
      flushParagraph(blocks, paragraph, imageBase)
      const ordered = /\d+\./.test(list[1])
      const tag = ordered ? 'ol' : 'ul'
      const items = [list[2]]
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim().match(/^([-*+]|\d+\.)\s+(.+)$/)
        if (!next) break
        i += 1
        items.push(next[2])
      }
      blocks.push(`<${tag}>${items.map(item => `<li>${inline(item)}</li>`).join('')}</${tag}>`)
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph(blocks, paragraph, imageBase)
  return `<div class="text_cell"><div class="inner_cell"><div class="text_cell_render rendered_html">${blocks.join('\n')}</div></div></div>`
}

function normalizeSource(source) {
  return Array.isArray(source) ? source.join('') : source || ''
}

function filterDisplayWarnings(text) {
  const lines = String(text).split(/\r?\n/)
  const visible = []
  let skipNextSourceLine = false

  for (const line of lines) {
    const isMatplotlibGlyphWarning =
      line.includes('UserWarning: Glyph') &&
      line.includes('missing from font(s)')

    if (isMatplotlibGlyphWarning) {
      skipNextSourceLine = true
      continue
    }

    if (skipNextSourceLine && /^\s+/.test(line)) {
      skipNextSourceLine = false
      continue
    }

    skipNextSourceLine = false
    visible.push(line)
  }

  return visible.join('\n')
}

function extractPythonSymbols(source) {
  const classes = new Set()
  const functions = new Set()
  const aliases = new Set()
  const lines = source.split(/\r?\n/)

  for (const line of lines) {
    const classMatch = line.match(/^\s*class\s+([A-Za-z_]\w*)/)
    if (classMatch) classes.add(classMatch[1])

    const functionMatch = line.match(/^\s*def\s+([A-Za-z_]\w*)/)
    if (functionMatch) functions.add(functionMatch[1])

    const importMatch = line.match(/^\s*import\s+(.+)$/)
    if (importMatch) {
      for (const item of importMatch[1].split(',')) {
        const alias = item.trim().match(/(?:as\s+)?([A-Za-z_]\w*)$/)
        if (alias) aliases.add(alias[1])
      }
    }

    const fromImportMatch = line.match(/^\s*from\s+\S+\s+import\s+(.+)$/)
    if (fromImportMatch) {
      for (const item of fromImportMatch[1].split(',')) {
        const alias = item.trim().match(/(?:as\s+)?([A-Za-z_]\w*)$/)
        if (alias) aliases.add(alias[1])
      }
    }
  }

  return { classes, functions, aliases }
}

function collectNotebookSymbols(nb) {
  const classes = new Set()
  const functions = new Set()
  const aliases = new Set()

  for (const cell of nb.cells) {
    if (cell.cell_type !== 'code') continue
    const symbols = extractPythonSymbols(normalizeSource(cell.source))
    symbols.classes.forEach(name => classes.add(name))
    symbols.functions.forEach(name => functions.add(name))
    symbols.aliases.forEach(name => aliases.add(name))
  }

  return { classes, functions, aliases }
}

function span(className, text) {
  return `<span class="${className}">${escapeHtml(text)}</span>`
}

function readPythonString(source, start) {
  const prefixMatch = source.slice(start).match(/^([rRuUbBfF]{0,3})(['"]{1,3})/)
  if (!prefixMatch) return null

  const prefix = prefixMatch[1]
  const quote = prefixMatch[2]
  const triple = quote.length === 3
  let i = start + prefix.length + quote.length

  while (i < source.length) {
    if (source.startsWith(quote, i)) {
      i += quote.length
      break
    }
    if (!triple && source[i] === '\n') break
    if (source[i] === '\\') {
      i += 2
    } else {
      i += 1
    }
  }

  return source.slice(start, i)
}

function highlightPython(source, symbols) {
  let html = ''
  let i = 0
  let expectingDefinitionName = null

  while (i < source.length) {
    const rest = source.slice(i)
    const char = source[i]

    const stringToken = readPythonString(source, i)
    if (stringToken) {
      html += span(stringToken.startsWith('"""') || stringToken.startsWith("'''") ? 'sd' : 's', stringToken)
      i += stringToken.length
      continue
    }

    if (char === '#') {
      const end = source.indexOf('\n', i)
      const comment = end === -1 ? source.slice(i) : source.slice(i, end)
      html += span('c1', comment)
      i += comment.length
      continue
    }

    const number = rest.match(/^(?:0[xX][\da-fA-F]+|\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)
    if (number) {
      html += span('mi', number[0])
      i += number[0].length
      continue
    }

    const identifier = rest.match(/^[A-Za-z_]\w*/)
    if (identifier) {
      const name = identifier[0]
      const after = source.slice(i + name.length)
      const nextNonSpace = after.match(/^\s*([(.=,:])/)

      if (expectingDefinitionName === 'class') {
        html += span('nc user-class', name)
        symbols.classes.add(name)
        expectingDefinitionName = null
      } else if (expectingDefinitionName === 'def') {
        html += span('nf user-function', name)
        symbols.functions.add(name)
        expectingDefinitionName = null
      } else if (PYTHON_KEYWORDS.has(name)) {
        html += span(name === 'True' || name === 'False' || name === 'None' ? 'kc' : 'k', name)
        expectingDefinitionName = name === 'class' || name === 'def' ? name : null
      } else if (PYTHON_BUILTINS.has(name)) {
        html += span('nb', name)
      } else if (symbols.classes.has(name)) {
        html += span('nc user-class', name)
      } else if (symbols.functions.has(name) || nextNonSpace?.[1] === '(') {
        html += span('nf user-function', name)
      } else if (symbols.aliases.has(name)) {
        html += span('nn user-alias', name)
      } else {
        html += span('nv', name)
      }
      i += name.length
      continue
    }

    if (/^[+\-*/%=<>!&|^~:.,;()[\]{}]/.test(char)) {
      html += span(/[()[\]{},.:;]/.test(char) ? 'p' : 'o', char)
      i += 1
      continue
    }

    html += escapeHtml(char)
    i += 1
  }

  return html
}

function renderOutput(output) {
  if (output.output_type === 'stream') {
    const text = filterDisplayWarnings(normalizeSource(output.text))
    return text ? `<div class="output_area"><pre>${escapeHtml(text)}</pre></div>` : ''
  }

  if (output.output_type === 'error') {
    const traceback = output.traceback || [`${output.ename}: ${output.evalue}`]
    return `<div class="output_area"><pre class="error">${escapeHtml(traceback.join('\n'))}</pre></div>`
  }

  const data = output.data || {}
  if (data['image/png']) {
    return `<div class="output_area"><img src="data:image/png;base64,${data['image/png']}" alt="notebook output" /></div>`
  }

  const html = normalizeSource(data['text/html'])
  if (html) {
    return `<div class="output_area">${html}</div>`
  }

  const text = filterDisplayWarnings(normalizeSource(data['text/plain']))
  if (text) {
    return `<div class="output_area"><pre>${escapeHtml(text)}</pre></div>`
  }

  return ''
}

function countOutputLines(output) {
  if (output.output_type === 'stream') {
    const text = filterDisplayWarnings(normalizeSource(output.text)).trimEnd()
    return text ? text.split(/\r?\n/).length : 0
  }

  if (output.output_type === 'error') {
    const traceback = output.traceback || [`${output.ename}: ${output.evalue}`]
    return traceback.join('\n').trimEnd().split(/\r?\n/).length
  }

  const data = output.data || {}
  const text = filterDisplayWarnings(normalizeSource(data['text/plain'])).trimEnd()
  return text ? text.split(/\r?\n/).length : 0
}

function renderCodeCell(cell, symbols, index) {
  const t = UI_TEXT
  const source = normalizeSource(cell.source)
  const outputs = cell.outputs || []
  const outputHtml = outputs.map(renderOutput).join('')
  const outputLineCount = outputs.reduce((total, output) => total + countOutputLines(output), 0)
  const outputShouldPreview = outputLineCount > CODE_PREVIEW_LINES
  const outputLineLabel = outputLineCount > 0 ? `${outputLineCount} ${t.line}` : ''
  const outputToggleId = `output-expand-${index}`
  const outputBlock = outputHtml
    ? [
        '<div class="output_wrapper">',
        `<div class="output${outputShouldPreview ? ' output-expandable output-preview' : ''}">`,
        outputShouldPreview
          ? `<input class="output-expand-toggle" id="${outputToggleId}" type="checkbox" />`
          : '',
        outputHtml,
        outputShouldPreview
          ? [
              '<div class="output-expand-label">',
              `<span class="output-expand-more">${t.expandOutput} ${outputLineLabel}</span>`,
              `<span class="output-expand-less">${t.collapseOutput}</span>`,
              '</div>',
            ].join('')
          : '',
        '</div>',
        '</div>',
      ].join('')
    : ''
  const lineCount = source ? source.split(/\r?\n/).length : 0
  const lineLabel = lineCount > 0 ? `${lineCount} ${t.line}` : t.emptyCode
  const shouldPreview = lineCount > CODE_PREVIEW_LINES
  const toggleId = `code-expand-${index}`

  const blocks = [
    `<div class="code_cell${shouldPreview ? ' code_cell-expandable' : ''}">`,
    `<div class="input${shouldPreview ? ' code-input-expandable' : ''}">`,
    '<div class="code-header">',
    `<span class="code-fold-title">${t.code}</span>`,
    '<div class="code-header-actions">',
    `<span class="code-fold-meta">${lineLabel}</span>`,
    '<button class="code-copy-button" type="button" aria-label="Copy code" title="Copy code">',
    '<span class="code-copy-icon code-copy-icon-copy" aria-hidden="true">',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>',
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    '</svg>',
    '</span>',
    '<span class="code-copy-icon code-copy-icon-check" aria-hidden="true">',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M20 6 9 17l-5-5"></path>',
    '</svg>',
    '</span>',
    '<span class="code-copy-text">Copy</span>',
    '</button>',
    '</div>',
    '</div>',
  ]

  if (shouldPreview) {
    blocks.push(`<input class="code-expand-toggle" id="${toggleId}" type="checkbox" />`)
  }

  blocks.push(
    `<div class="input_area${shouldPreview ? ' code-preview' : ''}">`,
    `<div class="highlight"><pre>${highlightPython(source, symbols)}</pre></div>`,
    '</div>',
  )

  if (shouldPreview) {
    blocks.push(
      '<div class="code-expand-label">',
      `<span class="code-expand-more">${t.expandCode} ${lineLabel}</span>`,
      `<span class="code-expand-less">${t.collapseCode}</span>`,
      '</div>'
    )
  }

  blocks.push(
    '</div>',
    outputBlock,
    '</div>',
  )

  return blocks.join('')
}

function renderNotebook(nb, entry) {
  const symbols = collectNotebookSymbols(nb)
  const imageBase = `${import.meta.env.BASE_URL}notebooks/${entry.partDir}/${entry.dir ? entry.dir + '/' : ''}`
  return nb.cells
    .map((cell, index) => {
      if (cell.cell_type === 'markdown') return renderMarkdown(normalizeSource(cell.source), imageBase)
      if (cell.cell_type === 'code') return renderCodeCell(cell, symbols, index)
      return ''
    })
    .join('\n')
}

function parseNotebook(entry, raw) {
  const nb = JSON.parse(raw)
  const part = PARTS.find(([dir]) => dir === entry.partDir)?.[1] || entry.partDir
  return {
    id: entry.id,
    title: entry.title,
    part,
    partDir: entry.partDir,
    html: renderNotebook(nb, entry),
  }
}

export function getCatalog() {
  return NOTEBOOKS.map((entry) => {
    const part = PARTS.find(([dir]) => dir === entry.partDir)?.[1] || entry.partDir
    return {
      id: entry.id,
      title: entry.title,
      part,
      partDir: entry.partDir,
      chapterOrder: entry.chapterOrder,
    }
  })
}

// 已解析 notebook 的内存缓存:切换已访问过的 notebook 时跳过 spinner
const notebookCache = new Map()

// 同步读缓存。命中时调用方可以立刻 setNotebook,完全避免 loading 态
export function getCachedNotebook(id) {
  return notebookCache.get(id) || null
}

export async function getNotebook(id) {
  const cached = notebookCache.get(id)
  if (cached) return cached

  const entry = NOTEBOOKS.find(item => item.id === id)
  if (!entry) {
    throw new Error(`Notebook not found: ${id}`)
  }
  const raw = await entry.load()
  const parsed = parseNotebook(entry, raw)
  notebookCache.set(id, parsed)
  return parsed
}

// 后台预取:浏览器空闲时把 notebook 解析结果填进缓存,后续点击秒开
export function prefetchNotebook(id) {
  if (notebookCache.has(id)) return
  const entry = NOTEBOOKS.find(item => item.id === id)
  if (!entry) return
  entry.load()
    .then((raw) => {
      if (!notebookCache.has(id)) {
        notebookCache.set(id, parseNotebook(entry, raw))
      }
    })
    .catch(() => {})
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload()
  })
=======
// Parts metadata
export const PARTS = {
  'part1-image-processing': {
    title: '第一部分：图像处理基础',
    subtitle: '从像素到特征',
    icon: 'Image',
  },
  'part2-optimization-3d': {
    title: '第二部分：最优化算法与立体视觉重建',
    subtitle: '从优化到三维',
    icon: 'Box',
  },
  'appendix': {
    title: '附录：额外学习主题',
    subtitle: '路线之外的拓展知识',
    icon: 'BookMarked',
  },
}

// Chapter order mapping (continuous numbering, not reset per part)
const CHAPTER_ORDER = {
  '01-digital-image-acquisition': 1,
  '02-color-space-conversion': 2,
  '03-histogram-processing': 3,
  '04-image-filtering': 4,
  '05-feature-extraction': 5,
  '06-geometric-transformation': 6,
  '07-image-stitching': 7,
  '08-camera-calibration': 8,
  '09-stereo-reconstruction': 9,
  'A1-convolution-basics': 10,
  'A2-additional-topics': 11,
}

// Build NOTEBOOKS array from catalog
const NOTEBOOKS = NOTEBOOK_CATALOG.map((entry) => {
  const modulePath = `/notebooks/${entry.path}`
  const idPath = entry.partDir
    ? `${entry.partDir}-${entry.filename.replace('.ipynb', '')}`
    : entry.filename.replace('.ipynb', '')

  const dirName = entry.partDir || ''
  const chapterOrder = CHAPTER_ORDER[dirName] || 999

  return {
    id: idPath,
    title: entry.title,
    part: entry.part,
    partDir: entry.partDir,
    filename: entry.filename,
    loader: notebookLoaders[modulePath] || null,
    chapterOrder,
    imageBase: `./notebooks/${entry.path.replace(/\/[^/]+\.ipynb$/, '')}/`,
  }
})

// Sort by part order, then chapter order, then practice before practice_extra
const PART_ORDER = ['part1-image-processing', 'part2-optimization-3d', 'appendix']
NOTEBOOKS.sort((a, b) => {
  const partDiff = PART_ORDER.indexOf(a.part) - PART_ORDER.indexOf(b.part)
  if (partDiff !== 0) return partDiff
  if (a.chapterOrder !== b.chapterOrder) return a.chapterOrder - b.chapterOrder
  // practice.ipynb before practice_extra.ipynb
  const aExtra = a.filename.includes('extra') ? 1 : 0
  const bExtra = b.filename.includes('extra') ? 1 : 0
  return aExtra - bExtra
})

// Cache for parsed notebooks
const parseCache = new Map()

// Parse notebook JSON
export function parseNotebook(rawContent) {
  if (parseCache.has(rawContent)) return parseCache.get(rawContent)
  try {
    const nb = JSON.parse(rawContent)
    const cells = (nb.cells || []).map((cell) => {
      const source = Array.isArray(cell.source)
        ? cell.source.join('')
        : cell.source || ''
      return {
        cellType: cell.cell_type,
        source,
        outputs: cell.outputs || [],
        executionCount: cell.execution_count,
      }
    })
    parseCache.set(rawContent, { cells, metadata: nb.metadata || {} })
    return { cells, metadata: nb.metadata || {} }
  } catch (e) {
    console.error('Failed to parse notebook:', e)
    return { cells: [], metadata: {} }
  }
}

// Cache for loaded raw content
const contentCache = new Map()

// Get all notebooks
export function getNotebooks() {
  return NOTEBOOKS
}

// Get catalog (lightweight info for sidebar)
export function getCatalog() {
  return NOTEBOOKS.map((entry) => ({
    id: entry.id,
    title: entry.title,
    part: entry.part,
    partDir: entry.partDir,
    chapterOrder: entry.chapterOrder,
    filename: entry.filename,
  }))
}

// Get notebook metadata by ID (without content)
export function getNotebook(id) {
  return NOTEBOOKS.find((nb) => nb.id === id)
}

// Async load notebook content
export async function loadNotebookContent(id) {
  if (contentCache.has(id)) return contentCache.get(id)
  const nb = NOTEBOOKS.find((n) => n.id === id)
  if (!nb || !nb.loader) return null
  const rawContent = await nb.loader()
  contentCache.set(id, rawContent)
  return rawContent
}

// Get first notebook
export function getFirstNotebook() {
  return NOTEBOOKS[0] || null
}

// Extract headings from notebook for outline
export function getOutline(cells) {
  const headings = []
  for (const cell of cells) {
    if (cell.cellType !== 'markdown') continue
    const lines = cell.source.split('\n')
    for (const line of lines) {
      const match = line.match(/^(#{1,4})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim().replace(/[`*]/g, '')
        const id = text
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fff]+/g, '-')
          .replace(/^-|-$/g, '')
        headings.push({ level, text, id })
      }
    }
  }
  return headings
}

// Simple Python syntax highlighter
function highlightPython(code) {
  const keywords = new Set([
    'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except',
    'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda',
    'global', 'nonlocal', 'pass', 'break', 'continue', 'raise', 'assert',
    'del', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False',
    'async', 'await', 'self', 'cls'
  ])
  const builtins = new Set([
    'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted',
    'reversed', 'sum', 'min', 'max', 'abs', 'round', 'isinstance', 'type',
    'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'bool',
    'open', 'format', 'super', 'property', 'staticmethod', 'classmethod',
    'getattr', 'setattr', 'hasattr', 'input'
  ])

  // Tokenize while preserving positions
  const tokens = []
  let i = 0
  const n = code.length

  while (i < n) {
    const c = code[i]

    // Comment
    if (c === '#') {
      let end = code.indexOf('\n', i)
      if (end === -1) end = n
      tokens.push({ type: 'comment', text: code.slice(i, end) })
      i = end
      continue
    }

    // String (triple quotes)
    if (c === '"' || c === "'") {
      const quote = c
      if (code[i + 1] === quote && code[i + 2] === quote) {
        let end = code.indexOf(quote + quote + quote, i + 3)
        if (end === -1) end = n
        else end += 3
        tokens.push({ type: 'string', text: code.slice(i, end) })
        i = end
        continue
      }
      // Single line string
      let end = i + 1
      while (end < n && code[end] !== quote && code[end] !== '\n') {
        if (code[end] === '\\') end++
        end++
      }
      if (end < n && code[end] === quote) end++
      tokens.push({ type: 'string', text: code.slice(i, end) })
      i = end
      continue
    }

    // Decorator
    if (c === '@' && (i === 0 || code[i - 1] === '\n' || code[i - 1] === ' ')) {
      let end = i + 1
      while (end < n && /[\w.]/.test(code[end])) end++
      tokens.push({ type: 'decorator', text: code.slice(i, end) })
      i = end
      continue
    }

    // Number
    if (/\d/.test(c) || (c === '.' && /\d/.test(code[i + 1] || ''))) {
      let end = i + 1
      while (end < n && /[\d.eExXa-fA-F_]/.test(code[end])) end++
      tokens.push({ type: 'number', text: code.slice(i, end) })
      i = end
      continue
    }

    // Identifier/keyword
    if (/[a-zA-Z_]/.test(c)) {
      let end = i + 1
      while (end < n && /[\w]/.test(code[end])) end++
      const word = code.slice(i, end)
      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', text: word })
      } else if (builtins.has(word)) {
        tokens.push({ type: 'builtin', text: word })
      } else {
        tokens.push({ type: 'plain', text: word })
      }
      i = end
      continue
    }

    // Operator or other
    tokens.push({ type: 'plain', text: c })
    i++
  }

  // Build HTML
  return tokens
    .map((t) => {
      if (t.type === 'plain') return escapeHtml(t.text)
      return `<span class="tk-${t.type}">${escapeHtml(t.text)}</span>`
    })
    .join('')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Render markdown to HTML (simplified but functional)
export function renderMarkdown(source, imageBase) {
  let html = source

  // Image path rewriting
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  html = html.replace(imgRegex, (match, alt, path) => {
    if (path.startsWith('http') || path.startsWith('data:')) {
      return `<img src="${path}" alt="${alt}" />`
    }
    return `<img src="${imageBase}${path}" alt="${alt}" />`
  })

  // Code blocks (triple backtick)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const highlighted = lang === 'python' || lang === 'py' || lang === ''
      ? highlightPython(code.trim())
      : escapeHtml(code.trim())
    return `<pre><code class="language-${lang}">${highlighted}</code></pre>`
  })

  // Inline math ($$...$$)
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    return `<div class="katex-display" data-math="${escapeHtml(math)}"></div>`
  })

  // Inline math ($...$)
  html = html.replace(/(?<!\$)\$(?!\$)([^\n$]+?)\$(?!\$)/g, (match, math) => {
    return `<span class="katex-inline" data-math="${escapeHtml(math)}"></span>`
  })

  // Headers
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr/>')

  // Blockquote
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  // Inline code (backtick)
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`
  })

  // Links (but not images, already handled)
  html = html.replace(/(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Tables (simple)
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map((c) => c.trim())
    if (cells[0] === '' && cells[cells.length - 1] === '') {
      cells.pop()
      cells.shift()
    }
    // Check if separator row
    if (cells.every((c) => /^[-:]+$/.test(c))) return ''
    const tds = cells.map((c) => `<td>${c}</td>`).join('')
    return `<tr>${tds}</tr>`
  })

  // Wrap table rows
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)(?!\s*<tr>)/g, (match) => {
    return `<table><tbody>${match}</tbody></table>`
  })

  // Lists
  html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, '$1<li>$2</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, (match) => `<ul>${match}</ul>`)
  html = html.replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1<li>$2</li>')

  // Paragraphs (split by double newline, skip if already HTML)
  const blocks = html.split(/\n\n+/)
  html = blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[1-4]|ul|ol|pre|blockquote|table|hr|div|img)/.test(trimmed)) {
        return trimmed
      }
      // Convert single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return html
}

// Render code cell output
export function renderOutput(output, imageBase) {
  if (!output) return null

  // Image output
  if (output.data && output.data['image/png']) {
    const data = output.data['image/png']
    const src = data.startsWith('data:')
      ? data
      : `data:image/png;base64,${data}`
    return { type: 'image', src }
  }
  if (output.data && output.data['image/jpeg']) {
    const data = output.data['image/jpeg']
    const src = data.startsWith('data:')
      ? data
      : `data:image/jpeg;base64,${data}`
    return { type: 'image', src }
  }

  // HTML output
  if (output.data && output.data['text/html']) {
    const html = Array.isArray(output.data['text/html'])
      ? output.data['text/html'].join('')
      : output.data['text/html']
    return { type: 'html', content: html }
  }

  // Text output
  if (output.data && output.data['text/plain']) {
    const text = Array.isArray(output.data['text/plain'])
      ? output.data['text/plain'].join('')
      : output.data['text/plain']
    return { type: 'text', content: text }
  }

  // Stream output (stdout/stderr)
  if (output.text) {
    const text = Array.isArray(output.text)
      ? output.text.join('')
      : output.text
    return { type: 'text', content: text }
  }
  if (output.output_type === 'stream' && output.name) {
    const text = Array.isArray(output.text)
      ? output.text.join('')
      : output.text
    return { type: 'text', content: text, stream: output.name }
  }

  // Error
  if (output.output_type === 'error' || output.ename) {
    const text = output.traceback
      ? Array.isArray(output.traceback)
        ? output.traceback.join('\n')
        : output.traceback
      : `${output.ename || ''}: ${output.evalue || ''}`
    return { type: 'error', content: text }
  }

  return null
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
}
