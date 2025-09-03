import React, { useEffect, useState } from 'react'
import getValueByPath from '@/utils/getValueByPath';
import { transformDataForWidget } from '@/utils/flatten';
import { useThemeStore } from '@/store/themeStore';

// Helper function to format display names with proper casing
function formatDisplayName(key: string): string {
  const lastPart = key.split('.').pop() || key;
  return lastPart
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to format values nicely
function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) return JSON.stringify(value);
    return `[${value.length} items]`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

interface WidgetProps {
  title: string;
  type: string;
  refreshInterval: number;
  onRemove?: () => void;
  onConfigure?: () => void;
  children?: React.ReactNode;
  selected?: string[];
  data?: any;
  apiUrl?: string;
  onRefresh?: () => void;
  dragAttributes?: any;
  dragListeners?: any;
}

export default function Widget({
  title,
  type,
  refreshInterval,
  onRemove,
  onConfigure,
  children,
  selected = [],
  data,
  apiUrl,
  onRefresh,
  dragAttributes,
  dragListeners,
}: WidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const { theme } = useThemeStore();

  // Auto-refresh functionality
  useEffect(() => {
    if (!apiUrl || !onRefresh || refreshInterval <= 0) return;

    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true);
        setLastRefreshError(null);
        await onRefresh();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        setLastRefreshError('Auto-refresh failed');
      } finally {
        // Reset refreshing state after a short delay
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [apiUrl, onRefresh, refreshInterval]);

  const icons: Record<string, React.ReactNode> = {
    card: <span className="text-lg">⊞</span>,
    table: <span className="text-lg">⊟</span>,
    chart: <span className="text-lg">📊</span>,
  };

  const icon = icons[type] || <span className="text-lg">📊</span>;

  const renderWidgetContent = () => {
    const transformedData = transformDataForWidget(data, selected, type as 'card' | 'table' | 'chart');
    
    switch (type) {
      case 'card':
        return renderCardContent(transformedData);
      case 'table':
        return renderTableContent(transformedData);
      case 'chart':
        return renderChartContent(transformedData);
      default:
        return renderCardContent(transformedData);
    }
  };

  const renderCardContent = (cardData: any) => {
    if (!cardData) return <div className="text-gray-400">No data available</div>;
    
    // If cardData is an array of company cards
    if (Array.isArray(cardData)) {
      return (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {cardData.map((companyCard, index) => (
            <div key={index} className={`border rounded p-3 ${
              theme === 'dark' 
                ? 'bg-black border-gray-800' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              {/* Company Name at the top */}
              <div className={`text-sm font-semibold mb-2 border-b pb-1 ${
                theme === 'dark' 
                  ? 'text-white border-gray-800' 
                  : 'text-black border-gray-300'
              }`}>
                {companyCard.companyName}
              </div>
              
              {/* Data points in compact horizontal layout with wrapping */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(companyCard.data).map(([key, value]) => (
                  <div key={key} className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    theme === 'dark' 
                      ? 'bg-gray-900' 
                      : 'bg-gray-200'
                  }`}>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{key}:</span>
                    <span className={`font-mono ml-1 ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>{formatValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for single card data
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(cardData).map(([key, value]) => (
          <div key={key} className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
            theme === 'dark' 
              ? 'bg-gray-900' 
              : 'bg-gray-200'
          }`}>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{key}:</span>
            <span className={`font-mono ml-1 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>{formatValue(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTableContent = (tableData: any) => {
    if (!tableData || !tableData.headers || !tableData.rows) {
      return <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No table data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b transition-colors duration-200 ${
              theme === 'dark' 
                ? 'border-gray-800 bg-gray-900' 
                : 'border-gray-300 bg-gray-100'
            }`}>
              {tableData.headers.map((header: string, index: number) => (
                <th key={index} className={`text-left py-2 px-2 font-semibold text-xs uppercase tracking-wide transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
                }`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
                theme === 'dark' 
                  ? `border-gray-800 hover:bg-gray-900/50 ${rowIndex % 2 === 0 ? 'bg-black' : 'bg-gray-900/20'}`
                  : `border-gray-200 hover:bg-gray-200/50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`
              }`}>
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className={`py-2 px-2 font-mono text-xs transition-colors duration-200 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {formatValue(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.rows.length > 10 && (
          <div className={`text-xs mt-2 text-center py-1 rounded transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-400 bg-gray-900' 
              : 'text-gray-600 bg-gray-100'
          }`}>
            Showing all {tableData.rows.length} entries
          </div>
        )}
      </div>
    );
  };

  const renderChartContent = (chartData: any) => {
    if (!chartData || !chartData.labels || !chartData.datasets) {
      return <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No chart data available</div>;
    }

    // Simple bar chart representation using CSS
    const maxValue = Math.max(...chartData.datasets[0]?.data || [0]);
    
    return (
      <div className="space-y-2">
        <div className={`text-xs font-medium mb-2 transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Chart Preview</div>
        {chartData.labels.slice(0, 5).map((label: string, index: number) => {
          const value = chartData.datasets[0]?.data[index] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={`truncate max-w-[60%] transition-colors duration-200 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{label}</span>
                <span className={`font-mono transition-colors duration-200 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>{formatValue(value)}</span>
              </div>
              <div className={`w-full rounded-full h-1 transition-colors duration-200 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
        {chartData.labels.length > 5 && (
          <div className={`text-xs text-center transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Showing 5 of {chartData.labels.length} data points
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border shadow-lg rounded-xl p-4 w-full transition-all duration-200 relative group ${
      theme === 'dark' 
        ? 'bg-black border-gray-800 hover:border-gray-700' 
        : 'bg-white border-gray-300 hover:border-gray-400'
    }`}>
      {/* Drag handle indicator - only this area is draggable */}
      {dragListeners && (
        <div 
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-10 bg-black/20 rounded p-1"
          {...dragAttributes}
          {...dragListeners}
        >
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className={`flex items-center justify-center gap-x-2 text-lg font-semibold transition-colors duration-200 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          <div>{icon}</div>
          {title}
                            <div className={`px-2 py-1 text-[9px] rounded-md ${isRefreshing ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}`}>
                    {refreshInterval}s
                  </div>
                  {isUsingCache && (
                    <div className="px-2 py-1 text-[9px] rounded-md bg-blue-600" title="Using cached data">
                      📦
                    </div>
                  )}
        </h2>

        <div className="flex gap-2 relative z-20">
                            {onRefresh && (
                    <button
                      onClick={async () => {
                        try {
                          setIsRefreshing(true);
                          setLastRefreshError(null);
                          await onRefresh();
                        } catch (error) {
                          console.error('Manual refresh failed:', error);
                          setLastRefreshError('Manual refresh failed');
                        } finally {
                          setTimeout(() => setIsRefreshing(false), 1000);
                        }
                      }}
                      className={`text-green-400 hover:text-green-300 hover:bg-green-900/20 p-2 rounded-md transition-colors duration-200 text-sm ${isRefreshing ? 'animate-spin' : ''}`}
                      title="Refresh data"
                      disabled={isRefreshing}
                    >
                      🔄
                    </button>
                  )}
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-2 rounded-md transition-colors duration-200 text-sm"
              title="Configure widget"
            >
              ⚙️
            </button>
          )}
        {onRemove && (
          <button
            onClick={onRemove}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-md transition-colors duration-200 text-sm"
              title="Remove widget"
          >
            ✕
          </button>
        )}
      </div>
      </div>

      {/* Data Display */}
      {selected.length > 0 && data && (
        <div className={`p-2 rounded-md max-w-full overflow-x-auto mb-2 ${
          theme === 'dark' ? 'bg-black' : 'bg-gray-50'
        }`}>
          {renderWidgetContent()}
        </div>
      )}

                    {children && <div className={`transition-colors duration-200 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{children}</div>}
              
              {/* Error Display */}
              {lastRefreshError && (
                <div className={`mt-2 p-2 rounded text-xs transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 text-red-400 border border-red-800' 
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  ⚠️ {lastRefreshError}
                </div>
              )}
    </div>
  );
}