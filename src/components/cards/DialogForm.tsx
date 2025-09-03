'use client'

import { useEffect, useState } from "react"
import useDialogStore from "@/store/dialogStore"
import useConnectionStore from "@/store/checkConnection"
import { refreshWidgetDataWithCache } from "@/lib/api/fetchStocks"
import { flattenTrending } from "@/utils/flatten"
import { useFieldsStore } from "@/store/fieldsStore"
import useDashboardStore from "@/store/dashboardStore"
import { useThemeStore } from "@/store/themeStore"

import DialogHeader from "./dialog/DialogHeader"
import WidgetNameInput from "./dialog/WidgetNameInput"
import ApiUrlTester from "./dialog/ApiUrlTester"
import RefreshIntervalInput from "./dialog/RefreshIntervalInput"
import FieldSelector from "./FieldSelector"
import DialogFooter from "./dialog/DialogFooter"

export default function DialogForm() {
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, isClose, editWidgetId, closeDialog } = useDialogStore()
  const { setConnection } = useConnectionStore()
  const { setAvailable, currSelected, loadSelectedFields, clearSelected, mode } = useFieldsStore()
  const { addWidget, updateWidget, getWidgetById } = useDashboardStore()
  const { theme } = useThemeStore()

  const [apiUrl, setApiUrl] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [display, setDisplay] = useState(-1) // -1: idle, 0: failed, 1: success
  const [widgetName, setWidgetName] = useState("")
  const [refreshInterval, setRefreshInterval] = useState(30)

  const isEditing = Boolean(editWidgetId)
  const existingWidget = editWidgetId ? getWidgetById(editWidgetId) : null

  // Prefill values when editing
  useEffect(() => {
    if (isOpen && editWidgetId && existingWidget) {
      setWidgetName(existingWidget.title)
      setApiUrl(existingWidget.apiUrl)
      setRefreshInterval(existingWidget.refreshInterval / 1000)
      loadSelectedFields(existingWidget.fields || [])
      setDisplay(1) // show success
    }
  }, [isOpen, editWidgetId, existingWidget, loadSelectedFields])

  // Reset fields when dialog closes
  useEffect(() => {
    if (!isOpen && isClose) {
      setAvailable([])
      setDisplay(-1)
      setWidgetName("")
      setApiUrl("")
      setRefreshInterval(30)
      clearSelected()
    }
  }, [isOpen, isClose, setAvailable, clearSelected])

  if (!isOpen) return null

  const handleTest = async () => {
    if (!apiUrl.trim()) return
    setIsTesting(true)
    try {
      const { valid, data } = await refreshWidgetDataWithCache("test", apiUrl)

      if (valid) {
        const field = flattenTrending(data)
        setAvailable(field)
        setDisplay(1)
        setConnection(apiUrl, true)

        if (isEditing && editWidgetId) {
          updateWidget(editWidgetId, { data })
        }
      } else {
        setDisplay(0)
        setConnection(apiUrl, false)
      }
    } catch (error) {
      setDisplay(0)
      setConnection(apiUrl, false)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!widgetName.trim()) {
      alert("Please enter a widget name")
      return
    }
    if (!isEditing && currSelected.length === 0) {
      alert("Please select at least one field")
      return
    }
  
    setIsSaving(true)   // start loading
  
    try {
      let widgetData = null
      if (display === 1) {
        try {
          const { data } = await refreshWidgetDataWithCache("test", apiUrl)
          widgetData = data
        } catch (error) {
          console.error("Failed to fetch data for widget:", error)
        }
      }
  
      if (isEditing && editWidgetId) {
        updateWidget(editWidgetId, {
          title: widgetName.trim(),
          apiUrl,
          refreshInterval: refreshInterval * 1000,
          fields: currSelected,
          data: widgetData,
        })
      } else {
        const widget = {
          id: Date.now().toString(),
          title: widgetName.trim(),
          type: mode,
          apiUrl,
          refreshInterval: refreshInterval * 1000,
          fields: currSelected,
          data: widgetData,
        }
        addWidget(widget)
      }
  
      closeDialog()
    } finally {
      setIsSaving(false)   // ✅ reset no matter what
    }
  }
  

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeDialog}
    >
      <div
        className={`w-190 rounded-md p-4 shadow-lg transition-colors duration-200 ${
          theme === "dark" ? "bg-[#0f172a] text-white" : "bg-white text-black"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader
          title={isEditing ? "Edit Widget" : "Add New Widget"}
          onClose={closeDialog}
        />

        <WidgetNameInput value={widgetName} onChange={setWidgetName} />

        <ApiUrlTester
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
          isTesting={isTesting}
          display={display}
          onTest={handleTest}
        />

        <RefreshIntervalInput
          value={refreshInterval}
          onChange={setRefreshInterval}
        />

        {(display === 1 || isEditing) && (
          <div className="mb-4">
            <FieldSelector />
          </div>
        )}

        <DialogFooter
          onCancel={closeDialog}
          onSave={handleSave}
          isEditing={isEditing}
          disabled={!widgetName.trim() || (!isEditing && currSelected.length === 0)}
          loading={isSaving}
        />
      </div>
    </div>
  )
}
