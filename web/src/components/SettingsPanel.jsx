import { X, Sun, Moon, Monitor, Type, Globe } from 'lucide-react'

export default function SettingsPanel({ isOpen, onClose, settings, updateSettings, language }) {
  const t = language === 'zh' ? {
    settings: '设置',
    close: '关闭',
    appearance: '外观',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    fontSize: '字号',
    small: '小',
    default: '默认',
    large: '大',
    language: '语言',
    chinese: '中文',
    english: 'English'
  } : {
    settings: 'Settings',
    close: 'Close',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    fontSize: 'Font Size',
    small: 'Small',
    default: 'Default',
    large: 'Large',
    language: 'Language',
    chinese: '中文',
    english: 'English'
  }

  if (!isOpen) return null

  const themeOptions = [
    { value: 'light', label: t.light, icon: Sun },
    { value: 'dark', label: t.dark, icon: Moon },
    { value: 'system', label: t.system, icon: Monitor }
  ]

  const fontSizeOptions = [
    { value: 'small', label: t.small },
    { value: 'default', label: t.default },
    { value: 'large', label: t.large }
  ]

  return (
    <>
      {/* 遮罩 */}
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-sm z-50 shadow-2xl border-l transition-theme"
        style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        {/* 头部 */}
        <div 
          className="h-14 flex items-center justify-between px-4 border-b transition-theme"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{t.settings}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-opacity-10 hover:bg-gray-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-6">
          {/* 主题 */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Sun size={16} style={{ color: 'var(--text-muted)' }} />
              {t.theme}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(option => {
                const Icon = option.icon
                const isActive = settings.theme === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ theme: option.value })}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all`}
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 字号 */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Type size={16} style={{ color: 'var(--text-muted)' }} />
              {t.fontSize}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {fontSizeOptions.map(option => {
                const isActive = settings.fontSize === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ fontSize: option.value })}
                    className={`py-2.5 px-2 rounded-xl border transition-all text-sm font-medium`}
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Globe size={16} style={{ color: 'var(--text-muted)' }} />
              {t.language}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'zh', label: t.chinese },
                { value: 'en', label: t.english }
              ].map(option => {
                const isActive = settings.language === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ language: option.value })}
                    className={`py-2.5 px-4 rounded-xl border transition-all text-sm font-medium`}
                    style={{
                      background: isActive ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
