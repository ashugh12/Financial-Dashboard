'use client'

import { useThemeStore } from "@/store/themeStore"

export default function WidgetNameInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const { theme } = useThemeStore()

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">Widget Name</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Bitcoin Price Tracker"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
          theme === "dark"
            ? "border-gray-600 bg-[#0f172a] text-white"
            : "border-gray-300 bg-white text-black"
        }`}
      />
    </div>
  )
}
