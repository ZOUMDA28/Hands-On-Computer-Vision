import { createContext, useContext } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ settings, updateSettings, resolvedTheme, toggleTheme, children }) {
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resolvedTheme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
