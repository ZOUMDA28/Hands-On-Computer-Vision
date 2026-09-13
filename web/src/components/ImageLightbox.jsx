import { useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

export default function ImageLightbox({ src, onClose }) {
  const [scale, setScale] = useState(1)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 3))
    if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5))
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={24} />
      </button>

      {/* 缩放控制 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(s - 0.25, 0.5)) }}
          className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-white/80 text-sm min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(s + 0.25, 3)) }}
          className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* 图片 */}
      <div 
        className="max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt=""
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease'
          }}
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>
    </div>
  )
}
