'use client'

import { useThemeStore } from "@/store/themeStore"

export default function ApiUrlTester({
  apiUrl,
  setApiUrl,
  isTesting,
  display,
  onTest,
}: {
  apiUrl: string
  setApiUrl: (val: string) => void
  isTesting: boolean
  display: number
  onTest: () => void
}) {
  const { theme } = useThemeStore()

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">API URL</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="e.g., https://stock.indianapi.in/trending"
          className={`flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
            theme === "dark"
              ? "border-gray-600 bg-[#0f172a] text-white"
              : "border-gray-300 bg-white text-black"
          }`}
        />
        <button
          disabled={isTesting || !apiUrl.trim()}
          onClick={onTest}
          className={`px-4 rounded-r-md ${
            display === 1
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-white hover:bg-gray-600"
          } disabled:opacity-50`}
        >
          {isTesting ? "Testing..." : "Test"}
        </button>
      </div>

      {display === 1 && (
        <p className="mt-1 mb-2 text-green-500 font-medium text-sm">
          API connection successful
        </p>
      )}
      {display === 0 && (
        <p className="mt-1 mb-2 text-red-500 font-medium text-sm">
          API connection failed
        </p>
      )}
    </div>
  )
}
