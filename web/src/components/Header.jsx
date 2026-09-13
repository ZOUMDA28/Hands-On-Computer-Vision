import { Menu, BookOpen, StickyNote, Settings, Home } from 'lucide-react'
import { config } from '../config'

export default function Header({ onMenuClick, onNotesClick, onSettingsClick, onHomeClick, language }) {
  const t = language === 'zh' ? {
    title: '计算机视觉自学与实践',
    menu: '菜单',
    notes: '笔记',
    settings: '设置',
    home: '首页'
  } : {
    title: 'Hands-On Computer Vision',
    menu: 'Menu',
    notes: 'Notes',
    settings: 'Settings',
    home: 'Home'
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 h-14 border-b backdrop-blur-md transition-theme"
      style={{ 
        background: 'rgba(var(--bg-secondary), 0.8)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors lg:hidden"
            style={{ color: 'var(--text)' }}
            aria-label={t.menu}
          >
            <Menu size={20} />
          </button>
          
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))`
              }}
            >
              <BookOpen size={18} className="text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {config.site.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.title}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onHomeClick}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={t.home}
            title={t.home}
          >
            <Home size={20} />
          </button>
          <button
            onClick={onNotesClick}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={t.notes}
            title={t.notes}
          >
            <StickyNote size={20} />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={t.settings}
            title={t.settings}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
