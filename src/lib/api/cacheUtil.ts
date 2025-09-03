export class APICache {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private cacheDuration: number;
  
    constructor(cacheDuration = 30000) {
      this.cacheDuration = cacheDuration;
    }
  
    get(apiUrl: string) {
      const cached = this.cache.get(apiUrl);
      if (!cached) return null;
  
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      } else {
        this.cache.delete(apiUrl);
        return null;
      }
    }
  
    set(apiUrl: string, data: any) {
      this.cache.set(apiUrl, { data, timestamp: Date.now() });
    }
  }
  
  export function getCachedWidgetData(widgetId: string, maxAge: number) {
    const raw = localStorage.getItem(`widget-data-${widgetId}`);
    if (!raw) return null;
  
    try {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < maxAge) {
        return parsed;
      }
    } catch (e) {
      console.error(`Failed to parse widget cache for ${widgetId}`, e);
    }
    return null;
  }
  
  export function setCachedWidgetData(widgetId: string, data: any, apiUrl: string) {
    const cachePayload = {
      data,
      timestamp: Date.now(),
      apiUrl,
    };
    localStorage.setItem(`widget-data-${widgetId}`, JSON.stringify(cachePayload));
  }
  