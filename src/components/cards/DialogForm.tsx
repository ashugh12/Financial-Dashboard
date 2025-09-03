'use client'

import useDialogStore from "@/store/dialogStore"
import useConnectionStore from "@/store/checkConnection"
import { useEffect, useState, lazy, Suspense } from "react";
import { refreshWidgetDataWithCache } from "@/lib/api/fetchStocks";
import FieldSelector from "./FieldSelector";
import { flattenTrending } from "@/utils/flatten";
import { useFieldsStore } from "@/store/fieldsStore";
import useDashboardStore from "@/store/dashboardStore"
import { useThemeStore } from "@/store/themeStore";

export default function DialogForm() {
  const { isOpen, isClose, editWidgetId, closeDialog } = useDialogStore();
  const { setConnection } = useConnectionStore();
  const { setAvailable, currSelected, loadSelectedFields, clearSelected, mode } = useFieldsStore();
  const { addWidget, updateWidget, getWidgetById } = useDashboardStore();
  const { theme } = useThemeStore();
  
  const [apiUrl, setApiUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [display, setDisplay] = useState(-1);
  const [widgetName, setWidgetName] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30);
  
  const isEditing = Boolean(editWidgetId);
  const existingWidget = editWidgetId ? getWidgetById(editWidgetId) : null;

  // Prefill values when editing
  useEffect(() => {
    if (isOpen && editWidgetId && existingWidget) {
      setWidgetName(existingWidget.title);
      setApiUrl(existingWidget.apiUrl);
      setRefreshInterval(existingWidget.refreshInterval / 1000);
      loadSelectedFields(existingWidget.fields || []);
      setDisplay(1); // Show field selector since we have existing data
    }
  }, [isOpen, editWidgetId, existingWidget]);
  
  // Reset fields when dialog closes
  useEffect(() => {
    if (!isOpen && isClose) {
      setAvailable([]);
      setDisplay(-1);
      setWidgetName("");
      setApiUrl("");
      setRefreshInterval(30);
      clearSelected();
    }
  }, [isOpen, isClose, setAvailable, clearSelected])
  
  // Early return must come AFTER all hooks
  if (!isOpen) return null;
  
  const handleTest = async () => {
    if (apiUrl != "") {
      setIsTesting(true);
      try {
        const { valid, data } = await refreshWidgetDataWithCache('test', apiUrl);

        if (valid) {
          const field = flattenTrending(data);
          setAvailable(field);
          setDisplay(1);
          setConnection(apiUrl, true);
          
          // Store the data for the widget
          if (isEditing && editWidgetId) {
            updateWidget(editWidgetId, { data });
          }
        } else {
          setDisplay(0);
          setConnection(apiUrl, false);
        }
      } catch (error) {
        setDisplay(0);
        setConnection(apiUrl, false);
      } finally {
        setIsTesting(false);
      }
    }
  }

  const handleAdd = async () => {
    if (!widgetName.trim()) {
      alert("Please enter a widget name");
      return;
    }

    if (!isEditing && currSelected.length === 0) {
      alert("Please select at least one field");
      return;
    }

    try {
      // Get the latest data from the API test
      let widgetData = null;
      if (display === 1) {
        try {
          const { data } = await refreshWidgetDataWithCache('test', apiUrl);
          widgetData = data;
        } catch (error) {
          console.error("Failed to fetch data for widget:", error);
        }
      }

      if (isEditing && editWidgetId) {
        // Update existing widget
        updateWidget(editWidgetId, {
          title: widgetName.trim(),
          apiUrl: apiUrl,
          refreshInterval: refreshInterval * 1000,
          fields: currSelected,
          data: widgetData,
        });
      } else {
        // Create new widget
        const widget = {
          id: Date.now().toString(),
          title: widgetName.trim(),
          type: mode,
          apiUrl: apiUrl,
          refreshInterval: refreshInterval * 1000,
          fields: currSelected,
          data: widgetData,
        };
        addWidget(widget);
      }
      
      // Close dialog and reset form
      closeDialog();
    } catch (error) {
      console.error("Error saving widget:", error);
      alert("Failed to save widget. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeDialog}
    >
      <div
        className={`w-190 rounded-md p-4 shadow-lg transition-colors duration-200 ${
          theme === 'dark' 
            ? 'bg-[#0f172a] text-white' 
            : 'bg-white text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Widget" : "Add New Widget"}
          </h2>
          <button className={`text-2xl transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`} onClick={closeDialog}>
            &times;
          </button>
        </div>

        {/* Widget Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Widget Name</label>
          <input
            type="text"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            placeholder="e.g., Bitcoin Price Tracker"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-[#0f172a] text-white' 
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>

        {/* API URL and Test Button */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">API URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}  
              placeholder="e.g., https://stock.indianapi.in/trending"
              className={`flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-[#0f172a] text-white' 
                  : 'border-gray-300 bg-white text-black'
              }`}
            />
            <button 
              disabled={isTesting || !apiUrl.trim()}
              onClick={handleTest}
              className={`px-4 rounded-r-md ${display === 1 ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'} disabled:opacity-50`}
            >
              {isTesting ? "Testing..." : "Test"}
            </button>
          </div>
        </div>

        {/* Status text */}
        {display === 1 && (
          <p className="mt-1 mb-2 text-green-500 font-medium text-sm">API connection successful</p>
        )}
        {display === 0 && (
          <p className="mt-1 mb-2 text-red-500 font-medium text-sm">API connection failed</p>
        )}

        {/* Refresh Interval */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Refresh Interval (seconds)</label>
          <input
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
            min="5"
            max="300"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-[#0f172a] text-white' 
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>

        {/* Field Selector - Only show after API verification or when editing */}
        {(display === 1 || isEditing) && (
          <div className="mb-4">
            <FieldSelector />
          </div>
        )}

        {/* Footer Buttons */}
        <div className={`flex justify-end space-x-3 pt-3 border-t mt-3 transition-colors duration-200 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <Suspense fallback={
            <div className="px-4 py-2 bg-gray-300 rounded animate-pulse w-20 h-10"></div>
          }>
            <LazyButton
              onClick={closeDialog}
              theme={theme}
              variant="cancel"
            >
              Cancel
            </LazyButton>
          </Suspense>
          
          <Suspense fallback={
            <div className="px-4 py-2 bg-violet-300 rounded animate-pulse w-32 h-10"></div>
          }>
            <LazyButton
              onClick={handleAdd}
              disabled={!widgetName.trim() || (!isEditing && currSelected.length === 0)}
              theme={theme}
              variant="primary"
              loading={isTesting}
            >
              {isEditing ? "Update Widget" : "Add Widget"}
            </LazyButton>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// LazyButton component with lazy loading
const LazyButton = lazy(() => Promise.resolve({
  default: ({ 
    children, 
    onClick, 
    disabled = false, 
    theme, 
    variant, 
    loading = false 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    disabled?: boolean; 
    theme: 'dark' | 'light'; 
    variant: 'cancel' | 'primary'; 
    loading?: boolean;
  }) => {
    const baseClasses = "px-4 py-2 rounded transition-all duration-200";
    
    const variantClasses = {
      cancel: theme === 'dark' 
        ? "bg-transparent text-white border border-gray-500 hover:bg-gray-700" 
        : "bg-transparent text-black border border-gray-400 hover:bg-gray-300",
      primary: "bg-violet-600 text-white hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${
          loading ? 'animate-pulse' : ''
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
    );
  }
}));