
// Format display name with proper casing
export function formatDisplayName(key: string): string {
    const lastPart = key.split('.').pop() || key
    return lastPart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  
  // Format value for display
  export function formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A'
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]'
      if (value.length <= 3) return JSON.stringify(value)
      return `[${value.length} items]`
    }
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'number') return value.toLocaleString()
    return String(value) 
  }
  