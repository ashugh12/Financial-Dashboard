'use client'

import { useThemeStore } from "@/store/themeStore"

export default function DialogHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const { theme } = useThemeStore()

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        className={`text-2xl transition-colors duration-200 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  )
}
