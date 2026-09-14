import { useEffect, useState } from 'react'
import {
  BookOpen, ArrowRight, Check, Layers, Cpu, Star,
  Monitor, ChevronRight, CodeXml, Sparkles, Github,
  Image as ImageIcon, Target, Route, Zap,
} from 'lucide-react'
import { GITHUB_OWNER, GITHUB_REPO, GITHUB_REPO_URL } from '../config.js'
import { PATH_STEPS, RUNNABLE_NOTEBOOKS } from '../data/sidebar.js'

const GITHUB_STARS_CACHE_KEY = `github-stars:${GITHUB_OWNER}/${GITHUB_REPO}`

function formatStarCount(count) {
  if (typeof count !== 'number') return '--'
  return count.toLocaleString('zh-CN')
}

// Section styles for the two learning paths
const SECTION_STYLES = {
  'image-processing': {
    bg: 'from-[#dbeafe] to-[#e0f2fe]',
    tag: 'bg-blue-50 text-blue-600 border-blue-200/50',
    name: '图像处理',
    accent: 'blue',
    iconBg: 'bg-blue-100 text-blue-600 border-blue-200/50',
    pathBorder: 'border-l-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    soft: 'bg-blue-50 border-blue-200/50 text-blue-600',
  },
  'optimization-3d': {
    bg: 'from-[#ede9fe] to-[#f5f3ff]',
    tag: 'bg-purple-50 text-purple-600 border-purple-200/50',
    name: '立体视觉',
    accent: 'purple',
    iconBg: 'bg-purple-100 text-purple-600 border-purple-200/50',
    pathBorder: 'border-l-purple-400',
    gradient: 'from-purple-500 to-violet-500',
    soft: 'bg-purple-50 border-purple-200/50 text-purple-600',
  },
}

// Notebook background gradients (CV theme colors)
const NOTEBOOK_BG = {
  'nb-1': 'from-[#eff6ff] to-[#bfdbfe]',     // 图像基础 - soft blue
  'nb-2': 'from-[#ecfeff] to-[#a5f3fc]',     // 几何变换 - cyan
  'nb-3': 'from-[#f0fdf4] to-[#86efac]',     // 图像滤波 - green
  'nb-4': 'from-[#fef3c7] to-[#fcd34d]',     // 特征检测 - amber
  'nb-5': 'from-[#ffedd5] to-[#fdba74]',     // 图像分割 - orange
  'nb-6': 'from-[#fce7f3] to-[#f9a8d4]',     // 形态学 - pink
  'nb-7': 'from-[#ede9fe] to-[#c4b5fd]',     // 频域处理 - purple
  'nb-8': 'from-[#dbeafe] to-[#60a5fa]',     // 最优化 - vivid blue
  'nb-9': 'from-[#f0fdfa] to-[#5eead4]',     // 相机标定 - teal
  'nb-10': 'from-[#faf5ff] to-[#d8b4fe]',    // 立体视觉 - violet
}

// Notebook SVG icons (10 CV-themed)
const NOTEBOOK_SVGS = {
  // 1. 图像基础 - 像素网格
  'nb-1': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Pixel grid */}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const x = 10 + col * 9
          const y = 10 + row * 9
          const intensity = (row + col) % 5
          const opacity = 0.2 + intensity * 0.18
          return (
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width="7"
              height="7"
              rx="1"
              fill="#3b82f6"
              opacity={opacity}
            />
          )
        })
      )}
      {/* Magnifier on corner */}
      <circle cx="44" cy="44" r="10" fill="white" opacity="0.9" />
      <circle cx="44" cy="44" r="8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="40" y="40" width="3" height="3" fill="#3b82f6" opacity="0.8" />
      <rect x="44" y="40" width="3" height="3" fill="#3b82f6" opacity="0.5" />
      <rect x="40" y="44" width="3" height="3" fill="#3b82f6" opacity="0.6" />
      <rect x="44" y="44" width="3" height="3" fill="#3b82f6" opacity="0.9" />
    </svg>
  ),
  // 2. 几何变换 - 旋转箭头
  'nb-2': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Image frame */}
      <rect x="8" y="12" width="22" height="18" rx="2" fill="#0891b2" opacity="0.3" />
      <rect x="10" y="14" width="8" height="6" rx="1" fill="#0891b2" opacity="0.5" />
      <rect x="20" y="14" width="8" height="6" rx="1" fill="#0891b2" opacity="0.4" />
      <rect x="10" y="22" width="8" height="6" rx="1" fill="#0891b2" opacity="0.4" />
      <rect x="20" y="22" width="8" height="6" rx="1" fill="#0891b2" opacity="0.6" />
      {/* Rotation arrow */}
      <path
        d="M 30 22 Q 42 22 42 32 Q 42 42 32 42"
        fill="none"
        stroke="#0891b2"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <polygon points="32,42 28,38 36,38" fill="#0891b2" opacity="0.7" />
      {/* Transformed image (rotated) */}
      <g transform="translate(44, 38) rotate(-20)">
        <rect x="-10" y="-8" width="20" height="16" rx="2" fill="#06b6d4" opacity="0.5" />
        <rect x="-8" y="-6" width="7" height="5" rx="1" fill="#06b6d4" opacity="0.7" />
        <rect x="1" y="-6" width="7" height="5" rx="1" fill="#06b6d4" opacity="0.6" />
        <rect x="-8" y="1" width="7" height="5" rx="1" fill="#06b6d4" opacity="0.6" />
        <rect x="1" y="1" width="7" height="5" rx="1" fill="#06b6d4" opacity="0.8" />
      </g>
    </svg>
  ),
  // 3. 图像滤波 - 卷积核
  'nb-3': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Input image grid */}
      <rect x="5" y="10" width="24" height="24" rx="2" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.4" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const x = 6 + col * 6
          const y = 11 + row * 6
          const val = (row * 4 + col + 1) % 9
          const opacity = 0.15 + val * 0.08
          return (
            <rect
              key={`in-${row}-${col}`}
              x={x}
              y={y}
              width="5"
              height="5"
              rx="0.5"
              fill="#16a34a"
              opacity={opacity}
            />
          )
        })
      )}
      {/* Convolution kernel */}
      <rect x="30" y="18" width="20" height="20" rx="2" fill="#22c55e" opacity="0.2" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="2 1" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 32 + col * 6
          const y = 20 + row * 6
          const vals = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]
          const val = vals[row][col]
          return (
            <text
              key={`k-${row}-${col}`}
              x={x + 3}
              y={y + 4.5}
              fontSize="6"
              fontFamily="monospace"
              fill="#16a34a"
              textAnchor="middle"
              fontWeight="bold"
              opacity={val === 8 ? 1 : 0.6}
            >
              {val}
            </text>
          )
        })
      )}
      {/* Arrow */}
      <path d="M 30 28 L 28 28" stroke="#16a34a" strokeWidth="2" markerEnd="none" />
      {/* Output pixel */}
      <rect x="45" y="44" width="12" height="12" rx="2" fill="#22c55e" opacity="0.6" />
      <text x="51" y="53" fontSize="7" fontFamily="monospace" fill="white" textAnchor="middle" fontWeight="bold">out</text>
      <path
        d="M 42 36 L 48 42"
        stroke="#16a34a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  ),
  // 4. 特征检测 - 角点
  'nb-4': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Image with edges */}
      <rect x="8" y="8" width="44" height="44" rx="3" fill="#fef3c7" opacity="0.3" />
      {/* Edge lines forming corners */}
      <line x1="15" y1="15" x2="45" y2="15" stroke="#d97706" strokeWidth="2" opacity="0.4" />
      <line x1="15" y1="15" x2="15" y2="45" stroke="#d97706" strokeWidth="2" opacity="0.4" />
      <line x1="45" y1="15" x2="45" y2="35" stroke="#d97706" strokeWidth="2" opacity="0.4" />
      <line x1="15" y1="45" x2="35" y2="45" stroke="#d97706" strokeWidth="2" opacity="0.4" />
      <line x1="45" y1="35" x2="35" y2="45" stroke="#d97706" strokeWidth="2" opacity="0.4" />
      {/* Corner points highlighted */}
      <circle cx="15" cy="15" r="5" fill="#f59e0b" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="15" r="4" fill="#f59e0b" opacity="0.7" />
      <circle cx="15" cy="45" r="4" fill="#f59e0b" opacity="0.7" />
      <circle cx="35" cy="45" r="5" fill="#f59e0b" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="45" cy="35" r="3.5" fill="#f59e0b" opacity="0.6" />
      {/* Inner corner */}
      <line x1="25" y1="25" x2="35" y2="25" stroke="#d97706" strokeWidth="1.5" opacity="0.5" />
      <line x1="25" y1="25" x2="25" y2="35" stroke="#d97706" strokeWidth="1.5" opacity="0.5" />
      <circle cx="25" cy="25" r="3" fill="#fbbf24" opacity="0.8" />
    </svg>
  ),
  // 5. 图像分割 - 分区色块
  'nb-5': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Segmented regions */}
      <path d="M 8 12 L 28 12 L 24 30 L 8 28 Z" fill="#f97316" opacity="0.5" />
      <path d="M 28 12 L 52 12 L 52 26 L 38 28 L 24 30 Z" fill="#fb923c" opacity="0.4" />
      <path d="M 8 28 L 24 30 L 22 48 L 8 50 Z" fill="#fdba74" opacity="0.5" />
      <path d="M 24 30 L 38 28 L 42 42 L 30 50 L 22 48 Z" fill="#f97316" opacity="0.6" />
      <path d="M 52 26 L 52 50 L 30 50 L 42 42 L 38 28 Z" fill="#ea580c" opacity="0.4" />
      {/* Region boundaries */}
      <path d="M 28 12 L 24 30 L 8 28" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.6" />
      <path d="M 24 30 L 38 28 L 52 26" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.6" />
      <path d="M 24 30 L 22 48 L 30 50 L 42 42 L 38 28" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.6" />
      {/* Labels */}
      <text x="17" y="22" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">A</text>
      <text x="38" y="20" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">B</text>
      <text x="14" y="40" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">C</text>
      <text x="29" y="40" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">D</text>
      <text x="45" y="40" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">E</text>
    </svg>
  ),
  // 6. 形态学 - 形状操作
  'nb-6': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Original shape (noisy) */}
      <g transform="translate(15, 15)">
        <circle cx="6" cy="6" r="4" fill="#ec4899" opacity="0.3" />
        <circle cx="14" cy="5" r="5" fill="#ec4899" opacity="0.35" />
        <circle cx="8" cy="12" r="4" fill="#ec4899" opacity="0.4" />
        <circle cx="16" cy="14" r="4.5" fill="#ec4899" opacity="0.3" />
        <circle cx="22" cy="10" r="3.5" fill="#ec4899" opacity="0.25" />
        <circle cx="12" cy="20" r="3" fill="#ec4899" opacity="0.3" />
      </g>
      {/* Arrow */}
      <path d="M 32 25 L 40 25" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <polygon points="40,25 36,22 36,28" fill="#ec4899" opacity="0.6" />
      {/* Eroded shape (cleaner) */}
      <g transform="translate(42, 18)">
        <ellipse cx="5" cy="8" rx="5" ry="6" fill="#ec4899" opacity="0.6" />
        <ellipse cx="11" cy="10" rx="5" ry="5" fill="#ec4899" opacity="0.7" />
      </g>
      {/* Structuring element */}
      <rect x="8" y="40" width="14" height="14" rx="2" fill="#fdf2f8" stroke="#ec4899" strokeWidth="1" opacity="0.6" />
      <rect x="11" y="43" width="8" height="8" rx="1" fill="#ec4899" opacity="0.5" />
      <text x="15" y="60" fontSize="7" fill="#ec4899" textAnchor="middle" opacity="0.7">SE</text>
    </svg>
  ),
  // 7. 频域处理 - 波形
  'nb-7': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Frequency domain grid */}
      <rect x="5" y="8" width="22" height="22" rx="2" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
      {/* Center frequency peak */}
      <circle cx="16" cy="19" r="5" fill="#7c3aed" opacity="0.7" />
      <circle cx="16" cy="19" r="3" fill="#a78bfa" opacity="0.9" />
      {/* Side frequency components */}
      <circle cx="8" cy="12" r="2" fill="#7c3aed" opacity="0.3" />
      <circle cx="24" cy="12" r="2" fill="#7c3aed" opacity="0.3" />
      <circle cx="8" cy="26" r="2" fill="#7c3aed" opacity="0.3" />
      <circle cx="24" cy="26" r="2" fill="#7c3aed" opacity="0.3" />
      {/* Arrow to spatial domain */}
      <path d="M 30 19 L 36 19" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <polygon points="36,19 32,16 32,22" fill="#7c3aed" opacity="0.6" />
      <text x="33" y="15" fontSize="7" fill="#7c3aed" fontWeight="bold" opacity="0.6">IFFT</text>
      {/* Spatial waveform */}
      <rect x="38" y="8" width="18" height="22" rx="2" fill="#ede9fe" opacity="0.5" />
      <path
        d="M 40 19 Q 43 10 46 19 Q 49 28 52 19 Q 55 10 54 19"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* FFT label */}
      <text x="16" y="38" fontSize="8" fill="#7c3aed" textAnchor="middle" fontWeight="bold" opacity="0.7">频谱</text>
      <text x="47" y="38" fontSize="8" fill="#7c3aed" textAnchor="middle" fontWeight="bold" opacity="0.7">空域</text>
    </svg>
  ),
  // 8. 最优化 - 梯度下降曲线
  'nb-8': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Loss surface */}
      <rect x="5" y="5" width="50" height="45" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
      {/* Contour lines */}
      <ellipse cx="25" cy="32" rx="20" ry="12" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
      <ellipse cx="28" cy="30" rx="14" ry="8" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="30" cy="28" rx="8" ry="5" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
      {/* Minimum point */}
      <circle cx="30" cy="28" r="3" fill="#3b82f6" opacity="0.8" />
      <text x="30" y="24" fontSize="6" fill="#3b82f6" textAnchor="middle" fontWeight="bold">min</text>
      {/* Gradient descent path */}
      <polyline
        points="10,15 14,19 18,22 22,25 25,27 28,28"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Starting point */}
      <circle cx="10" cy="15" r="2.5" fill="#2563eb" opacity="0.9" />
      {/* Gradient arrows */}
      <path d="M 12 16.5 L 13.5 18" stroke="#1d4ed8" strokeWidth="1" markerEnd="none" />
      <path d="M 16 20.5 L 17.5 22" stroke="#1d4ed8" strokeWidth="1" markerEnd="none" />
      {/* Axes */}
      <line x1="5" y1="50" x2="55" y2="50" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      <line x1="5" y1="5" x2="5" y2="50" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      <text x="53" y="48" fontSize="6" fill="#3b82f6" opacity="0.6">w</text>
      <text x="7" y="8" fontSize="6" fill="#3b82f6" opacity="0.6">L</text>
    </svg>
  ),
  // 9. 相机标定 - 相机+网格
  'nb-9': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Camera body */}
      <rect x="6" y="14" width="20" height="14" rx="2" fill="#0d9488" opacity="0.7" />
      <rect x="12" y="10" width="8" height="5" rx="1" fill="#0d9488" opacity="0.6" />
      {/* Lens */}
      <circle cx="16" cy="21" r="5" fill="#14b8a6" opacity="0.8" />
      <circle cx="16" cy="21" r="3" fill="#0f766e" opacity="0.6" />
      <circle cx="16" cy="21" r="1.5" fill="#5eead4" opacity="0.8" />
      {/* Projection lines */}
      <line x1="26" y1="21" x2="38" y2="12" stroke="#14b8a6" strokeWidth="1" opacity="0.5" strokeDasharray="2 1" />
      <line x1="26" y1="21" x2="38" y2="30" stroke="#14b8a6" strokeWidth="1" opacity="0.5" strokeDasharray="2 1" />
      <line x1="26" y1="21" x2="44" y2="21" stroke="#14b8a6" strokeWidth="1" opacity="0.7" strokeDasharray="2 1" />
      {/* Image plane */}
      <line x1="35" y1="10" x2="35" y2="32" stroke="#0d9488" strokeWidth="1.5" opacity="0.6" />
      <text x="35" y="36" fontSize="6" fill="#0d9488" textAnchor="middle" opacity="0.7">像平面</text>
      {/* Calibration grid */}
      <g transform="translate(40, 38)">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => {
            const isDark = (row + col) % 2 === 0
            return (
              <rect
                key={`cb-${row}-${col}`}
                x={col * 3.5}
                y={row * 3.5}
                width="3.5"
                height="3.5"
                fill={isDark ? '#0d9488' : '#ccfbf1'}
                opacity={isDark ? 0.7 : 0.5}
              />
            )
          })
        )}
      </g>
      <text x="48" y="58" fontSize="6" fill="#0d9488" textAnchor="middle" opacity="0.7">标定板</text>
    </svg>
  ),
  // 10. 立体视觉 - 双目+深度
  'nb-10': (
    <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-80">
      {/* Two cameras */}
      <g transform="translate(8, 10)">
        <rect x="0" y="0" width="14" height="10" rx="2" fill="#7c3aed" opacity="0.7" />
        <circle cx="7" cy="5" r="3.5" fill="#a78bfa" opacity="0.8" />
        <circle cx="7" cy="5" r="2" fill="#5b21b6" opacity="0.6" />
        <text x="7" y="16" fontSize="6" fill="#7c3aed" textAnchor="middle" fontWeight="bold">左</text>
      </g>
      <g transform="translate(38, 10)">
        <rect x="0" y="0" width="14" height="10" rx="2" fill="#7c3aed" opacity="0.7" />
        <circle cx="7" cy="5" r="3.5" fill="#a78bfa" opacity="0.8" />
        <circle cx="7" cy="5" r="2" fill="#5b21b6" opacity="0.6" />
        <text x="7" y="16" fontSize="6" fill="#7c3aed" textAnchor="middle" fontWeight="bold">右</text>
      </g>
      {/* Baseline */}
      <line x1="22" y1="15" x2="38" y2="15" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <text x="30" y="13" fontSize="6" fill="#7c3aed" textAnchor="middle" opacity="0.7">基线 B</text>
      {/* Converging rays to 3D point */}
      <line x1="15" y1="15" x2="28" y2="35" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
      <line x1="45" y1="15" x2="32" y2="35" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
      {/* 3D point */}
      <circle cx="30" cy="35" r="4" fill="#7c3aed" opacity="0.8">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="30" y="37" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">P</text>
      {/* Depth line */}
      <line x1="30" y1="20" x2="30" y2="35" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 1" opacity="0.5" />
      <text x="32" y="28" fontSize="6" fill="#a78bfa" opacity="0.7">Z</text>
      {/* Disparity bar */}
      <rect x="10" y="48" width="40" height="6" rx="3" fill="#f5f3ff" opacity="0.6" />
      <rect x="12" y="49" width="10" height="4" rx="2" fill="#7c3aed" opacity="0.5" />
      <rect x="38" y="49" width="10" height="4" rx="2" fill="#7c3aed" opacity="0.5" />
      <text x="30" y="58" fontSize="6" fill="#7c3aed" textAnchor="middle" opacity="0.7">视差 d</text>
    </svg>
  ),
}

export default function Welcome({ onSelectNotebook, language }) {
  const [starCount, setStarCount] = useState(null)

  // Fetch GitHub stars with cache
  useEffect(() => {
    let cancelled = false

    const cachedCount = window.localStorage.getItem(GITHUB_STARS_CACHE_KEY)
    if (cachedCount !== null) {
      const parsedCount = Number(cachedCount)
      if (Number.isFinite(parsedCount)) {
        setStarCount(parsedCount)
      }
    }

    fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub API status: ${response.status}`)
        }
        return response.json()
      })
      .then((repo) => {
        if (cancelled || typeof repo.stargazers_count !== 'number') return
        setStarCount(repo.stargazers_count)
        window.localStorage.setItem(GITHUB_STARS_CACHE_KEY, String(repo.stargazers_count))
      })
      .catch(() => {
        // GitHub API may be rate limited; keep cached value or placeholder
      })

    return () => {
      cancelled = true
    }
  }, [])

  const scrollToPath = () => {
    const el = document.getElementById('learning-path-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNotebookSelect = (nb) => {
    const partDir = nb.section === 'image-processing'
      ? 'part1-image-processing'
      : 'part2-optimization-3d'
    onSelectNotebook(`${partDir}/${nb.lessonId}.ipynb`)
  }

  const handlePathSelect = (step) => {
    // Navigate to first notebook in the path
    const firstNotebook = RUNNABLE_NOTEBOOKS.find((nb) => nb.section === step.section)
    if (firstNotebook) {
      handleNotebookSelect(firstNotebook)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
      {/* HERO BANNER */}
      <section className="hero rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-sm border bg-gradient-to-br from-[#eff6ff]/90 via-[#f0f9ff] to-[#f5f3ff] border-blue-100/50">
        {/* Decorative blurs */}
        <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[250px] h-[250px] rounded-full bg-purple-300/10 blur-[60px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e0f2fe] text-blue-600 border border-blue-200/50 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>面向实践的计算机视觉教程</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[46px] font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              Hands-On Computer Vision
              <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                计算机视觉自学与实践
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-600 max-w-xl">
              从像素到三维重建，通过可运行的 Notebook 系统掌握计算机视觉核心算法。每章都是可执行代码，边学边练。
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => {
                  const firstNb = RUNNABLE_NOTEBOOKS[0]
                  if (firstNb) handleNotebookSelect(firstNb)
                }}
                className="h-10 sm:h-12 px-5 sm:px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>开始学习</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 sm:h-12 px-5 sm:px-6 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button
                onClick={scrollToPath}
                className="h-10 sm:h-12 px-5 sm:px-6 rounded-full border border-blue-200/80 bg-white/85 hover:bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-2"
              >
                <Route className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 whitespace-nowrap">
                  浏览学习路径
                </span>
                <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Run hint */}
            <div className="flex items-start gap-3 max-w-xl rounded-2xl border border-blue-200/80 bg-white/75 px-3.5 py-3 shadow-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CodeXml className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                  每篇 Notebook 都可以直接运行
                </p>
                <p className="mt-1 text-[10px] sm:text-xs leading-relaxed text-slate-500">
                  浏览器内直接渲染，无需本地环境配置，算法核心全部手写实现并与 OpenCV 对比验证。
                </p>
              </div>
            </div>

            {/* Feature checklist */}
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 border-t border-slate-200/50 pt-4 sm:pt-5 max-w-lg select-none">
              {['可运行 Notebook', '代码级图解', '循序渐进', '实践导向'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
                  <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                  </div>
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: floating visual elements */}
          <div className="hidden lg:flex lg:col-span-5 relative min-h-[300px] items-center justify-center select-none">
            {/* Main image processing window */}
            <div className="absolute w-[280px] h-[200px] rounded-2xl glass-effect shadow-xl p-4 border border-white/60 left-[5%] top-[5%] animate-float-1 z-10 overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200/40 pb-1.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                </div>
                <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">convolution.py</span>
              </div>
              <pre className="font-mono text-[10px] text-slate-600 space-y-0.5">
                <div><span className="text-purple-600 font-bold">import</span> numpy <span className="text-purple-600 font-bold">as</span> np</div>
                <div className="text-slate-400"># 手写 2D 卷积</div>
                <div><span className="text-blue-600 font-bold">def</span> <span className="text-indigo-600 font-bold">conv2d</span>(img, kernel):</div>
                <div>  h, w = img.shape[:2]</div>
                <div>  kh, kw = kernel.shape</div>
                <div>  out = np.<span className="text-purple-600">zeros</span>((h-kh+1, w-kw+1))</div>
                <div>  <span className="text-blue-600 font-bold">for</span> i <span className="text-blue-600 font-bold">in</span> <span className="text-purple-600">range</span>(h-kh+1):</div>
                <div>    <span className="text-blue-600 font-bold">for</span> j <span className="text-blue-600 font-bold">in</span> <span className="text-purple-600">range</span>(w-kw+1):</div>
                <div>      out[i,j] = np.<span className="text-purple-600">sum</span>(img[i:i+kh, j:j+kw] * kernel)</div>
                <div>  <span className="text-blue-600 font-bold">return</span> out</div>
              </pre>
            </div>

            {/* Pixel grid visualization */}
            <div className="absolute w-[200px] h-[150px] rounded-2xl glass-effect shadow-lg p-3.5 border border-white/60 right-0 bottom-[10%] animate-float-2 z-0 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center text-[9px] font-semibold text-slate-500 mb-2">
                <span className="font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-cyan-500" />
                  卷积结果
                </span>
                <span>3x3 Sobel</span>
              </div>
              <div className="grid grid-cols-6 gap-0.5 pt-0.5">
                {[
                  'bg-cyan-600/10', 'bg-cyan-600/20', 'bg-cyan-600/40', 'bg-cyan-600/60', 'bg-cyan-600/30', 'bg-cyan-600/10',
                  'bg-cyan-600/20', 'bg-cyan-600/50', 'bg-cyan-600/80', 'bg-cyan-600/70', 'bg-cyan-600/40', 'bg-cyan-600/15',
                  'bg-cyan-600/30', 'bg-cyan-600/70', 'bg-cyan-600/95', 'bg-cyan-600/85', 'bg-cyan-600/50', 'bg-cyan-600/20',
                  'bg-cyan-600/25', 'bg-cyan-600/65', 'bg-cyan-600/90', 'bg-cyan-600/75', 'bg-cyan-600/45', 'bg-cyan-600/20',
                  'bg-cyan-600/15', 'bg-cyan-600/40', 'bg-cyan-600/60', 'bg-cyan-600/50', 'bg-cyan-600/30', 'bg-cyan-600/10',
                  'bg-cyan-600/5', 'bg-cyan-600/15', 'bg-cyan-600/25', 'bg-cyan-600/20', 'bg-cyan-600/10', 'bg-cyan-600/5',
                ].map((cls, j) => (
                  <div key={j} className={`h-4 rounded-sm ${cls}`}></div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute top-[0%] right-[30%] bg-white/80 p-2.5 rounded-full shadow-md animate-float-3 border border-white/50 z-10">
              <Target className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="absolute bottom-[30%] left-[15%] bg-white/85 p-2 rounded-xl shadow-md animate-float-1 border border-white/50 z-20">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/45 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">14+</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug break-words">可运行 Notebook</div>
          </div>
        </div>
        <div className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/45 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50 shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">2</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug break-words">大学习路径</div>
          </div>
        </div>
        <div className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/45 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shrink-0">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">30+</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug break-words">核心算法</div>
          </div>
        </div>
        <div className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/45 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50 shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">{formatStarCount(starCount)}</div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-snug break-words">GitHub Stars</div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section data-tour="features" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 sm:p-4 gap-3 sm:gap-4">
        {[
          { icon: <Monitor className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />, title: '可运行 Notebook', desc: '浏览器内直接渲染，无需环境配置', iconClass: 'bg-blue-50 text-blue-600 border-blue-100/50' },
          { icon: <ImageIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />, title: '代码级图解', desc: '每一个算法都有可视化演示', iconClass: 'bg-cyan-50 text-cyan-600 border-cyan-100/50' },
          { icon: <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />, title: '循序渐进', desc: '从基础到进阶，系统化学习', iconClass: 'bg-amber-50 text-amber-600 border-amber-100/50' },
          { icon: <CodeXml className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />, title: '实践导向', desc: '所有算法都有可运行代码', iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' },
        ].map((f, i) => (
          <div key={i} className="p-1.5 sm:p-2 flex items-start gap-2.5 sm:gap-3.5">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shrink-0 ${f.iconClass}`}>{f.icon}</div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-[11px] sm:text-[13px] font-bold text-slate-900 leading-snug break-words">{f.title}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-normal break-words">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* LEARNING PATH */}
      <section id="learning-path-section" className="parts bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-[18px] md:text-[20px] font-bold text-slate-900">学习路径</h2>
            <p className="text-xs text-slate-500 font-medium">科学规划，逐步深入</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          {PATH_STEPS.map((step, idx) => {
            const style = SECTION_STYLES[step.section] || SECTION_STYLES['image-processing']
            const Icon = idx === 0 ? ImageIcon : Target
            return (
              <div key={idx} className="relative w-full">
                <div
                  onClick={() => handlePathSelect(step)}
                  className={`w-full rounded-[12px] p-4 sm:p-5 border border-slate-200/70 flex flex-col justify-between shadow-sm relative hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden bg-gradient-to-br ${style.bg}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/60 text-slate-700 w-fit inline-block">
                        {step.num}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {RUNNABLE_NOTEBOOKS.filter(nb => nb.section === step.section).length} 个 Notebook
                    </span>
                    <div className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all text-slate-700 group-hover:text-blue-600">
                      开始学习
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* RUNNABLE NOTEBOOKS */}
      <section data-tour="notebooks" className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-[18px] md:text-[20px] font-bold text-slate-900">精选 Notebook</h2>
            <p className="text-xs text-slate-500 font-medium">10 个核心章节，点击即可开始学习</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {RUNNABLE_NOTEBOOKS.map((nb) => {
            const style = SECTION_STYLES[nb.section] || SECTION_STYLES['image-processing']
            return (
              <div
                key={nb.id}
                onClick={() => handleNotebookSelect(nb)}
                className="border border-slate-200/70 rounded-[10px] overflow-hidden cursor-pointer bg-white relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
              >
                <div className={`h-[90px] flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${NOTEBOOK_BG[nb.id] || style.bg}`}>
                  {NOTEBOOK_SVGS[nb.id] || NOTEBOOK_SVGS['nb-1']}
                </div>
                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[12px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">{nb.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{nb.desc}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${style.tag}`}>
                      {style.name}
                    </span>
                    <span className="text-slate-500 font-medium">{nb.duration}分钟</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FOOTER */}
      <div className="w-full flex items-center justify-center pt-2 pb-6 select-none">
        <span className="text-xs text-slate-400 tracking-wide italic">
          "Seeing is believing, but understanding is power."
        </span>
      </div>
    </div>
  )
}
