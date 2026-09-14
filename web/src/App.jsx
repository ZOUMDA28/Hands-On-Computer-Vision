import { useState, useEffect, useCallback, useRef } from 'react'
import { flushSync } from 'react-dom'
import { PanelLeftOpen } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import NotebookViewer from './components/NotebookViewer.jsx'
import NotesPanel from './components/NotesPanel.jsx'
import Welcome from './components/Welcome.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import ImageLightbox, { useImagePreview } from './components/ImageLightbox.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import useSettings from './hooks/useSettings.js'
import useTheme from './hooks/useTheme.js'
import useNotesAndBookmarks from './hooks/useNotesAndBookmarks.js'
import { getCatalog, getNotebook, getCachedNotebook, prefetchNotebook } from './data/notebooks.js'

const NOTES_SENTINEL = '__notes__'

function getInitialNotebookId() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || null
}

function resolveNotebookId(id, catalog) {
  if (!id || id === NOTES_SENTINEL) return id
  return catalog.some((notebook) => notebook.id === id) ? id : null
}

function getInitialSidebarOpen() {
  return window.innerWidth >= 768
}

function replaceUrlWithHash(id) {
  const hash = id ? `#${id}` : ''
  window.history.replaceState(null, '', `${window.location.pathname}${hash}`)
}

function AppContent() {
  const { settings, updateSettings } = useSettings()
  const { resolvedTheme, toggleTheme } = useTheme(settings.theme)
  const nbm = useNotesAndBookmarks()
  const { imagePreview, openSrc, close: closeImagePreview } = useImagePreview()

  const [catalog, setCatalog] = useState(() => getCatalog())
  const [currentId, setCurrentId] = useState(() =>
    resolveNotebookId(getInitialNotebookId(), catalog),
  )
  const [notebook, setNotebook] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => getInitialSidebarOpen())
  const [settingsOpen, setSettingsOpen] = useState(false)

  // catalog ref：让 schedulePrefetch 回调保持稳定引用
  const catalogRef = useRef(catalog)
  useEffect(() => {
    catalogRef.current = catalog
  }, [catalog])

  // 浏览器空闲时预取下一篇 notebook
  const schedulePrefetch = useCallback((id) => {
    const list = catalogRef.current
    const idx = list.findIndex((n) => n.id === id)
    if (idx < 0) return
    const next = list[idx + 1]
    if (!next) return
    const run = () => prefetchNotebook(next.id)
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 2000 })
    } else {
      setTimeout(run, 200)
    }
  }, [])

  // 同步字号到 CSS 变量
  useEffect(() => {
    const sizeMap = { small: '14.5px', default: '16.5px', large: '18.5px' }
    document.documentElement.style.setProperty(
      '--font-size-notebook',
      sizeMap[settings.fontSize] || '16.5px',
    )
  }, [settings.fontSize])

  // 移动端自动收起侧边栏
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const syncSidebarForMobile = () => {
      if (mobileQuery.matches) setSidebarOpen(false)
    }

    syncSidebarForMobile()
    mobileQuery.addEventListener?.('change', syncSidebarForMobile)
    return () => mobileQuery.removeEventListener?.('change', syncSidebarForMobile)
  }, [])

  // 加载 notebook
  useEffect(() => {
    let cancelled = false

    if (!currentId || currentId === NOTES_SENTINEL) {
      setNotebook(null)
      setLoadError(false)
      return () => {
        cancelled = true
      }
    }

    // 缓存命中：同步 set，跳过 spinner
    const cached = getCachedNotebook(currentId)
    if (cached) {
      setNotebook(cached)
      setLoadError(false)
      schedulePrefetch(currentId)
      return () => {
        cancelled = true
      }
    }

    // 缓存未命中：异步加载
    setLoadError(false)

    getNotebook(currentId)
      .then((nextNotebook) => {
        if (!cancelled) {
          setNotebook(nextNotebook)
          setLoadError(false)
          schedulePrefetch(currentId)
        }
      })
      .catch((error) => {
        console.error(`Failed to load notebook ${currentId}`, error)
        if (!cancelled) {
          setNotebook(null)
          setLoadError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [currentId, schedulePrefetch])

  // URL hash 路由同步
  useEffect(() => {
    const syncFromHash = () => {
      const requestedId = getInitialNotebookId()
      const nextId = resolveNotebookId(requestedId, getCatalog())
      if (nextId === NOTES_SENTINEL) return
      setCurrentId((prev) => {
        if (prev === nextId) return prev
        return nextId
      })
      const needsCanonicalHash = nextId && window.location.hash !== `#${nextId}`
      if (requestedId !== nextId || needsCanonicalHash) {
        replaceUrlWithHash(nextId)
      }
    }

    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    syncFromHash()
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  // 选中 notebook
  const handleSelect = useCallback(
    (id) => {
      flushSync(() => setCurrentId(id))
      replaceUrlWithHash(id)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    },
    [],
  )

  // 返回首页
  const handleHome = useCallback(() => {
    flushSync(() => setCurrentId(null))
    replaceUrlWithHash(null)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // 打开笔记面板
  const handleOpenNotes = useCallback(() => {
    flushSync(() => setCurrentId(NOTES_SENTINEL))
    replaceUrlWithHash(null)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // 打开设置面板
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  // 当前 notebook 的 meta
  const currentMeta = catalog.find((n) => n.id === currentId)

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-app)] text-[var(--text-body)] font-sans antialiased">
      {/* 侧边栏展开按钮（侧边栏关闭时显示） */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="sidebar-toggle-btn"
          aria-label="展开左侧栏"
          title="展开左侧栏"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}

      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar
        catalog={catalog}
        currentId={currentId}
        onSelect={handleSelect}
        onHome={handleHome}
        onOpenNotes={handleOpenNotes}
        onOpenSettings={handleOpenSettings}
        bookmarks={nbm.bookmarks}
        notes={nbm.notes}
        notebooksWithNotes={nbm.notebooksWithNotes}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        {currentId === NOTES_SENTINEL ? (
          <NotesPanel
            catalog={catalog}
            bookmarks={nbm.bookmarks}
            notes={nbm.notes}
            notebooksWithNotes={nbm.notebooksWithNotes}
            getSectionNotes={nbm.getSectionNotes}
            exportData={nbm.exportData}
            importFile={nbm.importFile}
            onClearAll={nbm.clearAll}
            onSelect={handleSelect}
          />
        ) : currentId ? (
          <NotebookViewer
            notebook={notebook}
            meta={currentMeta}
            loadError={loadError}
            onRetry={() => window.location.reload()}
            isBookmarked={nbm.isBookmarked}
            toggleBookmark={nbm.toggleBookmark}
            notes={nbm.notes}
            saveNote={nbm.saveNote}
            deleteNote={nbm.deleteNote}
            updateNoteSection={nbm.updateNoteSection}
            onImageClick={openSrc}
          />
        ) : (
          <Welcome
            catalog={catalog}
            onSelect={handleSelect}
          />
        )}
      </main>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* 图片灯箱 */}
      {imagePreview && (
        <ImageLightbox
          src={imagePreview.src}
          alt={imagePreview.alt}
          onClose={closeImagePreview}
        />
      )}
    </div>
  )
}

export default function App() {
  const { settings, updateSettings } = useSettings()
  const { resolvedTheme, toggleTheme } = useTheme(settings.theme)

  return (
    <SettingsProvider
      settings={settings}
      updateSettings={updateSettings}
      resolvedTheme={resolvedTheme}
      toggleTheme={toggleTheme}
    >
      <AppContent />
    </SettingsProvider>
  )
}
