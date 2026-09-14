import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import NotebookViewer from './components/NotebookViewer'
import Welcome from './components/Welcome'
import { getNotebook, getFirstNotebook, getCatalog, loadNotebookContent } from './data/notebooks'
import { Menu, Moon, Sun, Type, StickyNote, X, ChevronLeft, Loader2 } from 'lucide-react'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [activeContent, setActiveContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize') || '15'))
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('cv-notes') || '{}'))
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('cv-bookmarks') || '[]'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--nb-font-size', `${fontSize}px`)
    localStorage.setItem('fontSize', fontSize.toString())
  }, [fontSize, activeId])

  useEffect(() => {
    if (window.katex) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Load notebook content when activeId changes
  useEffect(() => {
    if (!activeId) {
      setActiveContent(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setActiveContent(null)
    loadNotebookContent(activeId).then((content) => {
      if (!cancelled) {
        setActiveContent(content)
        setLoading(false)
      }
    }).catch((e) => {
      console.error('Failed to load notebook:', e)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [activeId])

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1)
      if (!hash || hash === '/') {
        setActiveId(null)
      } else {
        const id = hash.replace(/^\//, '')
        const nb = getNotebook(id)
        if (nb) {
          setActiveId(id)
        } else {
          const catalog = getCatalog()
          const match = catalog.find((c) => c.id.includes(id) || id.includes(c.id))
          if (match) setActiveId(match.id)
        }
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const handleSelect = useCallback((id) => {
    if (id === null) {
      window.location.hash = '/'
      setActiveId(null)
    } else {
      window.location.hash = `/${id}`
      setActiveId(id)
    }
    setSidebarOpen(false)
  }, [])

  const handleStart = useCallback((part, chapterNum) => {
    const catalog = getCatalog()
    const match = catalog.find((c) => c.chapterOrder === chapterNum && !c.filename.includes('extra'))
    if (match) {
      handleSelect(match.id)
    } else {
      const first = getFirstNotebook()
      if (first) handleSelect(first.id)
    }
  }, [handleSelect])

  const activeNotebook = activeId ? getNotebook(activeId) : null

  const saveNote = (notebookId, text) => {
    const newNotes = { ...notes, [notebookId]: text }
    setNotes(newNotes)
    localStorage.setItem('cv-notes', JSON.stringify(newNotes))
  }

  const toggleBookmark = (notebookId) => {
    const newBookmarks = bookmarks.includes(notebookId)
      ? bookmarks.filter((b) => b !== notebookId)
      : [...bookmarks, notebookId]
    setBookmarks(newBookmarks)
    localStorage.setItem('cv-bookmarks', JSON.stringify(newBookmarks))
  }

  const cycleFontSize = () => {
    const sizes = [13, 14, 15, 16, 17, 18]
    const currentIdx = sizes.indexOf(fontSize)
    const nextIdx = (currentIdx + 1) % sizes.length
    setFontSize(sizes[nextIdx])
  }

  return (
    <div className="app-container">
      <Sidebar
        activeId={activeId}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
      />

      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <button
              className="icon-button mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {activeNotebook && (
              <>
                <button
                  className="icon-button"
                  onClick={() => handleSelect(null)}
                  title="返回首页"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="top-bar-title">{activeNotebook.title}</span>
              </>
            )}
          </div>
          <div className="top-bar-right">
            {activeNotebook && (
              <button
                className={`icon-button ${bookmarks.includes(activeNotebook.id) ? 'active' : ''}`}
                onClick={() => toggleBookmark(activeNotebook.id)}
                title={bookmarks.includes(activeNotebook.id) ? '取消书签' : '添加书签'}
              >
                <StickyNote size={18} />
              </button>
            )}
            <button
              className="icon-button"
              onClick={cycleFontSize}
              title="调整字号"
            >
              <Type size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? '深色模式' : '浅色模式'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {activeNotebook ? (
          loading ? (
            <div className="loading-spinner">
              <Loader2 size={24} className="animate-spin" />
              <span className="loading-spinner-text">加载中...</span>
            </div>
          ) : activeContent ? (
            <NotebookViewer
              notebook={activeNotebook}
              rawContent={activeContent}
              onBack={() => handleSelect(null)}
            />
          ) : (
            <div className="loading-spinner">
              <span className="loading-spinner-text">无法加载 Notebook 内容</span>
            </div>
          )
        ) : (
          <Welcome onStart={handleStart} />
        )}
      </div>
    </div>
  )
}
