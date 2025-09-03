'use client'

import LazyButton from "./LazyButton"
import { useThemeStore } from "@/store/themeStore"

export default function DialogFooter({
  onCancel,
  onSave,
  isEditing,
  disabled,
  loading,
}: {
  onCancel: () => void
  onSave: () => void
  isEditing: boolean
  disabled: boolean
  loading: boolean
}) {
  const { theme } = useThemeStore()

  return (
    <div
      className={`flex justify-end space-x-3 pt-3 border-t mt-3 transition-colors duration-200 ${
        theme === "dark" ? "border-gray-700" : "border-gray-300"
      }`}
    >
      <LazyButton onClick={onCancel} theme={theme} variant="cancel">
        Cancel
      </LazyButton>

      <LazyButton
        onClick={onSave}
        disabled={disabled}
        theme={theme}
        variant="primary"
        loading={loading}
      >
        {isEditing ? "Update Widget" : "Add Widget"}
      </LazyButton>
    </div>
  )
}
