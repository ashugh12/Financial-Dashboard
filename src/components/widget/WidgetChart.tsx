// components/widget/WidgetChart.tsx
'use client'

import { useThemeStore } from '@/store/themeStore'
import { formatValue } from '@/utils/formatUtils'

interface WidgetChartProps {
  chartData: any
}

export default function WidgetChart({ chartData }: WidgetChartProps) {
  const { theme } = useThemeStore()

  if (!chartData || !chartData.labels || !chartData.datasets) {
    return (
      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
        No chart data available
      </div>
    )
  }

  const maxValue = Math.max(...chartData.datasets[0]?.data || [0])

  return (
    <div className="space-y-2">
      <div
        className={`text-xs font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        Chart Preview
      </div>
      {chartData.labels.slice(0, 5).map((label: string, index: number) => {
        const value = chartData.datasets[0]?.data[index] || 0
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span
                className={`truncate max-w-[60%] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {label}
              </span>
              <span
                className={`font-mono ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              >
                {formatValue(value)}
              </span>
            </div>
            <div
              className={`w-full rounded-full h-1 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <div
                className="bg-blue-500 h-1 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )
      })}
      {chartData.labels.length > 5 && (
        <div
          className={`text-xs text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Showing 5 of {chartData.labels.length} data points
        </div>
      )}
    </div>
  )
}
