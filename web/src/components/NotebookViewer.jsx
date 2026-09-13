import { useState, useEffect, useRef, useCallback } from 'react'
import { loadNotebook, prefetchNotebook } from '../data/notebooks'
import { ChevronDown, ChevronRight, Copy, Check, BookMarked, StickyNote, Loader } from 'lucide-react'

export default function NotebookViewer({ path, notebook, setNotebook, onImageClick, language, notesHook }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tocItems, setTocItems] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)
  const [collapsedCells, setCollapsedCells] = useState(new Set())
  const [copiedCell, setCopiedCell] = useState(null)
  const contentRef = useRef(null)
  const observerRef = useRef(null)

  const t = language === 'zh' ? {
    loading: '加载中...',
    error: '加载失败',
    retry: '重试',
    outline: '本节目录',
    copyCode: '复制代码',
    copied: '已复制',
    collapse: '折叠',
    expand: '展开',
    output: '输出',
    addBookmark: '添加书签',
    removeBookmark: '移除书签',
    addNote: '添加笔记'
  } : {
    loading: 'Loading...',
    error: 'Failed to load',
    retry: 'Retry',
    outline: 'Outline',
    copyCode: 'Copy code',
    copied: 'Copied',
    collapse: 'Collapse',
    expand: 'Expand',
    output: 'Output',
    addBookmark: 'Add bookmark',
    removeBookmark: 'Remove bookmark',
    addNote: 'Add note'
  }

  // 加载 Notebook
  useEffect(() => {
    if (!path) return
    
    setLoading(true)
    setError(null)
    
    loadNotebook(path)
      .then(data => {
        setNotebook(data)
        setTocItems(data.headings)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [path, setNotebook])

  // 预取相邻 Notebook
  useEffect(() => {
    // 可以在这里添加预取逻辑
  }, [path])

  // 滚动监听 - 活跃标题
  useEffect(() => {
    if (!notebook || !contentRef.current) return
    
    const headings = contentRef.current.querySelectorAll('[data-heading-id]')
    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          setActiveHeading(top.target.dataset.headingId)
        }
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 1 }
    )

    headings.forEach(h => observerRef.current.observe(h))
    return () => observerRef.current?.disconnect()
  }, [notebook])

  const toggleCell = useCallback((cellId) => {
    setCollapsedCells(prev => {
      const next = new Set(prev)
      if (next.has(cellId)) {
        next.delete(cellId)
      } else {
        next.add(cellId)
      }
      return next
    })
  }, [])

  const copyCode = useCallback(async (code, cellId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCell(cellId)
      setTimeout(() => setCopiedCell(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [])

  const scrollToHeading = useCallback((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>{t.loading}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <p style={{ color: 'var(--error)' }} className="mb-4">{t.error}: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t.retry}
          </button>
        </div>
      </div>
    )
  }

  if (!notebook) return null

  return (
    <div className="flex">
      {/* 主内容区 */}
      <div className="flex-1 min-w-0">
        <div ref={contentRef} className="notebook-content px-6 py-8 max-w-4xl mx-auto">
          {notebook.cells.map((cell, idx) => {
            const isCollapsed = collapsedCells.has(cell.id)
            
            if (cell.type === 'markdown') {
              // 查找对应的 heading id
              const heading = notebook.headings.find(h => h.cellIndex === idx)
              
              return (
                <div 
                  key={cell.id} 
                  id={heading?.id}
                  data-heading-id={heading?.id || ''}
                  className="markdown-cell scroll-mt-20"
                  dangerouslySetInnerHTML={{ __html: cell.content }}
                  onClick={(e) => {
                    // 图片点击放大
                    if (e.target.tagName === 'IMG') {
                      onImageClick(e.target.src)
                    }
                  }}
                />
              )
            }
            
            if (cell.type === 'code') {
              return (
                <div key={cell.id} className="code-cell group">
                  <div className="code-cell-header">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCell(cell.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        title={isCollapsed ? t.expand : t.collapse}
                      >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {cell.execution_count ? `[${cell.execution_count}]` : '[ ]'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyCode(cell.source, cell.id)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title={t.copyCode}
                      >
                        {copiedCell === cell.id ? (
                          <Check size={14} style={{ color: 'var(--success)' }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <pre className="!m-0 !rounded-none !bg-transparent">
                        <code 
                          className="language-python"
                          dangerouslySetInnerHTML={{ __html: cell.highlighted }}
                        />
                      </pre>
                      
                      {cell.outputs && cell.outputs.length > 0 && (
                        <div className="code-cell-output">
                          {cell.outputs.map((output, oIdx) => {
                            if (output.type === 'stream' || output.type === 'text') {
                              return <div key={oIdx} className="whitespace-pre-wrap">{output.text}</div>
                            }
                            if (output.type === 'image') {
                              return (
                                <img 
                                  key={oIdx} 
                                  src={output.src} 
                                  alt=""
                                  className="cursor-zoom-in max-w-full"
                                  onClick={() => onImageClick(output.src)}
                                />
                              )
                            }
                            if (output.type === 'error') {
                              return (
                                <div key={oIdx} style={{ color: 'var(--error)' }} className="whitespace-pre-wrap">
                                  {output.traceback.join('\n')}
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            }
            
            return null
          })}
        </div>
      </div>

      {/* 右侧大纲 */}
      <div 
        className="hidden xl:block w-60 flex-shrink-0 border-l transition-theme"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="sticky top-20 p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h4 
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.outline}
          </h4>
          <nav className="space-y-1">
            {tocItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors`}
                style={{
                  paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                  color: activeHeading === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                  background: activeHeading === item.id ? 'var(--accent-soft)' : 'transparent',
                  fontWeight: activeHeading === item.id ? 500 : 400
                }}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
