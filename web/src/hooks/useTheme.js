import { useState, useEffect, useCallback } from 'react'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme()
  return preference === 'dark' ? 'dark' : 'light'
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved)
  // 更新 meta theme-color（如果存在）
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0f1219' : '#f5f7fa')
}

export default function useTheme(preference) {
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(preference))

  // 当 preference 变化时重新计算
  useEffect(() => {
    const resolved = resolveTheme(preference)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [preference])

  // 监听系统主题变化（仅在 system 模式下生效）
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const resolved = e.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const toggleTheme = useCallback(() => {
    // 简单切换 light <-> dark（不经过 system）
    setResolvedTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  return { resolvedTheme, toggleTheme }
}
