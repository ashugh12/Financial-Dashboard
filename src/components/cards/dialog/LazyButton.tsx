'use client'

export default function LazyButton({
  children,
  onClick,
  disabled = false,
  theme,
  variant,
  loading = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  theme: "dark" | "light"
  variant: "cancel" | "primary"
  loading?: boolean
}) {
  const baseClasses = "px-4 py-2 rounded transition-all duration-200"

  const variantClasses = {
    cancel:
      theme === "dark"
        ? "bg-transparent text-white border border-gray-500 hover:bg-gray-700"
        : "bg-transparent text-black border border-gray-400 hover:bg-gray-300",
    primary:
      "bg-violet-600 text-white hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        loading ? "animate-pulse" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
