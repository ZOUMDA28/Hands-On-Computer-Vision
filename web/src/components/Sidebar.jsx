import { useState, useMemo } from 'react'
import { X, ChevronDown, ChevronRight, BookMarked, Layers } from 'lucide-react'
import { PATH_STEPS, RUNNABLE_NOTEBOOKS } from '../data/sidebar'

export default function Sidebar({ isOpen, onClose, currentPath, onSelectNotebook, language, bookmarks }) {
  const [expandedSections, setExpandedSections] = useState(['part1-image-processing', 'part2-optimization-3d'])
  const [activeTab, setActiveTab] = useState('chapters') // 'chapters' | 'bookmarks'

  const t = language === 'zh' ? {
    chapters: '章节目录',
    bookmarks: '我的书签',
    noBookmarks: '暂无书签',
    part1: '第一部分：图像处理基础',
    part2: '第二部分：最优化与立体视觉',
    extra: '补充练习'
  } : {
    chapters: 'Chapters',
    bookmarks: 'Bookmarks',
    noBookmarks: 'No bookmarks yet',
    part1: 'Part 1: Image Processing',
    part2: 'Part 2: Optimization & 3D',
    extra: 'Extra Practice'
  }

  const chapters = useMemo(() => [
    {
      id: 'part1-image-processing',
      title: t.part1,
      notebooks: [
        { path: 'part1-image-processing/01-digital-image.ipynb', title: language === 'zh' ? '数字图像的获取和表示' : 'Digital Image Acquisition', hasExtra: false },
        { path: 'part1-image-processing/02-color-space.ipynb', title: language === 'zh' ? '颜色空间的转换' : 'Color Space Conversion', hasExtra: false },
        { path: 'part1-image-processing/03-histogram.ipynb', title: language === 'zh' ? '基于直方图统计的处理' : 'Histogram Processing', hasExtra: false },
        { path: 'part1-image-processing/04-image-filtering.ipynb', title: language === 'zh' ? '图像滤波' : 'Image Filtering', hasExtra: true },
        { path: 'part1-image-processing/05-feature-extraction.ipynb', title: language === 'zh' ? '特征提取' : 'Feature Extraction', hasExtra: true },
        { path: 'part1-image-processing/06-geometric-transform.ipynb', title: language === 'zh' ? '几何变换' : 'Geometric Transform', hasExtra: false }
      ]
    },
    {
      id: 'part2-optimization-3d',
      title: t.part2,
      notebooks: [
        { path: 'part2-optimization-3d/01-image-stitching.ipynb', title: language === 'zh' ? '图像拼接模型' : 'Image Stitching', hasExtra: true },
        { path: 'part2-optimization-3d/02-camera-calibration.ipynb', title: language === 'zh' ? '相机参数标定' : 'Camera Calibration', hasExtra: true },
        { path: 'part2-optimization-3d/03-stereo-reconstruction.ipynb', title: language === 'zh' ? '立体视觉点云重建' : 'Stereo Reconstruction', hasExtra: true }
      ]
    }
  ], [language, t])

  const toggleSection = (id) => {
    setExpandedSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-70 border-r transition-transform duration-300 ease-out lg:translate-x-0 transition-theme`}
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* 头部 */}
        <div 
          className="h-14 flex items-center justify-between px-4 border-b transition-theme"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors`}
              style={{ 
                color: activeTab === 'chapters' ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === 'chapters' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <Layers size={16} className="inline mr-1.5 -mt-0.5" />
              {t.chapters}
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors`}
              style={{ 
                color: activeTab === 'bookmarks' ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === 'bookmarks' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <BookMarked size={16} className="inline mr-1.5 -mt-0.5" />
              {t.bookmarks}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-opacity-10 hover:bg-gray-500 lg:hidden"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto h-[calc(100%-3.5rem)] p-3">
          {activeTab === 'chapters' ? (
            <div className="space-y-1">
              {chapters.map(section => (
                <div key={section.id}>
                  {/* 分区标题 */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span className="flex-1 text-left">{section.title}</span>
                  </button>
                  
                  {/* Notebook 列表 */}
                  {expandedSections.includes(section.id) && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {section.notebooks.map((nb, idx) => (
                        <div key={nb.path} className="space-y-0.5">
                          <button
                            onClick={() => onSelectNotebook(nb.path)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors`}
                            style={{
                              background: currentPath === nb.path ? 'var(--accent-soft)' : 'transparent',
                              color: currentPath === nb.path ? 'var(--accent)' : 'var(--text-secondary)'
                            }}
                          >
                            <span className="mr-2" style={{ color: 'var(--text-muted)' }}>{String(idx + 1).padStart(2, '0')}</span>
                            {nb.title}
                          </button>
                          {nb.hasExtra && (
                            <button
                              onClick={() => onSelectNotebook(nb.path.replace('.ipynb', '-extra.ipynb'))}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ml-6`}
                              style={{
                                background: currentPath === nb.path.replace('.ipynb', '-extra.ipynb') ? 'var(--accent-soft)' : 'transparent',
                                color: currentPath === nb.path.replace('.ipynb', '-extra.ipynb') ? 'var(--accent)' : 'var(--text-muted)'
                              }}
                            >
                              + {t.extra}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {bookmarks.length === 0 ? (
                <div 
                  className="text-center py-12 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BookMarked size={32} className="mx-auto mb-3 opacity-30" />
                  {t.noBookmarks}
                </div>
              ) : (
                <div className="space-y-1">
                  {bookmarks.map(bm => (
                    <button
                      key={bm.id}
                      onClick={() => {
                        onSelectNotebook(bm.notebookId)
                        onClose()
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <div className="font-medium" style={{ color: 'var(--text)' }}>{bm.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{bm.notebookId}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
