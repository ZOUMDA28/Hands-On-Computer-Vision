import { useState, useEffect } from 'react'

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('cv-tutorial-settings')
      return saved ? JSON.parse(saved) : {
        theme: 'system',
        fontSize: 'default',
        language: 'zh'
      }
    } catch {
      return {
        theme: 'system',
        fontSize: 'default',
        language: 'zh'
      }
    }
  })

  useEffect(() => {
    localStorage.setItem('cv-tutorial-settings', JSON.stringify(settings))
    
    // 应用主题
    let theme = settings.theme
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', theme)
    
    // 应用字号
    document.documentElement.setAttribute('data-font-size', settings.fontSize)
  }, [settings])

  // 监听系统主题变化
  useEffect(() => {
    if (settings.theme !== 'system') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const theme = mediaQuery.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [settings.theme])

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  return { settings, updateSettings }
}
