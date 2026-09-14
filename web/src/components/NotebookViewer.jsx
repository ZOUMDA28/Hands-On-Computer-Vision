<<<<<<< HEAD
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Highlighter,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'
import { getCatalog } from '../data/notebooks.js'
import ImageLightbox, { useImagePreview } from './ImageLightbox.jsx'

// ─── TOC ────────────────────────────────────────────────────────────

function extractToc(html) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const headings = temp.querySelectorAll('h2, h3, h4')
  const toc = []
  headings.forEach((h) => {
    const clone = h.cloneNode(true)
    clone.querySelectorAll('.anchor-link').forEach((link) => link.remove())
    const text = clone.textContent.trim()
    if (!text) return
    const level = h.tagName === 'H4' ? 4 : h.tagName === 'H3' ? 3 : 2
    toc.push({ id: h.id, text, level })
  })
  return toc
}

// ─── Highlight / Note helpers ──────────────────────────────────────

const TEXT_HIGHLIGHT_BLOCK_SELECTOR = [
  '.rendered_html p',
  '.rendered_html li',
  '.rendered_html td',
  '.rendered_html th',
].join(', ')

const DISALLOWED_HIGHLIGHT_ANCESTOR_SELECTOR = [
  '.code_cell',
  '.input_area',
  '.output_area',
  'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'svg', 'canvas',
  '.katex',
  '.MathJax',
].join(', ')

const DISALLOWED_HIGHLIGHT_CONTENT_SELECTOR = [
  'p', 'li', 'div', 'pre', 'a', 'table',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'svg', 'canvas', '.katex',
  '.code_cell', '.input_area', '.output_area', '.MathJax',
].join(', ')

const EMPTY_NOTE_LIST = Object.freeze([])

function elementFromNode(node) {
  if (!node) return null
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement
}

function getTextHighlightBlock(root, range) {
  if (!root || !range || !range.toString().trim()) return null
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null

  const startElement = elementFromNode(range.startContainer)
  const endElement = elementFromNode(range.endContainer)
  if (!startElement || !endElement) return null
  if (startElement.closest(DISALLOWED_HIGHLIGHT_ANCESTOR_SELECTOR)) return null
  if (endElement.closest(DISALLOWED_HIGHLIGHT_ANCESTOR_SELECTOR)) return null

  const startBlock = startElement.closest(TEXT_HIGHLIGHT_BLOCK_SELECTOR)
  const endBlock = endElement.closest(TEXT_HIGHLIGHT_BLOCK_SELECTOR)
  if (!startBlock || startBlock !== endBlock) return null

  const fragment = range.cloneContents()
  if (fragment.querySelector(DISALLOWED_HIGHLIGHT_CONTENT_SELECTOR)) return null

  return startBlock
}

function canHighlightTextRange(root, range) {
  return !!getTextHighlightBlock(root, range)
}

function makeHighlightNoteId() {
  return `hl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function setHighlightMarkData(mark, data) {
  mark.className = 'user-highlight'
  mark.dataset.noteId = data.noteId || ''
  mark.dataset.sectionId = data.sectionId || ''
  mark.dataset.sectionTitle = data.sectionTitle || ''
  mark.dataset.noteQuote = data.quote || ''
}

function setNoteAnchorMarkData(mark, data) {
  mark.className = 'note-anchor'
  mark.dataset.noteId = data.noteId || ''
  mark.dataset.sectionId = data.sectionId || ''
  mark.dataset.sectionTitle = data.sectionTitle || ''
  mark.dataset.noteQuote = data.quote || ''
}

function isHighlightNote(note) {
  return !!note &&
    typeof note === 'object' &&
    String(note.id || '').startsWith('hl_') &&
    String(note.quote || '').trim()
}

function isPlainNote(note) {
  if (!note || typeof note !== 'object') return false
  if (String(note.id || '').startsWith('hl_')) return false
  return String(note.quote || '').trim().length > 0
}

function getHighlightBlocks(root) {
  return root ? [...root.querySelectorAll(TEXT_HIGHLIGHT_BLOCK_SELECTOR)] : []
}

function getAbsoluteOffset(block, node, offset) {
  const range = document.createRange()
  range.selectNodeContents(block)
  range.setEnd(node, offset)
  return range.toString().length
}

function makeHighlightAnchor(root, block, startOffset, endOffset) {
  const blockIndex = getHighlightBlocks(root).indexOf(block)
  if (blockIndex < 0 || endOffset <= startOffset) return null
  return {
    kind: 'text-offset-v1',
    blockIndex,
    startOffset,
    endOffset,
  }
}

function computeAnchorFromRange(root, range) {
  if (!root || !range) return null
  const block = getTextHighlightBlock(root, range)
  if (!block) return null
  const startOffset = getAbsoluteOffset(block, range.startContainer, range.startOffset)
  const endOffset = getAbsoluteOffset(block, range.endContainer, range.endOffset)
  return makeHighlightAnchor(root, block, startOffset, endOffset)
}

function applyTextHighlight(root, sourceRange, data) {
  const range = sourceRange?.cloneRange()
  const block = getTextHighlightBlock(root, range)
  if (!block) return null

  const selectedText = range.toString().trim()
  const startOffset = getAbsoluteOffset(block, range.startContainer, range.startOffset)
  const endOffset = getAbsoluteOffset(block, range.endContainer, range.endOffset)
  const anchor = makeHighlightAnchor(root, block, startOffset, endOffset)

  try {
    const mark = document.createElement('mark')
    setHighlightMarkData(mark, { ...data, quote: selectedText.slice(0, 160) })
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
    block.normalize()
    return { mark, selectedText, anchor }
  } catch {
    return null
  }
}

function applyNoteAnchor(root, sourceRange, data) {
  const range = sourceRange?.cloneRange()
  const block = getTextHighlightBlock(root, range)
  if (!block) return null

  try {
    const mark = document.createElement('mark')
    setNoteAnchorMarkData(mark, data)
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
    block.normalize()
    return mark
  } catch {
    return null
  }
}

function rangeFromOffsets(block, start, end) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let seen = 0
  let startSet = false
  let node = walker.nextNode()

  while (node) {
    const nextSeen = seen + node.textContent.length
    if (!startSet && start <= nextSeen) {
      range.setStart(node, Math.max(0, start - seen))
      startSet = true
    }
    if (startSet && end <= nextSeen) {
      range.setEnd(node, Math.max(0, end - seen))
      return range
    }
    seen = nextSeen
    node = walker.nextNode()
  }

  return null
}

function findPlainTextRange(root, quote) {
  const target = String(quote || '').trim()
  if (!target) return null

  const blocks = getHighlightBlocks(root)
  for (const block of blocks) {
    const text = block.textContent
    const start = text.indexOf(target)
    if (start < 0) continue
    const range = rangeFromOffsets(block, start, start + target.length)
    if (range && getTextHighlightBlock(root, range)) return range
  }

  return null
}

function findSavedHighlightRange(root, note) {
  const anchor = note?.anchor
  const target = String(note?.quote || '').trim()

  if (anchor && anchor.kind === 'text-offset-v1') {
    const { blockIndex, startOffset, endOffset } = anchor
    if ([blockIndex, startOffset, endOffset].every(Number.isFinite)) {
      const block = getHighlightBlocks(root)[blockIndex]
      if (block) {
        const range = rangeFromOffsets(block, startOffset, endOffset)
        if (range && getTextHighlightBlock(root, range)) {
          if (!target || range.toString().trim() === target) return range
        }
      }
    }
  }

  return findPlainTextRange(root, target)
}

function unwrapHighlight(mark) {
  const block = mark.closest(TEXT_HIGHLIGHT_BLOCK_SELECTOR)
  mark.replaceWith(...mark.childNodes)
  block?.normalize()
  return block
}

function getHighlightMarks(root, noteId) {
  if (!root || !noteId) return []
  return [...root.querySelectorAll(`mark.user-highlight[data-note-id="${noteId}"]`)]
}

function getHighlightQuote(root, noteId) {
  return getHighlightMarks(root, noteId)
    .map((mark) => mark.textContent)
    .join('\n')
    .trim()
}

function syncSavedHighlights(root, noteList) {
  const highlightNotes = new Map()
  for (const note of noteList) {
    if (!isHighlightNote(note)) continue
    highlightNotes.set(note.id, note)
  }

  // Clean up stale marks
  root.querySelectorAll('mark.user-highlight').forEach((mark) => {
    const note = highlightNotes.get(mark.dataset.noteId || '')
    if (note && getHighlightQuote(root, note.id) === String(note.quote || '').trim()) {
      setHighlightMarkData(mark, {
        noteId: note.id,
        sectionId: note.sectionId,
        sectionTitle: note.sectionTitle,
        quote: note.quote,
      })
      return
    }
    unwrapHighlight(mark)
  })

  // Render new highlights
  for (const note of highlightNotes.values()) {
    const existing = root.querySelector(`mark.user-highlight[data-note-id="${note.id}"]`)
    if (existing) continue

    const range = findSavedHighlightRange(root, note)
    if (!range) continue
    const mark = document.createElement('mark')
    setHighlightMarkData(mark, {
      noteId: note.id,
      sectionId: note.sectionId,
      sectionTitle: note.sectionTitle,
      quote: note.quote,
    })
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
  }
}

function syncSavedNotes(root, noteList) {
  const plainNotes = new Map()
  for (const note of noteList) {
    if (!isPlainNote(note)) continue
    plainNotes.set(note.id, note)
  }

  // Clean up stale marks
  root.querySelectorAll('mark.note-anchor').forEach((mark) => {
    const note = plainNotes.get(mark.dataset.noteId || '')
    if (note && mark.textContent.trim() === String(note.quote || '').trim()) {
      setNoteAnchorMarkData(mark, {
        noteId: note.id,
        sectionId: note.sectionId,
        sectionTitle: note.sectionTitle,
        quote: note.quote,
      })
      return
    }
    unwrapHighlight(mark)
  })

  // Render new note anchors
  for (const note of plainNotes.values()) {
    const existing = root.querySelector(`mark.note-anchor[data-note-id="${note.id}"]`)
    if (existing) continue

    const range = findSavedHighlightRange(root, note)
    if (!range) continue
    const mark = document.createElement('mark')
    setNoteAnchorMarkData(mark, {
      noteId: note.id,
      sectionId: note.sectionId,
      sectionTitle: note.sectionTitle,
      quote: note.quote,
    })
    mark.appendChild(range.extractContents())
    range.insertNode(mark)
  }
}

function getInitialTocOpen() {
  return window.innerWidth >= 1024
}

// ─── Component ─────────────────────────────────────────────────────

function NotebookViewer({
  notebook,
  meta,
  loadError,
  onRetry,
  isBookmarked,
  toggleBookmark,
  notes,
  saveNote,
  deleteNote,
  updateNoteSection,
  prevNotebook,
  nextNotebook,
  onNavigate,
}) {
  const contentRef = useRef(null)
  const notebookContentRef = useRef(null)
  const scrollSpyFrameRef = useRef(null)
  const tocScrollRef = useRef(null)

  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)
  const [tocOpen, setTocOpen] = useState(() => getInitialTocOpen())
  const { imagePreview, openSrc, close: closeImagePreview } = useImagePreview()

  const [selectionToolbar, setSelectionToolbar] = useState(null)
  const [noteEditor, setNoteEditor] = useState(null)
  const [highlightEditor, setHighlightEditor] = useState(null)

  const savedRangeRef = useRef(null)
  const noteAnchorRangeRef = useRef(null)
  const activeHighlightRef = useRef(null)
  const previousSyncRef = useRef(null)

  const lang = 'zh'

  const notebookHtml = useMemo(() => ({ __html: notebook?.html || '' }), [notebook?.html])

  const currentNotebookNotes = useMemo(() => {
    const noteList = notebook?.id ? notes?.[notebook.id] : null
    return Array.isArray(noteList) ? noteList : EMPTY_NOTE_LIST
  }, [notebook?.id, notes])

  // ── Prev / Next navigation ──────────────────────────────────────

  const catalog = useMemo(() => getCatalog(), [])
  const { prev, next } = useMemo(() => {
    if (!notebook?.id) return { prev: null, next: null }
    // Use provided props if available
    if (prevNotebook !== undefined || nextNotebook !== undefined) {
      return { prev: prevNotebook || null, next: nextNotebook || null }
    }
    const idx = catalog.findIndex((n) => n.id === notebook.id)
    if (idx < 0) return { prev: null, next: null }
    return {
      prev: idx > 0 ? catalog[idx - 1] : null,
      next: idx < catalog.length - 1 ? catalog[idx + 1] : null,
    }
  }, [notebook?.id, catalog, prevNotebook, nextNotebook])

  // ── TOC extraction ──────────────────────────────────────────────

  useEffect(() => {
    if (!notebook?.html) {
      setToc([])
      return
    }
    setToc(extractToc(notebook.html))
  }, [notebook?.html])

  // ── Scroll spy (active heading) ────────────────────────────────

  const updateActiveHeading = () => {
    const scroller = contentRef.current
    const content = notebookContentRef.current
    const headings = content ? [...content.querySelectorAll('h2, h3, h4')] : []
    if (!scroller || headings.length === 0) return

    if (scroller.scrollTop < 24) {
      const firstId = headings[0]?.id || null
      setActiveHeading((prev) => prev === firstId ? prev : firstId)
      return
    }

    const scrollerRect = scroller.getBoundingClientRect()
    const readingLine = scrollerRect.top + Math.min(scroller.clientHeight * 0.34, 240)
    let current = headings[0]

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= readingLine) {
        current = heading
      } else {
        break
      }
    }

    const nextId = current?.id || null
    setActiveHeading((prev) => prev === nextId ? prev : nextId)
  }

  const requestActiveHeadingUpdate = () => {
    if (scrollSpyFrameRef.current) return
    scrollSpyFrameRef.current = requestAnimationFrame(() => {
      scrollSpyFrameRef.current = null
      updateActiveHeading()
    })
  }

  // ── Initial content setup ──────────────────────────────────────

  useLayoutEffect(() => {
    const content = notebookContentRef.current
    if (!notebook?.html || !content) return

    requestActiveHeadingUpdate()

    // Set image attributes and load listeners
    const imageLoadCleanups = []
    content.querySelectorAll('.output_area img, .rendered_html img').forEach((img) => {
      img.setAttribute('tabindex', '0')
      img.setAttribute('role', 'button')
      img.setAttribute('title', '点击放大')
      if (!img.complete) {
        img.addEventListener('load', requestActiveHeadingUpdate, { once: true })
        imageLoadCleanups.push(() => {
          img.removeEventListener('load', requestActiveHeadingUpdate)
        })
      }
    })

    window.addEventListener('resize', requestActiveHeadingUpdate)

    return () => {
      imageLoadCleanups.forEach((cleanup) => cleanup())
      window.removeEventListener('resize', requestActiveHeadingUpdate)
      if (scrollSpyFrameRef.current) {
        cancelAnimationFrame(scrollSpyFrameRef.current)
        scrollSpyFrameRef.current = null
      }
    }
  }, [notebook?.id, notebook?.html, toc.length])

  // ── Sync highlights and notes into DOM ─────────────────────────

  useLayoutEffect(() => {
    const content = notebookContentRef.current
    if (!notebook?.id || !content) return

    const notesSyncKey = JSON.stringify(currentNotebookNotes.map((note) => [
      note.id,
      note.updatedAt || 0,
      note.sectionId || '',
      note.sectionTitle || '',
      note.quote || '',
      note.text || '',
      note.anchor?.kind || '',
      note.anchor?.blockIndex ?? null,
      note.anchor?.startOffset ?? null,
      note.anchor?.endOffset ?? null,
    ]))

    const previousSync = previousSyncRef.current
    if (
      previousSync?.notebookId === notebook.id &&
      previousSync?.html === notebook.html &&
      previousSync?.notesSyncKey === notesSyncKey
    ) {
      return
    }
    previousSyncRef.current = {
      notebookId: notebook.id,
      html: notebook.html,
      notesSyncKey,
    }

    syncSavedHighlights(content, currentNotebookNotes)
    syncSavedNotes(content, currentNotebookNotes)
  }, [notebook?.id, notebook?.html, currentNotebookNotes])

  // Reset sync state when notebook changes
  useEffect(() => {
    previousSyncRef.current = null
    activeHighlightRef.current = null
    setHighlightEditor(null)
    setActiveHeading(null)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [notebook?.id])

  // ── TOC toggle on mobile ───────────────────────────────────────

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 1023px)')
    const syncTocForMobile = () => {
      if (mobileQuery.matches) setTocOpen(false)
    }
    syncTocForMobile()
    mobileQuery.addEventListener?.('change', syncTocForMobile)
    return () => mobileQuery.removeEventListener?.('change', syncTocForMobile)
  }, [])

  // ── Escape key handler ─────────────────────────────────────────

  useEffect(() => {
    if (!imagePreview && !noteEditor && !selectionToolbar && !highlightEditor) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (imagePreview) {
          closeImagePreview()
          return
        }
        if (noteEditor) setNoteEditor(null)
        if (highlightEditor) {
          setHighlightEditor(null)
          activeHighlightRef.current = null
        }
        if (selectionToolbar) {
          setSelectionToolbar(null)
          window.getSelection()?.removeAllRanges()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imagePreview, noteEditor, selectionToolbar, highlightEditor, closeImagePreview])

  // ── Close highlight editor on outside click ────────────────────

  useEffect(() => {
    if (!highlightEditor) return undefined

    const handlePointerDown = (event) => {
      const target = elementFromNode(event.target)
      if (!target) return
      if (target.closest('mark.user-highlight') || target.closest('.highlight-delete-btn')) {
        return
      }
      setHighlightEditor(null)
      activeHighlightRef.current = null
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [highlightEditor])

  // ── TOC click (smooth scroll) ──────────────────────────────────

  const handleTocClick = (id) => {
    const scroller = contentRef.current
    if (!scroller) return

    const safeId = typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(id)
      : id.replace(/(["'\\!#$%&()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1')
    const el = scroller.querySelector(`#${safeId}`)
    if (!el) return

    setActiveHeading(id)

    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offset = elRect.top - scrollerRect.top
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    const target = Math.min(Math.max(scroller.scrollTop + offset - 32, 0), maxScroll)
    scroller.scrollTo({ top: target, behavior: 'smooth' })
  }

  // ── Text selection toolbar ─────────────────────────────────────

  const findNearestHeading = (content, range) => {
    const startEl = elementFromNode(range.startContainer)
    const headingAncestor = startEl?.closest('h2, h3, h4')
    if (headingAncestor && content.contains(headingAncestor)) {
      return headingAncestor
    }
    const selTop = range.getBoundingClientRect().top
    const headings = [...content.querySelectorAll('h2, h3, h4')]
    let nearest = null
    let minDist = Infinity
    for (const h of headings) {
      const dist = selTop - h.getBoundingClientRect().bottom
      if (dist >= 0 && dist < minDist) {
        minDist = dist
        nearest = h
      }
    }
    return nearest
  }

  const handleNotebookMouseUp = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectionToolbar(null)
        return
      }
      const content = notebookContentRef.current
      if (!content) return
      const range = selection.getRangeAt(0)
      if (!content.contains(range.commonAncestorContainer)) return

      const rect = range.getBoundingClientRect()
      const selectedText = selection.toString().trim()
      const h = findNearestHeading(content, range)

      savedRangeRef.current = range.cloneRange()

      let top = rect.top - 44
      if (top < 60) top = rect.bottom + 8
      const left = Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 120)

      setSelectionToolbar({
        selectedText,
        sectionId: h?.id || '',
        sectionTitle: h?.textContent.replace(/[#\n\r]/g, '').trim() || '',
        canHighlight: canHighlightTextRange(content, range),
        top,
        left,
      })
    }, 10)
  }

  // ── Highlight commit from selection toolbar ────────────────────

  const commitSelectionHighlight = () => {
    if (!selectionToolbar?.canHighlight) return false

    const root = notebookContentRef.current
    if (!root) return false
    const sel = window.getSelection()
    const liveRange = sel && !sel.isCollapsed ? sel.getRangeAt(0) : null
    const range = savedRangeRef.current || liveRange
    if (!range) return false

    const noteId = makeHighlightNoteId()
    const result = applyTextHighlight(root, range, {
      noteId,
      sectionId: selectionToolbar.sectionId,
      sectionTitle: selectionToolbar.sectionTitle,
    })
    if (!result) return false

    sel?.removeAllRanges()
    savedRangeRef.current = null
    saveNote?.(
      notebook.id,
      selectionToolbar.sectionId,
      selectionToolbar.sectionTitle,
      result.selectedText,
      '',
      noteId,
      result.anchor
    )
    setSelectionToolbar(null)
    showHighlightEditor(result.mark)
    return true
  }

  // ── Highlight editor ───────────────────────────────────────────

  const showHighlightEditor = (mark) => {
    const root = notebookContentRef.current
    const noteId = mark.dataset.noteId || ''
    const rect = mark.getBoundingClientRect()
    const viewerBody = mark.closest('.viewer-body')
    const origin = viewerBody?.getBoundingClientRect() || { top: 0, left: 0 }

    activeHighlightRef.current = mark
    setHighlightEditor({
      deleteTop: Math.max(rect.top - origin.top - 36, 8),
      deleteLeft: Math.max((rect.left + rect.right) / 2 - origin.left - 14, 8),
      noteId,
      sectionId: mark.dataset.sectionId || '',
      sectionTitle: mark.dataset.sectionTitle || '',
      quote: noteId ? getHighlightQuote(root, noteId) : mark.textContent.trim(),
    })
  }

  const deleteActiveHighlight = () => {
    const mark = activeHighlightRef.current
    if (!mark) return
    const noteId = mark.dataset.noteId
    if (noteId) deleteNote?.(notebook.id, noteId)
    getHighlightMarks(notebookContentRef.current, noteId).forEach(unwrapHighlight)
    activeHighlightRef.current = null
    setHighlightEditor(null)
  }

  // ── Copy code ──────────────────────────────────────────────────

  const copyCode = (codeCell) => {
    const pre = codeCell?.querySelector('.input_area pre')
    const code = pre?.innerText || ''
    if (!code) return

    const copyButton = codeCell.querySelector('.code-copy-button')
    const markCopied = () => {
      copyButton?.classList.add('copied')
      copyButton?.setAttribute('aria-label', '已复制')
      copyButton?.setAttribute('title', '已复制')
      window.setTimeout(() => {
        copyButton?.classList.remove('copied')
        copyButton?.setAttribute('aria-label', '复制代码')
        copyButton?.setAttribute('title', '复制代码')
      }, 1200)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(markCopied).catch(() => {
        const textarea = document.createElement('textarea')
        textarea.value = code
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        markCopied()
      })
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      markCopied()
    }
  }

  // ── Click handler (event delegation) ───────────────────────────

  const handleNotebookClick = (event) => {
    // Highlight click
    const highlight = event.target.closest('mark.user-highlight')
    if (highlight && notebookContentRef.current?.contains(highlight)) {
      event.preventDefault()
      event.stopPropagation()
      setSelectionToolbar(null)
      window.getSelection()?.removeAllRanges()
      showHighlightEditor(highlight)
      return
    }

    // Note anchor click
    const noteAnchor = event.target.closest('mark.note-anchor')
    if (noteAnchor && notebookContentRef.current?.contains(noteAnchor)) {
      event.preventDefault()
      event.stopPropagation()
      setSelectionToolbar(null)
      window.getSelection()?.removeAllRanges()
      const noteId = noteAnchor.dataset.noteId || null
      const matchedNote = noteId ? currentNotebookNotes.find((n) => n.id === noteId) : null
      const rect = noteAnchor.getBoundingClientRect()
      setNoteEditor({
        noteId,
        sectionId: noteAnchor.dataset.sectionId || '',
        sectionTitle: noteAnchor.dataset.sectionTitle || '',
        quote: noteAnchor.dataset.noteQuote || noteAnchor.textContent,
        text: matchedNote?.text || '',
        top: Math.min(Math.max(80, rect.top - 20), window.innerHeight - 280),
        left: Math.min(Math.max(rect.left, 80), window.innerWidth - 500),
      })
      return
    }

    // Image click
    const image = event.target.closest('.output_area img, .rendered_html img')
    if (image && notebookContentRef.current?.contains(image)) {
      event.preventDefault()
      event.stopPropagation()
      openSrc(image.currentSrc || image.src, image.alt || 'notebook output')
      return
    }

    // Code copy button
    const copyButton = event.target.closest('.code-copy-button')
    if (copyButton && notebookContentRef.current?.contains(copyButton)) {
      event.preventDefault()
      event.stopPropagation()
      const codeCell = copyButton.closest('.code_cell')
      copyCode(codeCell)
      return
    }

    // Code expand/collapse toggle
    const codeInput = event.target.closest('.code-input-expandable')
    if (codeInput && notebookContentRef.current?.contains(codeInput)) {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return
      const toggle = codeInput.querySelector('.code-expand-toggle')
      if (toggle) toggle.checked = !toggle.checked
      return
    }

    // Output expand/collapse toggle
    const output = event.target.closest('.output-expandable')
    if (output && notebookContentRef.current?.contains(output)) {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return
      const toggle = output.querySelector('.output-expand-toggle')
      if (toggle) toggle.checked = !toggle.checked
      return
    }

    // Close highlight editor on background click
    if (highlightEditor) {
      setHighlightEditor(null)
      activeHighlightRef.current = null
    }
  }

  const handleNotebookKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const image = event.target.closest?.('.output_area img, .rendered_html img')
    if (!image || !notebookContentRef.current?.contains(image)) return
    event.preventDefault()
    openSrc(image.currentSrc || image.src, image.alt || 'notebook output')
  }

  // ── Scroll handler ─────────────────────────────────────────────

  const handleViewerScroll = () => {
    requestActiveHeadingUpdate()
  }

  // ── Note save ──────────────────────────────────────────────────

  const handleSaveNote = () => {
    if (!noteEditor) return
    const root = notebookContentRef.current
    const anchor = (!noteEditor.noteId && root && noteAnchorRangeRef.current)
      ? computeAnchorFromRange(root, noteAnchorRangeRef.current)
      : undefined

    saveNote?.(
      notebook.id,
      noteEditor.sectionId,
      noteEditor.sectionTitle,
      noteEditor.quote || '',
      noteEditor.text,
      noteEditor.noteId || undefined,
      anchor,
    )
    noteAnchorRangeRef.current = null
    setNoteEditor(null)
  }

  const handleDeleteNote = () => {
    if (!noteEditor?.noteId) return
    deleteNote?.(notebook.id, noteEditor.noteId)
    setNoteEditor(null)
  }

  // ── Navigation ─────────────────────────────────────────────────

  const handlePrev = () => {
    if (prev?.id && onNavigate) onNavigate(prev.id)
  }

  const handleNext = () => {
    if (next?.id && onNavigate) onNavigate(next.id)
  }

  // ── Loading / Error states ─────────────────────────────────────

  if (!notebook && !loadError) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading">
          <div className="spinner" />
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading notebook-load-error" role="alert">
          <span>这个 Notebook 加载失败，请刷新后重试。</span>
          <button type="button" onClick={onRetry}>
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="viewer" ref={contentRef} onScroll={handleViewerScroll}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="viewer-header visible">
        <div className="viewer-part">{meta?.part}</div>
        <h1 className="viewer-title">{meta?.title}</h1>
        <div className="viewer-launches">
          {notebook?.id && (
            <button
              className={`bookmark-star ${isBookmarked?.(notebook.id) ? 'active' : ''}`}
              onClick={() => {
                toggleBookmark?.(notebook.id, meta?.title || '')
              }}
              title={isBookmarked?.(notebook.id) ? '取消收藏' : '收藏'}
            >
              <Star className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Prev / Next navigation */}
        {(prev || next) && onNavigate && (
          <div className="viewer-nav">
            <button
              type="button"
              className="viewer-nav-btn"
              onClick={handlePrev}
              disabled={!prev}
              title={prev ? `上一篇：${prev.title}` : '已是第一篇'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="viewer-nav-label">上一篇</span>
            </button>
            <button
              type="button"
              className="viewer-nav-btn"
              onClick={handleNext}
              disabled={!next}
              title={next ? `下一篇：${next.title}` : '已是最后一篇'}
            >
              <span className="viewer-nav-label">下一篇</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── TOC toggle button ──────────────────────────────────── */}
      {toc.length > 0 && (
        <button
          type="button"
          className={`toc-toggle${tocOpen ? ' active' : ''}`}
          onClick={() => setTocOpen((open) => !open)}
          title={tocOpen ? '收起大纲' : '展开大纲'}
          aria-label={tocOpen ? '收起大纲' : '展开大纲'}
        >
          {tocOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          <span>大纲</span>
        </button>
      )}

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className={`viewer-body${tocOpen ? '' : ' toc-collapsed'}`}>
        <div
          key={notebook.id}
          className="notebook-content visible"
          ref={notebookContentRef}
          onClick={handleNotebookClick}
          onMouseUp={handleNotebookMouseUp}
          onKeyDown={handleNotebookKeyDown}
          dangerouslySetInnerHTML={notebookHtml}
        />

        {/* Image lightbox */}
        {imagePreview && (
          <ImageLightbox
            src={imagePreview.src}
            alt={imagePreview.alt}
            onClose={closeImagePreview}
          />
        )}

        {/* Note editor */}
        {noteEditor && (
          <div
            className="note-editor-backdrop"
            onClick={() => setNoteEditor(null)}
          >
            <div
              className="note-editor-popup"
              style={{ top: noteEditor.top, left: noteEditor.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="note-editor-header">
                <span className="note-editor-section">{noteEditor.sectionTitle}</span>
                <button
                  className="note-editor-close"
                  onClick={() => setNoteEditor(null)}
                >&times;</button>
              </div>
              {noteEditor.quote && (
                <blockquote className="note-editor-quote">{noteEditor.quote}</blockquote>
              )}
              <textarea
                className="note-editor-textarea"
                value={noteEditor.text}
                onChange={(e) => setNoteEditor({ ...noteEditor, text: e.target.value })}
                placeholder="写下你的笔记..."
                rows={4}
                autoFocus
              />
              <div className="note-editor-actions">
                {noteEditor.noteId && (
                  <button
                    className="note-editor-btn note-editor-delete"
                    onClick={handleDeleteNote}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除</span>
                  </button>
                )}
                <div className="note-editor-spacer" />
                <button
                  className="note-editor-btn note-editor-cancel"
                  onClick={() => setNoteEditor(null)}
                >
                  取消
                </button>
                <button
                  className="note-editor-btn note-editor-save"
                  onClick={handleSaveNote}
                  disabled={!noteEditor.text.trim() && !noteEditor.quote}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Highlight delete button */}
        {highlightEditor && (
          <button
            type="button"
            className="highlight-delete-btn"
            title="删除高亮"
            style={{ top: highlightEditor.deleteTop, left: highlightEditor.deleteLeft }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              deleteActiveHighlight()
            }}
          >
            ×
          </button>
        )}

        {/* Selection toolbar */}
        {selectionToolbar && (
          <div
            className="selection-toolbar"
            style={{ top: selectionToolbar.top, left: selectionToolbar.left }}
          >
            <button
              className="selection-toolbar-btn"
              title="复制"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
              onMouseUp={(e) => { e.preventDefault(); e.stopPropagation() }}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation()
                const txt = window.getSelection()?.toString().trim() || selectionToolbar.selectedText
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(txt)
                } else {
                  const ta = document.createElement('textarea')
                  ta.value = txt
                  ta.style.position = 'fixed'
                  ta.style.left = '-9999px'
                  document.body.appendChild(ta)
                  ta.select()
                  document.execCommand('copy')
                  document.body.removeChild(ta)
                }
                window.getSelection()?.removeAllRanges()
                setSelectionToolbar(null)
              }}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              className="selection-toolbar-btn"
              title="笔记"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
              onMouseUp={(e) => { e.preventDefault(); e.stopPropagation() }}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation()
                noteAnchorRangeRef.current = savedRangeRef.current?.cloneRange() || null
                savedRangeRef.current = null
                setNoteEditor({
                  noteId: null,
                  sectionId: selectionToolbar.sectionId,
                  sectionTitle: selectionToolbar.sectionTitle,
                  quote: selectionToolbar.selectedText,
                  text: '',
                  top: Math.min(Math.max(80, selectionToolbar.top - 20), window.innerHeight - 280),
                  left: Math.min(selectionToolbar.left, window.innerWidth - 500),
                })
                setSelectionToolbar(null)
                window.getSelection()?.removeAllRanges()
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              className="selection-toolbar-btn"
              title={selectionToolbar.canHighlight ? '高亮' : '只能高亮正文文字'}
              disabled={!selectionToolbar.canHighlight}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                commitSelectionHighlight()
              }}
              onMouseUp={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                commitSelectionHighlight()
              }}
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TOC sidebar */}
        {toc.length > 0 && tocOpen && (
          <aside className="toc visible">
            <div className="toc-sticky">
              <div className="toc-scroll" ref={tocScrollRef}>
                <div className="toc-title">大纲</div>
                <nav className="toc-nav">
                  {toc.map((item) => {
                    const hasTocNote = currentNotebookNotes.some((n) => n.sectionId === item.id)
                    return (
                      <button
                        key={item.id}
                        data-toc-id={item.id}
                        className={[
                          'toc-item',
                          activeHeading === item.id ? 'active' : '',
                          `toc-level-${item.level}`,
                        ].join(' ')}
                        onClick={() => handleTocClick(item.id)}
                      >
                        <span className="toc-item-text">{item.text}</span>
                        {hasTocNote && <span className="toc-item-note-dot" title="有笔记" />}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </aside>
        )}
=======
import { useState, useMemo, useEffect, useRef } from 'react'
import { parseNotebook, renderMarkdown, renderOutput, getOutline } from '../data/notebooks'
import { ChevronDown, ChevronRight, Code2, X } from 'lucide-react'

function CodeCell({ cell, index }) {
  const [expanded, setExpanded] = useState(true)
  const [outputExpanded, setOutputExpanded] = useState(true)
  const hasOutput = cell.outputs && cell.outputs.length > 0

  return (
    <div className="nb-code-cell">
      <div className="nb-code-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={12} />
          <span>In [{cell.executionCount || index + 1}]</span>
        </div>
        <button className="nb-code-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {expanded ? '收起' : '展开'}
        </button>
      </div>
      <div className={`nb-code-body ${expanded ? 'expanded' : 'collapsed'}`}>
        <div
          className="nb-code-source"
          dangerouslySetInnerHTML={{
            __html: renderPythonCode(cell.source)
          }}
        />
        {hasOutput && outputExpanded && (
          <div className="nb-code-output">
            {cell.outputs.map((output, i) => {
              const rendered = renderOutput(output)
              if (!rendered) return null
              return (
                <div key={i} className="nb-output-item">
                  {rendered.type === 'image' && (
                    <img
                      className="nb-output-image"
                      src={rendered.src}
                      alt={`Output ${i + 1}`}
                      onClick={(e) => {
                        e.target.dispatchEvent(new CustomEvent('lightbox', {
                          detail: rendered.src,
                          bubbles: true
                        }))
                      }}
                    />
                  )}
                  {rendered.type === 'text' && (
                    <pre className="nb-output-text">{rendered.content}</pre>
                  )}
                  {rendered.type === 'html' && (
                    <div
                      className="nb-output-html"
                      dangerouslySetInnerHTML={{ __html: rendered.content }}
                    />
                  )}
                  {rendered.type === 'error' && (
                    <pre className="nb-output-error">{rendered.content}</pre>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {hasOutput && !outputExpanded && (
          <div className="nb-code-output" style={{ padding: '4px 12px' }}>
            <button
              className="nb-code-toggle"
              onClick={() => setOutputExpanded(true)}
            >
              <ChevronRight size={12} /> 显示输出
            </button>
          </div>
        )}
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
      </div>
    </div>
  )
}

<<<<<<< HEAD
export default NotebookViewer
=======
function renderPythonCode(source) {
  if (!source) return ''
  // Use the highlighter from notebooks.js
  // We need to import it, but to avoid circular deps, re-implement here
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
    'getattr', 'setattr', 'hasattr', 'input', 'np', 'cv2', 'plt', 'matplotlib'
  ])

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  let result = ''
  let i = 0
  const code = source
  const n = code.length

  while (i < n) {
    const c = code[i]

    // Comment
    if (c === '#') {
      let end = code.indexOf('\n', i)
      if (end === -1) end = n
      result += `<span class="tk-comment">${escapeHtml(code.slice(i, end))}</span>`
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
        result += `<span class="tk-string">${escapeHtml(code.slice(i, end))}</span>`
        i = end
        continue
      }
      let end = i + 1
      while (end < n && code[end] !== quote && code[end] !== '\n') {
        if (code[end] === '\\') end++
        end++
      }
      if (end < n && code[end] === quote) end++
      result += `<span class="tk-string">${escapeHtml(code.slice(i, end))}</span>`
      i = end
      continue
    }

    // Decorator
    if (c === '@' && (i === 0 || code[i - 1] === '\n' || code[i - 1] === ' ')) {
      let end = i + 1
      while (end < n && /[\w.]/.test(code[end])) end++
      result += `<span class="tk-decorator">${escapeHtml(code.slice(i, end))}</span>`
      i = end
      continue
    }

    // Number
    if (/\d/.test(c)) {
      let end = i + 1
      while (end < n && /[\d.eExXa-fA-F_]/.test(code[end])) end++
      result += `<span class="tk-number">${escapeHtml(code.slice(i, end))}</span>`
      i = end
      continue
    }

    // Identifier/keyword
    if (/[a-zA-Z_]/.test(c)) {
      let end = i + 1
      while (end < n && /[\w]/.test(code[end])) end++
      const word = code.slice(i, end)
      if (keywords.has(word)) {
        result += `<span class="tk-keyword">${word}</span>`
      } else if (builtins.has(word)) {
        result += `<span class="tk-builtin">${word}</span>`
      } else {
        result += escapeHtml(word)
      }
      i = end
      continue
    }

    result += escapeHtml(c)
    i++
  }

  return result
}

function MarkdownCell({ source, imageBase, onImageClick }) {
  const html = useMemo(() => renderMarkdown(source, imageBase), [source, imageBase])

  useEffect(() => {
    // Render KaTeX
    const container = document.getElementById('nb-md-current')
    if (!container) return

    const mathElements = container.querySelectorAll('[data-math]')
    mathElements.forEach((el) => {
      const math = el.getAttribute('data-math')
      const isDisplay = el.classList.contains('katex-display')
      try {
        if (window.katex) {
          window.katex.render(math, el, {
            displayMode: isDisplay,
            throwOnError: false,
            errorColor: '#dc2626',
          })
        }
      } catch (e) {
        el.textContent = math
      }
    })
  }, [html])

  return (
    <div
      className="nb-markdown"
      id="nb-md-current"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        if (e.target.tagName === 'IMG' && !e.target.classList.contains('nb-output-image')) {
          onImageClick(e.target.src)
        }
      }}
    />
  )
}

export default function NotebookViewer({ notebook, rawContent, onBack }) {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const containerRef = useRef(null)

  const { cells, metadata } = useMemo(() => {
    if (!notebook || !rawContent) return { cells: [], metadata: {} }
    return parseNotebook(rawContent)
  }, [notebook, rawContent])

  const outline = useMemo(() => getOutline(cells), [cells])

  // Handle lightbox events from code output images
  useEffect(() => {
    const handler = (e) => setLightboxSrc(e.detail)
    document.addEventListener('lightbox', handler)
    return () => document.removeEventListener('lightbox', handler)
  }, [])

  // Scroll to top when notebook changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [notebook?.id])

  if (!notebook) return null

  return (
    <div className="notebook-viewer" ref={containerRef}>
      <div className="notebook-content">
        {cells.map((cell, index) => {
          if (cell.cellType === 'markdown') {
            return (
              <div className="nb-cell" key={index}>
                <MarkdownCell
                  source={cell.source}
                  imageBase={notebook.imageBase}
                  onImageClick={setLightboxSrc}
                />
              </div>
            )
          } else if (cell.cellType === 'code') {
            return (
              <div className="nb-cell" key={index}>
                <CodeCell cell={cell} index={index} />
              </div>
            )
          }
          return null
        })}
      </div>

      {outline.length > 0 && (
        <div className="notebook-outline">
          <div className="outline-title">本页大纲</div>
          {outline.map((heading, i) => (
            <a
              key={i}
              href={`#${heading.id}`}
              className={`outline-item level-${heading.level}`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('nb-md-current')
                // Find the heading text in the content
                const headings = el?.querySelectorAll(`h${heading.level}`)
                if (headings && headings[i]) {
                  headings[i].scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              {heading.text}
            </a>
          ))}
        </div>
      )}

      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <img className="lightbox-img" src={lightboxSrc} alt="放大查看" />
        </div>
      )}
    </div>
  )
}
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
