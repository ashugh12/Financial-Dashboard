import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WidgetConfig {
  id: string
  type: 'chart' | 'table' | 'card'
  title: string
  apiUrl: string
  refreshInterval: number
  fields: string[]
  data?: any // Store API response data
  lastRefresh?: number // Track when data was last refreshed
  config?: {
    chartType?: 'candle' | 'line'
    timeInterval?: 'daily' | 'weekly' | 'monthly'
    tableColumns?: string[]
    cardType?: 'watchlist' | 'market-gainers' | 'performance' | 'financial-data'
    filters?: Record<string, any>
  }
  position?: { x: number; y: number }
}

interface DashboardState {
  widgets: WidgetConfig[]
  addWidget: (widget: WidgetConfig) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void
  reorderWidgets: (fromIndex: number, toIndex: number) => void
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void
  getWidgetById: (id: string) => WidgetConfig | undefined
  clearAllWidgets: () => void
}

const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      addWidget: (widget) =>
        set((state) => ({ 
          widgets: [...state.widgets, { 
            ...widget, 
            lastRefresh: Date.now() 
          }] 
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      updateWidget: (id, config) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { 
              ...w, 
              ...config, 
              lastRefresh: config.data ? Date.now() : w.lastRefresh 
            } : w
          ),
        })),
      reorderWidgets: (fromIndex, toIndex) =>
        set((state) => {
          const newWidgets = [...state.widgets]
          const [movedWidget] = newWidgets.splice(fromIndex, 1)
          newWidgets.splice(toIndex, 0, movedWidget)
          return { widgets: newWidgets }
        }),
      updateWidgetPosition: (id, position) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        })),
      getWidgetById: (id) => {
        const state = get()
        return state.widgets.find(w => w.id === id)
      },
      clearAllWidgets: () => set({ widgets: [] })
    }),
    {
      name: 'dashboard-storage',
    }
  )
)

export default useDashboardStore