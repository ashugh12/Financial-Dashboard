import { create } from "zustand"

type DisplayMode = "card" | "table" | "chart"

interface FieldsState {
  available: { key: string; type: string; sample?: any; displayName?: string }[]
  selected: Record<string, string[]>
  currSelected: string[]
  mode: DisplayMode
  setAvailable: (fields: { key: string; type: string; sample?: any; displayName?: string }[]) => void
  addField: (field: string) => void
  removeField: (field: string) => void
  setMode: (mode: DisplayMode) => void
  loadSelectedFields: (fields: string[]) => void
  clearSelected: () => void
}

export const useFieldsStore = create<FieldsState>((set) => ({
  available: [],
  selected: {},
  currSelected: [],
  mode: "card",
  
  setAvailable: (fields) => set({ available: fields }),
  
  addField: (field) =>
    set((state) => ({
      currSelected: state.currSelected.includes(field)
        ? state.currSelected
        : [...state.currSelected, field],
    })),
  
  removeField: (field) =>
    set((state) => ({
      currSelected: state.currSelected.filter((f) => f !== field),
    })),
  
  setMode: (mode) => set({ mode }),
  loadSelectedFields: (fields) => set({ currSelected: fields }),
  clearSelected: () => set({ currSelected: [] }),
}))