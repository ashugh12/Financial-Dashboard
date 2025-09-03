## Finboard Architecture

This document explains the folder structure, state management, data flow, and the responsibilities of key modules in Finboard.

### Folder Structure (key paths)
- src/
  - api/normalize
    route.ts : We have created a pipeline of gemini, to structure the json, based on simple and structrure prompt
  - app/
    - layout.tsx — App shell, theme class on html/body
    - page.tsx — Dashboard page: header, theme toggle, DialogForm, widgets grid, drag-and-drop
    - globals.css — Tailwind base styles
  - components/
    - Widget.tsx — Single widget UI (card/table/chart), actions, auto-refresh, header controls
    - CacheStatus.tsx — Displays number of widgets and clear action
    - cards/
      - DialogForm.tsx — Add/Edit widget dialog; validation, API test, save
      - FieldSelector.tsx — Field selection and display mode (card/table/chart)
  - lib/
    - api/
      - fetchStocks.ts —  Common implement the core functionality using helper function
      - cacheUtil.ts - Implement strategy using AI tool to cache data efficiently
      -apiValidator.ts - Based on api endpoints, it structure the data
      -normalizer.ts - Make the post request, generate data and at last return the structured data

  - store/
    - dashboardStore.ts — Widgets array and actions involves id, type, tilte, apiUrl (Zustand + persist)
    - dialogStore.ts — Dialog visibility and edit context( check if  open or not, to handle the feature)
    - fieldsStore.ts — Available fields, current selections, display mode( responsible for the holding the selection of the user)
    - themeStore.ts — Global theme (dark/light) with persistence(Responsible for providing the consistent and global theme editing)

  - utils/
    - flatten/
      - adapters.ts Adapt normalize to field, extract common field from stocks, extract common fields from array etc
      - helper.ts Findfirstarray of Object, find commons etc
    - transformer/
      - transformForCard.ts : Transform the data for the card
      - transformForTable.ts : Transform the data for the table
      - transfromForChart.ts : Transform the data for the chart
    - flatten.ts — Flatten/transform API data for display modes
    - getValueByPath.ts — Safe nested value access helper


### State Management (Zustand)
- dashboardStore.ts
  - Shape: `widgets: WidgetConfig[]`
  - Actions: `addWidget`, `updateWidget`, `removeWidget`, `reorderWidgets`, `clearAllWidgets`, `getWidgetById`
  - Persistence: localStorage via `persist`
- dialogStore.ts
  - `isOpen`, `isClose`, `editWidgetId`
  - Actions: `openDialog`, `openForEdit(widgetId)`, `closeDialog`
- fieldsStore.ts
  - `available`, `currSelected`, `mode`
  - Actions: `setAvailable`, `addField`, `removeField`, `setMode`, `loadSelectedFields`, `clearSelected`
- themeStore.ts
  - `theme` and `toggleTheme()`; persisted

### FinBoard Action Data Flow
1. Add/Edit Widget
   - `DialogForm.tsx`
     - User enters API URL → clicks Test → `refreshWidgetDataWithCache('test', url)` validates and fetches data
     - populate selectable fields
     - On save: create/update widget via `dashboardStore`
2. Display Widgets
   - `page.tsx` renders grid of `Widget` components (DnD via `@dnd-kit`)
   - Each `Widget` receives `selected`, `data`, `apiUrl`, `refreshInterval`
3. Refreshing Data
   - Manual: `Widget` calls `onRefresh` → `page.tsx` → `refreshWidgetDataWithCache(widgetId, apiUrl)` → `dashboardStore.updateWidget`
   - Auto: `Widget` sets an interval based on `refreshInterval` and calls `onRefresh`
4. Caching
   - In-memory (per URL) in `refreshWidgetData`
   - Widget-scoped localStorage cache in `refreshWidgetDataWithCache`

### Caching & Logging
- `fetchStocks.ts`
  - `isValid(url)` — fetch with `X-Api-Key` header, verifies non-empty response
  - `refreshWidgetData(url)` — URL cache (30s). Logs when cache/fresh is used
  - `refreshWidgetDataWithCache(widgetId, url)` — widget-scoped cache (5 min default). Logs cache age and source (cache vs API)
  - Explicit logs in `page.tsx` for widget refresh start/success/failure

### Components Responsibilities
- Widget.tsx
  - Renders header (icon, title, refresh interval chip, cache indicator)
  - Actions: refresh, configure (open dialog), remove
  - Only the small top-left handle is draggable; action buttons remain clickable
  - Converts raw `data` into display via `transformDataForWidget` (cards/tables/charts)
- DialogForm.tsx
  - Add/Edit mode with prefill on edit
  - Validates name and selected fields
  - API Test gate: shows `FieldSelector` only after success or when editing
- FieldSelector.tsx
  - Mode switch (card/table/chart), searching, optional arrays-only (table)
  - Displays common fields using friendly display names

### Drag & Drop
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `page.tsx` wires `DndContext`, `SortableContext`, and per-widget `useSortable`
- Only the dedicated drag handle within `Widget` has the drag listeners

### Theming
- `themeStore` with persist
- All components read theme and use Tailwind classes for dark/light variants

### Files affected by common actions
- Add widget: `DialogForm.tsx`, `fetchStocks.ts`, `flatten.ts`, `dashboardStore.ts`
- Edit widget: `DialogForm.tsx`, `dashboardStore.ts`
- Refresh widget: `Widget.tsx` → `page.tsx` → `fetchStocks.ts` → `dashboardStore.ts`
- Drag widgets: `page.tsx` (DnD setup) → `dashboardStore.reorderWidgets`
- Theme toggle: `themeStore.ts` and all theme-aware components

