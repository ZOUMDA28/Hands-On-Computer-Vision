<<<<<<< HEAD
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import {
  Eye,
  Github,
  Image as ImageIcon,
  PanelLeftClose,
  Search,
  Settings,
  StickyNote,
  Sun,
  Moon,
  Star,
} from 'lucide-react'
import { useSettingsContext } from '../context/SettingsContext.jsx'
import { GITHUB_REPO_URL } from '../config.js'

const SECTION_KEYS = ['image-processing', 'optimization-3d']
const SECTION_LABELS = {
  'image-processing': '图像处理基础',
  'optimization-3d': '最优化与立体视觉',
}

function getSectionKey(partDir) {
  return String(partDir || '').replace(/^part\d+-/, '')
}

function getLessonNumber(id) {
  const str = String(id || '')
  const sublesson = str.match(/^(\d+)([a-z])(?=-)/i)
  if (sublesson) return `${sublesson[1]}${sublesson[2].toUpperCase()}`
  const digits = str.match(/^\d+/)?.[0]
  if (digits) return digits
  return str.match(/^[A-Z](?=-)/)?.[0] || ''
}

function buildSidebarSections(catalog) {
  const sections = new Map()
  for (const item of catalog) {
    const section = getSectionKey(item.partDir)
    if (!sections.has(section)) {
      sections.set(section, {
        title: SECTION_LABELS[section] || section,
        lessons: [],
      })
    }
    const chapterOrder = item.chapterOrder ?? 0
    const isExtra = isExtraNotebookId(item.id)
    sections.get(section).lessons.push({
      id: item.id,
      num: isExtra ? `${chapterOrder}+` : String(chapterOrder),
      title: item.title,
      section,
    })
  }
  return SECTION_KEYS
    .map(section => sections.get(section))
    .filter(Boolean)
}

function isExtraNotebookId(id) {
  return /_extra$/.test(id)
}

const EXPAND_FOOTER_LESSONS_WITH_FULL = 9
const COMPACT_FOOTER_LESSONS_WITH_FULL = 6
const FALLBACK_LESSON_PITCH = 30
const FALLBACK_COMPACT_FOOTER_HEIGHT = 45
const FALLBACK_FULL_FOOTER_HEIGHT = 120

export default function Sidebar({
  catalog,
  currentId,
  onSelect,
  onHome,
  onOpenNotes,
  onOpenSettings,
  bookmarks = {},
  notebooksWithNotes = new Set(),
  isOpen,
  onClose,
}) {
  const { resolvedTheme, toggleTheme } = useSettingsContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const listRef = useRef(null)
  const headerRef = useRef(null)
  const searchRef = useRef(null)
  const filterRef = useRef(null)
  const footerRef = useRef(null)
  const fullFooterMeasureRef = useRef(null)
  const compactFooterMeasureRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const section = e.detail?.section
      if (!section || !listRef.current) return
      const idx = SECTION_KEYS.indexOf(section)
      if (idx < 0) return
      const sectionEls = listRef.current.querySelectorAll('[data-section-key]')
      const target = sectionEls[idx]
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.remove('sidebar-section-highlight')
        void target.offsetWidth
        target.classList.add('sidebar-section-highlight')
      }
    }
    window.addEventListener('sidebar-scroll-to', handler)
    return () => window.removeEventListener('sidebar-scroll-to', handler)
  }, [])

  const sidebarSections = buildSidebarSections(catalog)
  const filteredSections = sidebarSections.map(section => ({
    ...section,
    lessons: section.lessons.filter(lesson => {
      if (filterMode === 'bookmarked') return !!bookmarks[lesson.id]
      if (filterMode === 'noted') return notebooksWithNotes.has(lesson.id)
      if (!searchQuery) return true
      return lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.num.includes(searchQuery)
    }),
  })).filter(section => section.lessons.length > 0)

  const inFilterMode = filterMode !== 'all' || searchQuery !== ''
  const hasBookmarks = Object.keys(bookmarks).length > 0
  const hasNotes = notebooksWithNotes.size > 0

  const asideRef = useRef(null)
  const [isCompactFooter, setIsCompactFooter] = useState(false)

  useLayoutEffect(() => {
    const aside = asideRef.current
    if (!aside) return

    let frameId = null

    const measure = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const firstLesson = listRef.current?.querySelector('[data-lesson-row]')
        const secondLesson = listRef.current?.querySelectorAll('[data-lesson-row]')?.[1]
        let lessonPitch = FALLBACK_LESSON_PITCH

        if (firstLesson && secondLesson) {
          lessonPitch = secondLesson.offsetTop - firstLesson.offsetTop
        } else if (firstLesson) {
          lessonPitch = firstLesson.offsetHeight || FALLBACK_LESSON_PITCH
        }

        const headerHeight = headerRef.current?.offsetHeight || 0
        const searchHeight = searchRef.current?.offsetHeight || 0
        const filterHeight = filterRef.current?.offsetHeight || 0
        const fullFooterHeight = fullFooterMeasureRef.current?.offsetHeight ||
          FALLBACK_FULL_FOOTER_HEIGHT
        const compactFooterHeight = compactFooterMeasureRef.current?.offsetHeight ||
          FALLBACK_COMPACT_FOOTER_HEIGHT

        const chromeWithoutFooter = headerHeight + searchHeight + filterHeight
        const lessonsWithFull = Math.floor(Math.max(
          0,
          aside.clientHeight - chromeWithoutFooter - fullFooterHeight
        ) / lessonPitch)
        const lessonsWithCompact = Math.floor(Math.max(
          0,
          aside.clientHeight - chromeWithoutFooter - compactFooterHeight
        ) / lessonPitch)

        setIsCompactFooter(current => {
          if (current) {
            return lessonsWithFull < EXPAND_FOOTER_LESSONS_WITH_FULL
          }
          return lessonsWithFull <= COMPACT_FOOTER_LESSONS_WITH_FULL &&
            lessonsWithCompact > lessonsWithFull
        })
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(aside)
    if (headerRef.current) observer.observe(headerRef.current)
    if (searchRef.current) observer.observe(searchRef.current)
    if (filterRef.current) observer.observe(filterRef.current)
    if (footerRef.current) observer.observe(footerRef.current)
    if (listRef.current) observer.observe(listRef.current)
    if (fullFooterMeasureRef.current) observer.observe(fullFooterMeasureRef.current)
    if (compactFooterMeasureRef.current) observer.observe(compactFooterMeasureRef.current)
    window.addEventListener('resize', measure, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [isCompactFooter, filteredSections.length])

  return (
    <aside ref={asideRef} className={`w-64 h-screen max-h-screen border-r flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 ${
      isOpen
        ? 'translate-x-0 fixed inset-y-0 left-0 md:sticky md:top-0'
        : '-translate-x-full fixed inset-y-0 left-0 md:absolute'
    } bg-[var(--bg-sidebar)] border-[var(--border-light)]`}>

      {/* Header */}
      <div ref={headerRef} className="p-6 border-b shrink-0 flex flex-col gap-4 z-10 select-none border-[var(--border-light)]">
        <div className="flex items-center justify-between">
          <button onClick={onHome} className="brand-button" aria-label="Hands-On CV">
            <span className="brand-logo" aria-hidden="true">
              <ImageIcon className="brand-logo-fork" />
              <Eye className="brand-logo-code" />
            </span>
            <span className="brand-copy">
              <span className="brand-line brand-line-main">Hands-On</span>
              <span className="brand-line brand-line-sub">CV</span>
            </span>
          </button>
          <button
            onClick={onClose}
            className="sidebar-header-icon"
            title="收起侧栏"
            aria-label="收起侧栏"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search box */}
      <div ref={searchRef} className="px-4 pt-3 pb-0 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索课程..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-[var(--bg-input)] border-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/40 transition-colors"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div ref={filterRef} className="px-4 pt-3 pb-0 flex items-center gap-1.5 select-none">
        <button
          onClick={() => setFilterMode('all')}
          className={`sidebar-filter-tab ${filterMode === 'all' ? 'active' : ''}`}
        >全部</button>
        <button
          onClick={() => setFilterMode('bookmarked')}
          className={`sidebar-filter-tab sidebar-filter-tab-icon ${filterMode === 'bookmarked' ? 'active' : ''}`}
          disabled={!hasBookmarks}
          title="已收藏"
        ><Star className="w-3.5 h-3.5" /></button>
        <button
          onClick={() => setFilterMode('noted')}
          className={`sidebar-filter-tab sidebar-filter-tab-icon ${filterMode === 'noted' ? 'active' : ''}`}
          disabled={!hasNotes}
          title="有笔记"
        ><StickyNote className="w-3.5 h-3.5" /></button>
      </div>

      {/* Hidden measurement footers */}
      <div
        className="absolute left-[-9999px] top-0 w-64 pointer-events-none opacity-0"
        aria-hidden="true"
        inert=""
      >
        <div ref={compactFooterMeasureRef} className="shrink-0 border-t flex items-center justify-around gap-1 border-[var(--border-light)] bg-[var(--bg-sidebar-footer)] px-2 py-2">
          <button className="p-1.5 rounded-lg">{resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <button className="p-1.5 rounded-lg"><StickyNote className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg"><Settings className="w-4 h-4" /></button>
          <a className="p-1.5 rounded-lg"><Github className="w-4 h-4" /></a>
        </div>
        <div ref={fullFooterMeasureRef} className="shrink-0 border-t flex flex-col gap-2.5 border-[var(--border-light)] bg-[var(--bg-sidebar-footer)] p-4">
          <div className="space-y-1">
            <button className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
              <StickyNote className="w-3.5 h-3.5" />
              <span>笔记与收藏</span>
            </button>
          </div>
          <div className="border-t border-[var(--border-light)] my-1"></div>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg">{resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
              <button className="p-1.5 rounded-lg"><Settings className="w-4 h-4" /></button>
            </div>
            <a className="p-1.5 rounded-lg"><Github className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6 select-none">
        {filteredSections.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] text-center py-8">
            {inFilterMode
              ? '没有匹配的章节'
              : '未找到相关章节'}
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div key={idx} data-section-key={section.lessons[0]?.section} className="space-y-4 transition-all duration-500">
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {section.title}
                </span>
              </div>

              <div className="space-y-3">
                {section.lessons.map((lesson) => {
                  const isSelected = currentId === lesson.id
                  const isBm = !!bookmarks[lesson.id]
                  const hasNote = notebooksWithNotes.has(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      data-lesson-row
                      onClick={() => onSelect(lesson.id)}
                      className={`group w-full text-left flex items-center justify-between px-2 py-1 rounded-lg text-xs leading-normal transition-all duration-150 cursor-pointer ${
                        isSelected ? 'bg-[var(--bg-active)] font-semibold' : 'hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <div className={`w-8 h-5 rounded flex items-center justify-center font-mono text-[10px] font-medium shrink-0 ${
                          isSelected ? 'bg-[var(--border-light)] text-[var(--text-primary)]' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                        }`}>
                          {lesson.num}
                        </div>
                        <span className={`truncate font-medium text-xs ${
                          isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                        }`}>
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {hasNote && <span className="sidebar-item-note-dot" title="有笔记">&#8226;</span>}
                        {isBm && <span className="sidebar-item-star" title="已收藏">&#9733;</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — full version (vertical with text) when sidebar has room;
          compact version (horizontal icon-only) when sidebar is short */}
      {isCompactFooter ? (
        <div ref={footerRef} className="shrink-0 border-t flex items-center justify-around gap-1 border-[var(--border-light)] bg-[var(--bg-sidebar-footer)] px-2 py-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title={resolvedTheme === 'dark' ? '切换到浅色' : '切换到深色'}
            aria-label={resolvedTheme === 'dark' ? '切换到浅色' : '切换到深色'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onOpenNotes?.()}
            data-tour="notes-saved"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title="笔记与收藏"
            aria-label="笔记与收藏"
          >
            <StickyNote className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenSettings?.()}
            data-tour="settings"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title="设置"
            aria-label="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer"
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1.5"
            title="GitHub"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div ref={footerRef} className="shrink-0 border-t flex flex-col gap-2.5 border-[var(--border-light)] bg-[var(--bg-sidebar-footer)] p-4">
          <div className="space-y-1">
            <button
              onClick={() => onOpenNotes?.()}
              data-tour="notes-saved"
              className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>笔记与收藏</span>
            </button>
          </div>

          <div className="border-t border-[var(--border-light)] my-1"></div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                title={resolvedTheme === 'dark' ? '切换到浅色' : '切换到深色'}
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onOpenSettings?.()}
                data-tour="settings"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
=======
import { useMemo } from 'react'
import { getCatalog, PARTS } from '../data/notebooks'

function SidebarItem({ item, seqNum, isActive, onClick }) {
  return (
    <div
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <span className="sidebar-chapter-num">
        {seqNum}
      </span>
      <span className="sidebar-item-title">{item.title}</span>
    </div>
  )
}

function SidebarSection({ partKey, items, activeId, onSelect, startNum }) {
  const part = PARTS[partKey]
  if (!part) return null

  let currentNum = startNum

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-title">
        {part.title}
      </div>
      {items.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          seqNum={currentNum++}
          isActive={activeId === item.id}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}

export default function Sidebar({ activeId, onSelect, isOpen, onClose }) {
  const catalog = useMemo(() => getCatalog(), [])

  // Group by part
  const grouped = useMemo(() => {
    const result = {}
    for (const item of catalog) {
      if (!result[item.part]) result[item.part] = []
      result[item.part].push(item)
    }
    return result
  }, [catalog])

  // Order parts
  const partOrder = ['part1-image-processing', 'part2-optimization-3d', 'appendix']

  // Compute starting number for each part (sequential across parts)
  const partStartNums = useMemo(() => {
    const starts = {}
    let num = 1
    for (const partKey of partOrder) {
      starts[partKey] = num
      num += (grouped[partKey] || []).length
    }
    return starts
  }, [grouped, partOrder])

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <a className="sidebar-logo" href="#/" onClick={(e) => { e.preventDefault(); onSelect(null) }}>
          <span className="sidebar-logo-icon">CV</span>
          <div>
            <div>计算机视觉教程</div>
            <div className="sidebar-subtitle">华中科技大学 · 软件学院</div>
          </div>
        </a>
      </div>
      <nav className="sidebar-nav">
        {partOrder.map((partKey) => (
          <SidebarSection
            key={partKey}
            partKey={partKey}
            items={grouped[partKey] || []}
            activeId={activeId}
            onSelect={onSelect}
            startNum={partStartNums[partKey] || 1}
          />
        ))}
      </nav>
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
    </aside>
  )
}
