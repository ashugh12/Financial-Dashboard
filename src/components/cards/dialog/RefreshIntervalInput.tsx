'use client'

import { useThemeStore } from "@/store/themeStore"

export default function RefreshIntervalInput({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const { theme } = useThemeStore()

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        Refresh Interval (seconds)
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 30)}
        min={5}
        max={300}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
          theme === "dark"
            ? "border-gray-600 bg-[#0f172a] text-white"
            : "border-gray-300 bg-white text-black"
        }`}
      />
    </div>
  )
}
