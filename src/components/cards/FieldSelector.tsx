"use client"

import { useFieldsStore } from "@/store/fieldsStore"
import { useState } from "react"
import { useThemeStore } from "@/store/themeStore"

export default function FieldSelector() {
  const { available, currSelected, addField, removeField, mode, setMode } = useFieldsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showArraysOnly, setShowArraysOnly] = useState(false)
  const { theme } = useThemeStore()

  return (
    <div className="space-y-6">
      {/* Main Title */}
      <div className={`text-center pb-2 border-b transition-colors duration-200 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
      }`}>
        <h2 className={`text-s font-semibold transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>Select Fields to Display</h2>
      </div>

      {/* Display Mode and Search - Horizontal Layout */}
      <div className="flex justify-between items-end gap-4">
        {/* Display Mode Selection */}
        <div className="flex-1">
          <h3 className={`text-sm font-medium mb-3 transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>Display Mode</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('card')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'card'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">⊞</span>
              Card
            </button>
            <button
              onClick={() => setMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'table'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">⊟</span>
              Table
            </button>
            <button
              onClick={() => setMode('chart')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'chart'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">📊</span>
              Chart
            </button>
          </div>
        </div>

        {/* Search Fields */}
        <div className="flex-1">
          <h3 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>Search Fields</h3>
          <input
            type="text"
            placeholder="Search for fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-black'
            }`}
          />
        </div>
      </div>

      {/* Show arrays only checkbox (for table view) */}
      {mode === 'table' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showArraysOnly"
            checked={showArraysOnly}
            onChange={(e) => setShowArraysOnly(e.target.checked)}
            className="w-4 h-4 text-violet-500 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
          />
          <label htmlFor="showArraysOnly" className={`text-sm transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Show arrays only (for table view)
          </label>
        </div>
      )}

      {/* Available Fields */}
      <div>
        <h3 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Available Fields</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {available
            .filter((field) => {
              // Hide already selected fields
              if (currSelected.includes(field.key)) return false
              
              // Apply search filter
              if (searchTerm && !field.key.toLowerCase().includes(searchTerm.toLowerCase())) return false
              
              // Apply array filter for table view
              if (mode === 'table' && showArraysOnly && field.type !== 'array') return false
              
              return true
            })
            .map((field) => (
              <div
                key={field.key}
                className="flex justify-between items-center px-3 py-2 bg-[#1e293b] rounded hover:bg-[#334155]"
              >
                <div>
                  <div className="text-sm text-white font-medium">
                    {(field as any).displayName || field.key}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {field.key} | {field.type} | {String(field.sample).slice(0, 30)}
                  </div>
                </div>
                <button
                  onClick={() => addField(field.key)}
                  className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Fields */}
      <div>
        <h3 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Selected Fields</h3>
        <div className="space-y-2 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {currSelected.map((key) => {
            const field = available.find((f) => f.key === key)
            if (!field) return null

            return (
              <div
                key={key}
                className="flex justify-between items-center px-3 py-2 bg-[#1e293b] rounded"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm text-white">{field.key}</div>
                  <input
                    type="text"
                    defaultValue={key.split(".").pop() || ""}
                    className="w-full mt-1 px-2 py-1 rounded bg-[#0f172a] text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <button
                  onClick={() => removeField(key)}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}