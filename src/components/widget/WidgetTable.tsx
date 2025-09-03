// components/widget/WidgetTable.tsx
'use client'

import { useThemeStore } from '@/store/themeStore'
import { formatValue } from '@/utils/formatUtils'

interface WidgetTableProps {
  tableData: any
}

export default function WidgetTable({ tableData }: WidgetTableProps) {
  const { theme } = useThemeStore()

  if (!tableData || !tableData.headers || !tableData.rows) {
    return (
      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
        No table data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr
            className={`border-b ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900'
                : 'border-gray-300 bg-gray-100'
            }`}
          >
            {tableData.headers.map((header: string, idx: number) => (
              <th
                key={idx}
                className={`text-left py-2 px-2 font-semibold text-xs uppercase tracking-wide ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row: any[], rowIndex: number) => (
            <tr
              key={rowIndex}
              className={`border-b hover:bg-opacity-50 ${
                theme === 'dark'
                  ? `border-gray-800 hover:bg-gray-900/50 ${
                      rowIndex % 2 === 0 ? 'bg-black' : 'bg-gray-900/20'
                    }`
                  : `border-gray-200 hover:bg-gray-200/50 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`
              }`}
            >
              {row.map((cell: any, cellIndex: number) => (
                <td
                  key={cellIndex}
                  className={`py-2 px-2 font-mono text-xs ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  {formatValue(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {tableData.rows.length > 10 && (
        <div
          className={`text-xs mt-2 text-center py-1 rounded ${
            theme === 'dark'
              ? 'text-gray-400 bg-gray-900'
              : 'text-gray-600 bg-gray-100'
          }`}
        >
          Showing all {tableData.rows.length} entries
        </div>
      )}
    </div>
  )
}
