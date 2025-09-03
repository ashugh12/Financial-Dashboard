import React from 'react'
import { useThemeStore } from '@/store/themeStore'

interface CacheStatusProps {
  widgetCount: number
  onClearCache: () => void
}

export default function CacheStatus({ widgetCount, onClearCache }: CacheStatusProps) {
  const { theme } = useThemeStore()

  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>
      <span>📊 Dashboard: {widgetCount} widgets</span>
      {widgetCount > 0 && (
        <button
          onClick={onClearCache}
          className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
            theme === 'dark' 
              ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          title="Clear all widgets"
        >
          Clear
        </button>
      )}
    </div>
  )
}
