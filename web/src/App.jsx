import { useState, useEffect, useCallback } from 'react'
import { useSettings } from './hooks/useSettings'
import { useNotesAndBookmarks } from './hooks/useNotesAndBookmarks'
import Sidebar from './components/Sidebar'
import NotebookViewer from './components/NotebookViewer'
import Welcome from './components/Welcome'
import NotesPanel from './components/NotesPanel'
import SettingsPanel from './components/SettingsPanel'
import Header from './components/Header'
import ImageLightbox from './components/ImageLightbox'
import { config } from './config'

function App() {
  const { settings, updateSettings } = useSettings()
  const notesHook = useNotesAndBookmarks()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentNotebook, setCurrentNotebook] = useState(null)
  const [currentPath, setCurrentPath] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)

  // 从 URL hash 恢复状态
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && hash.startsWith('notebook/')) {
      const path = hash.replace('notebook/', '')
      setCurrentPath(path)
      setShowWelcome(false)
    }
  }, [])

  const handleSelectNotebook = useCallback((path) => {
    setCurrentPath(path)
    setCurrentNotebook(null)
    setShowWelcome(false)
    setSidebarOpen(false)
    window.location.hash = `notebook/${path}`
  }, [])

  const handleBackToWelcome = useCallback(() => {
    setShowWelcome(true)
    setCurrentPath(null)
    setCurrentNotebook(null)
    window.location.hash = ''
  }, [])

  const handleImageClick = useCallback((src) => {
    setLightboxImage(src)
  }, [])

  const t = settings.language === 'zh' ? {
    welcome: '欢迎',
    notes: '笔记',
    settings: '设置',
    menu: '菜单',
    close: '关闭'
  } : {
    welcome: 'Welcome',
    notes: 'Notes',
    settings: 'Settings',
    menu: 'Menu',
    close: 'Close'
  }

  return (
    <div className="min-h-screen transition-theme" style={{ background: 'var(--bg)' }}>
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onNotesClick={() => setShowNotes(true)}
        onSettingsClick={() => setShowSettings(true)}
        onHomeClick={handleBackToWelcome}
        language={settings.language}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
        onSelectNotebook={handleSelectNotebook}
        language={settings.language}
        bookmarks={notesHook.bookmarks}
      />

      <main className="pt-14">
        {showWelcome ? (
          <Welcome
            onSelectNotebook={handleSelectNotebook}
            language={settings.language}
          />
        ) : (
          <NotebookViewer
            path={currentPath}
            notebook={currentNotebook}
            setNotebook={setCurrentNotebook}
            onImageClick={handleImageClick}
            language={settings.language}
            notesHook={notesHook}
          />
        )}
      </main>

      {showNotes && (
        <NotesPanel
          isOpen={showNotes}
          onClose={() => setShowNotes(false)}
          notesHook={notesHook}
          currentNotebook={currentPath}
          language={settings.language}
        />
      )}

      {showSettings && (
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          updateSettings={updateSettings}
          language={settings.language}
        />
      )}

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  )
}

export default App
