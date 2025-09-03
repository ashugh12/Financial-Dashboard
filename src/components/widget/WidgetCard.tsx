// components/widget/WidgetCard.tsx
'use client'

import { useThemeStore } from '@/store/themeStore'
import { formatValue } from '@/utils/formatUtils'

interface WidgetCardProps {
  cardData: any
}

export default function WidgetCard({ cardData }: WidgetCardProps) {
  const { theme } = useThemeStore()

  if (!cardData) return <div className="text-gray-400">No data available</div>

  // Array of company cards
  if (Array.isArray(cardData)) {
    return (
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {cardData.map((companyCard, index) => (
          <div
            key={index}
            className={`border rounded p-3 ${
              theme === 'dark'
                ? 'bg-black border-gray-800'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div
              className={`text-sm font-semibold mb-2 border-b pb-1 ${
                theme === 'dark'
                  ? 'text-white border-gray-800'
                  : 'text-black border-gray-300'
              }`}
            >
              {companyCard.companyName}
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(companyCard.data).map(([key, value]) => (
                <div
                  key={key}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  >
                    {key}:
                  </span>
                  <span
                    className={`font-mono ml-1 ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Single card
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(cardData).map(([key, value]) => (
        <div
          key={key}
          className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'
          }`}
        >
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {key}:
          </span>
          <span
            className={`font-mono ml-1 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            {formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  )
}
