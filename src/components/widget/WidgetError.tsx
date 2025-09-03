// components/widget/WidgetError.tsx
'use client'

import { useThemeStore } from '@/store/themeStore'

export default function WidgetError({ message }: { message: string }) {
  const { theme } = useThemeStore()

  return (
    <div
      className={`mt-2 p-2 rounded text-xs ${
        theme === 'dark'
          ? 'bg-red-900/20 text-red-400 border border-red-800'
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}
    >
      ⚠️ {message}
    </div>
  )
}
