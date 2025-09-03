'use client'

import useDashboardStore from '@/store/dashboardStore'
import Widget from '@/components/Widget'
import Image from 'next/image'
import React from 'react'
import useDialogStore from '@/store/dialogStore'
import DialogForm from '@/components/cards/DialogForm'
import { refreshWidgetDataWithCache } from '@/lib/api/fetchStocks'
import { useThemeStore } from '@/store/themeStore'
import CacheStatus from '@/components/CacheStatus'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function HomePage() {
  const { widgets, removeWidget, reorderWidgets, updateWidget, clearAllWidgets } = useDashboardStore()
  const { openDialog, openForEdit } = useDialogStore();
  const { theme, toggleTheme } = useThemeStore();


  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id);

      reorderWidgets(oldIndex, newIndex);
    }
  };

  // Refresh widget data at specified intervals
  const refreshWidgetData = async (widgetId: string, apiUrl: string) => {
    try {
      const { valid, data, fromCache } = await refreshWidgetDataWithCache(widgetId, apiUrl);
      if (valid && data) {
        updateWidget(widgetId, { data });
      } 
    } catch (error) {
      console.error( error);
    }
  };

  return (
    <main className={`min-h-screen space-y-6 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className={`flex justify-between items-center p-6 border-b transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black border-white' : 'bg-white border-black'
      }`}>
        <div className='flex items-center gap-4'>
          <Image src="/icons/logo.png" alt="Logo" width={32} height={32} />
          <div className={theme === 'dark' ? 'text-white' : 'text-black'}>
            <div className='text-2xl font-bold'>Finance Dashboard</div>
            <p className='text-sm'>Connects to APIs and build your custom dashboard</p>
            <CacheStatus 
              widgetCount={widgets.length} 
              onClearCache={clearAllWidgets} 
            />
          </div>
        </div>
        <div className="flex gap-3">  
          <button 
            className='bg-violet-500 text-white p-2 rounded-md hover:bg-violet-600 hover:px-3' 
            onClick={openDialog}
          >
            + Add Widget
          </button>
          <button 
            className={`p-2 rounded-md transition-colors duration-200 ${
              theme === 'dark' 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <DialogForm />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {widgets.length > 0 ? widgets.map((w) => (
              <SortableWidget
                key={w.id}
                widget={w}
                onRemove={() => removeWidget(w.id)}
                onConfigure={() => openForEdit(w.id)}
                onRefresh={() => refreshWidgetData(w.id, w.apiUrl || '')}
              />
            )) : (
              <div className={`col-span-full flex items-center justify-center h-[560px] ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <div className='flex flex-col items-center gap-2'>
                  <div className='text-xl'>Build your Finance Dashboard</div>
                  <p className='text-sm'>Create custom widgets by connecting to any Finance API. Track your stocks, currencies, and more.</p>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  )
}

// SortableWidget component
function SortableWidget({ 
  widget, 
  onRemove, 
  onConfigure, 
  onRefresh 
}: { 
  widget: any; 
  onRemove: () => void; 
  onConfigure: () => void; 
  onRefresh: () => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'rotate-2 scale-105 z-50 opacity-50' : ''} transition-transform duration-200`}
    >
      <Widget
        type={widget.type}
        refreshInterval={widget.refreshInterval / 1000}
        title={widget.title}
        onRemove={onRemove}
        onConfigure={onConfigure}
        selected={widget.fields}
        data={widget.data}
        apiUrl={widget.apiUrl}
        onRefresh={onRefresh}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}