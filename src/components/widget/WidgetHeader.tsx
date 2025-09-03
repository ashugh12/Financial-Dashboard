// components/widget/WidgetHeader.tsx
'use client'

import { useThemeStore } from '@/store/themeStore'
import React from 'react'

interface WidgetHeaderProps {
  title: string
  type: 'card' | 'table' | 'chart'
  refreshInterval: number
  isRefreshing: boolean
  isUsingCache: boolean
  onRefresh?: () => void
  onConfigure?: () => void
  onRemove?: () => void
  dragAttributes?: any
  dragListeners?: any
}

export default function WidgetHeader({
  title,
  type,
  refreshInterval,
  isRefreshing,
  isUsingCache,
  onRefresh,
  onConfigure,
  onRemove,
  dragAttributes,
  dragListeners,
}: WidgetHeaderProps) {
  const { theme } = useThemeStore()

  const icons: Record<string, React.ReactNode> = {
    card: <span className="text-lg">⊞</span>,
    table: <span className="text-lg">⊟</span>,
    chart: <span className="text-lg">📊</span>,
  }

  const icon = icons[type] || <span className="text-lg">📊</span>

  return (
    <div className="flex justify-between items-center mb-4">
      <h2
        className={`flex items-center gap-x-2 text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}
      >
        <div>{icon}</div>
        {title}
        <div
          className={`px-2 py-1 text-[9px] rounded-md ${
            isRefreshing ? 'bg-green-600 animate-pulse' : 'bg-gray-600'
          }`}
        >
          {refreshInterval}s
        </div>
        {isUsingCache && (
          <div
            className="px-2 py-1 text-[9px] rounded-md bg-blue-600"
            title="Using cached data"
          >
            📦
          </div>
        )}
      </h2>

      <div className="flex gap-2 relative z-20">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className={`text-green-400 hover:text-green-300 hover:bg-green-900/20 p-2 rounded-md transition-colors text-sm ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh data"
            disabled={isRefreshing}
          >
            🔄
          </button>
        )}
        {onConfigure && (
          <button
            onClick={onConfigure}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-2 rounded-md rounded transition-colors text-sm"
            title="Configure widget"
          >
            ⚙️
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-md transition-colors text-sm"
            title="Remove widget"
          >
            ✕
          </button>
        )}
      </div>

      {/* Drag handle */}
      {dragListeners && (
        <div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-black/20 rounded p-1"
          {...dragAttributes}
          {...dragListeners}
        >
          <div className="flex flex-col gap-1">
            {[0, 1].map(row => (
              <div className="flex gap-1" key={row}>
                {[0, 1, 2].map(col => (
                  <div
                    key={col}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
