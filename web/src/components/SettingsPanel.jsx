import { X, Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsContext } from '../context/SettingsContext.jsx'

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: '浅色' },
  { value: 'system', icon: Monitor, label: '跟随系统' },
  { value: 'dark', icon: Moon, label: '深色' },
]

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'S', size: '小' },
  { value: 'default', label: 'M', size: '中' },
  { value: 'large', label: 'L', size: '大' },
]

export default function SettingsPanel({ isOpen, onClose }) {
  const { settings, updateSettings, toggleTheme, resolvedTheme } = useSettingsContext()

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>设置</h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* 主题 */}
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] mb-3 tracking-wide uppercase">
              主题
            </div>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = settings.theme === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ theme: opt.value })}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-semibold ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 字号 */}
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] mb-3 tracking-wide uppercase">
              正文字号
            </div>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map(opt => {
                const active = settings.fontSize === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ fontSize: opt.value })}
                    className={`flex-1 py-2.5 rounded-xl border transition-all font-bold ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
                    }`}
                    title={opt.size}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
