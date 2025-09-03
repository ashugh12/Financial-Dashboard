'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import WidgetHeader from './widget/WidgetHeader'
import WidgetError from './widget/WidgetError'
import WidgetContent from './widget/WidgetContent'

interface WidgetProps {
  title: string
  type: 'card' | 'table' | 'chart'
  refreshInterval: number
  onRemove?: () => void
  onConfigure?: () => void
  onRefresh?: () => void
  selected?: string[]
  data?: any
  apiUrl?: string
  children?: React.ReactNode
  dragAttributes?: any
  dragListeners?: any
}

export default function Widget(props: WidgetProps) {
  const {
    title,
    type,
    refreshInterval,
    onRemove,
    onConfigure,
    onRefresh,
    selected = [],
    data,
    apiUrl,
    children,
    dragAttributes,
    dragListeners,
  } = props

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)
  const { theme } = useThemeStore()

  // Auto-refresh logic
  useEffect(() => {
    if (!apiUrl || !onRefresh || refreshInterval <= 0) return
    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true)
        setLastRefreshError(null)
        await onRefresh()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
        setLastRefreshError('Auto-refresh failed')
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000)
      }
    }, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [apiUrl, onRefresh, refreshInterval])

  return (
    <div
      className={`border shadow-lg rounded-xl p-4 w-full transition-all duration-200 relative group ${
        theme === 'dark'
          ? 'bg-black border-gray-800 hover:border-gray-700'
          : 'bg-white border-gray-300 hover:border-gray-400'
      }`}
    >
      {/* Header */}
      <WidgetHeader
        title={title}
        type={type}
        refreshInterval={refreshInterval}
        isRefreshing={isRefreshing}
        isUsingCache={isUsingCache}
        onRefresh={async () => {
          if (!onRefresh) return
          try {
            setIsRefreshing(true)
            setLastRefreshError(null)
            await onRefresh()
          } catch (error) {
            setLastRefreshError('Manual refresh failed')
          } finally {
            setTimeout(() => setIsRefreshing(false), 1000)
          }
        }}
        onConfigure={onConfigure}
        onRemove={onRemove}
        dragAttributes={dragAttributes}
        dragListeners={dragListeners}
      />

      {/* Data */}
      {selected.length > 0 && data && (
        <WidgetContent type={type} data={data} selected={selected} />
      )}

      {/* Children (extra UI) */}
      {children && (
        <div
          className={`transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {children}
        </div>
      )}

      {/* Error */}
      {lastRefreshError && <WidgetError message={lastRefreshError} />}
    </div>
  )
}
