import { BookOpen, Code, Eye, Camera, Layers, Box, ChevronRight, Github, Sparkles } from 'lucide-react'
import { PATH_STEPS, RUNNABLE_NOTEBOOKS } from '../data/sidebar'
import { config } from '../config'

export default function Welcome({ onSelectNotebook, language }) {
  const t = language === 'zh' ? {
    subtitle: '从像素基础到三维重建的编程实践教程',
    description: '围绕图像处理基础与最优化算法两条主线，提供从像素到三维重建的编程实践 Notebook。能手写的不调库，算法核心全部手写实现并与 OpenCV 做数值对比验证。',
    startLearning: '开始学习',
    viewAll: '查看全部',
    featured: '精选教程',
    learningPath: '学习路径',
    chapters: '章节',
    notebooks: '个 Notebook',
    principle: '核心原则',
    principleText: '能手写的不调库。除明确允许的读写/矩阵计算/特征提取匹配部分外，算法核心全部手写；手写实现必须与可信库做数值对比验证。',
    features: '课程特色',
    feature1: '手写实现',
    feature1Desc: '算法全部从零手写，深入理解原理',
    feature2: '对比验证',
    feature2Desc: '与 OpenCV 数值对比，确保正确性',
    feature3: '可视化',
    feature3Desc: '每一步都有结果可视化，直观易懂',
    feature4: '可复现',
    feature4Desc: '统一随机种子，结果完全可复现',
    part1Desc: '从像素操作到特征提取，掌握图像处理核心算法',
    part2Desc: '图像拼接、相机标定到三维点云重建'
  } : {
    subtitle: 'Programming practice from pixel basics to 3D reconstruction',
    description: 'Focusing on image processing fundamentals and optimization algorithms, providing programming practice notebooks from pixels to 3D reconstruction. All algorithm cores are hand-written and numerically verified against OpenCV.',
    startLearning: 'Start Learning',
    viewAll: 'View All',
    featured: 'Featured Tutorials',
    learningPath: 'Learning Path',
    chapters: 'Chapters',
    notebooks: 'Notebooks',
    principle: 'Core Principle',
    principleText: 'Hand-write what you can. Except for explicitly allowed I/O/matrix computation/feature extraction matching parts, all algorithm cores are hand-written; hand-written implementations must be numerically compared and verified against trusted libraries.',
    features: 'Course Features',
    feature1: 'Hand-written Implementation',
    feature1Desc: 'All algorithms written from scratch, deep understanding',
    feature2: 'Comparison & Verification',
    feature2Desc: 'Numerical comparison with OpenCV ensures correctness',
    feature3: 'Visualization',
    feature3Desc: 'Results visualized at every step, intuitive and clear',
    feature4: 'Reproducible',
    feature4Desc: 'Unified random seeds, fully reproducible results',
    part1Desc: 'From pixel manipulation to feature extraction, master core image processing algorithms',
    part2Desc: 'From image stitching, camera calibration to 3D point cloud reconstruction'
  }

  const partIcons = [Layers, Box]
  const featureIcons = [Code, Eye, Sparkles, Camera]

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--brand-gradient-from) 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, var(--brand-gradient-to) 0%, transparent 50%)`
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <BookOpen size={16} />
            <span>Hands-On Computer Vision</span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--text)' }}
          >
            <span style={{
              background: `linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              计算机视觉
            </span>
            <br />
            自学与实践教程
          </h1>
          
          <p 
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onSelectNotebook('part1-image-processing/01-digital-image.ipynb')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ 
                background: `linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))`
              }}
            >
              {t.startLearning}
              <ChevronRight size={20} />
            </button>
            <a
              href={config.site.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-colors hover:bg-opacity-5 hover:bg-gray-500"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              <Github size={20} />
              GitHub
            </a>
          </div>

          {/* 统计 */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>9</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.chapters}</div>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>14</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.notebooks}</div>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>2</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{language === 'zh' ? '大模块' : 'Modules'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心原则 */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div 
          className="p-6 md:p-8 rounded-2xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl flex-shrink-0"
              style={{ background: 'var(--accent-soft)' }}
            >
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {t.principle}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t.principleText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学习路径 */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
          {t.learningPath}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {PATH_STEPS.map((step, idx) => {
            const Icon = partIcons[idx] || Layers
            return (
              <div
                key={step.section}
                className="p-6 rounded-2xl border transition-all hover:shadow-lg cursor-pointer group"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  borderColor: 'var(--border)'
                }}
                onClick={() => onSelectNotebook(
                  step.section === 'part1-image-processing' 
                    ? 'part1-image-processing/01-digital-image.ipynb'
                    : 'part2-optimization-3d/01-image-stitching.ipynb'
                )}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: `linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))`
                    }}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-sm font-mono"
                        style={{ color: 'var(--accent)' }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                      {language === 'zh' ? step.title : step.titleEn}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'zh' ? step.desc : step.descEn}
                    </p>
                    <div 
                      className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                      style={{ color: 'var(--accent)' }}
                    >
                      {t.startLearning}
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 精选教程 */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
          {t.featured}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RUNNABLE_NOTEBOOKS.slice(0, 6).map((nb) => (
            <button
              key={nb.id}
              onClick={() => onSelectNotebook(`${nb.section}/${nb.lessonId}.ipynb`)}
              className="text-left p-5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ 
                background: 'var(--bg-secondary)', 
                borderColor: 'var(--border)' 
              }}
            >
              <h4 className="font-medium mb-2" style={{ color: 'var(--text)' }}>
                {language === 'zh' ? nb.title : nb.titleEn}
              </h4>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {language === 'zh' ? nb.desc : nb.descEn}
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{nb.duration} min</span>
                <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 课程特色 */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
          {t.features}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t.feature1, desc: t.feature1Desc },
            { title: t.feature2, desc: t.feature2Desc },
            { title: t.feature3, desc: t.feature3Desc },
            { title: t.feature4, desc: t.feature4Desc }
          ].map((feature, idx) => {
            const Icon = featureIcons[idx] || Code
            return (
              <div key={idx} className="text-center">
                <div 
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <Icon size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{feature.title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>
            {config.site.title} © {new Date().getFullYear()}
            {' · '}
            <a href={config.site.repo} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              GitHub
            </a>
            {' · '}
            <span>CC BY-NC-SA 4.0</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
