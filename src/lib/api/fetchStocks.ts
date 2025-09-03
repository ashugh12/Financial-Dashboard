// fetchStock.ts
import { getStructureValidator } from './apiValidator';
import { APICache, getCachedWidgetData, setCachedWidgetData } from './cacheUtil';
import { tryNormalizeData } from './normalizer';

const apiCache = new APICache(30000); // 30 seconds

export async function fetchIndianAPI(symbol: string) {
  const apiKey = process.env.NEXT_PUBLIC_INDIANAPI_KEY; // store in .env.local

  const res = await fetch(`https://indianapi.in/stocks/${symbol}`, {
    headers: {
      "X-Api-Key": apiKey,
      "Accept": "application/json",
    } as HeadersInit,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${symbol}: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const points = [
    {
      time: json.timestamp || new Date().toISOString(),
      value: json.lastPrice,
    },
  ];

  return { symbol, points };
}


export async function isValid(url: string): Promise<{ valid: boolean; data: any | null }> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_INDIANAPI_KEY;

    const res = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey || '',
      },
    });

    if (!res.ok) {
      console.error(`API request failed with status: ${res.status}`);
      return { valid: false, data: null };
    }

    const data = await res.json();
    if (!data || Object.keys(data).length === 0) {
      console.error('API returned empty data');
      return { valid: false, data: null };
    }

    return { valid: true, data };
  } catch (error) {
    console.error('API validation failed:', error);
    return { valid: true, data: null };
  }
}

export async function refreshWidgetData(apiUrl: string): Promise<{ valid: boolean; data: any | null; fromCache: boolean }> {
  try {
    const cachedData = apiCache.get(apiUrl);
    if (cachedData) {
      return { valid: true, data: cachedData, fromCache: true };
    }

    const result = await isValid(apiUrl);

    if (result.valid && result.data) {
      apiCache.set(apiUrl, result.data);
    } 

    return { ...result, fromCache: false };
  } catch (error) {
    console.error( error);

    const cachedData = apiCache.get(apiUrl);
    if (cachedData) {

      return { valid: true, data: cachedData, fromCache: true };
    }

    return { valid: false, data: null, fromCache: false };
  }
}

export async function refreshWidgetDataWithCache(
  widgetId: string,
  apiUrl: string,
  maxCacheAge: number = 300000
): Promise<{ valid: boolean; data: any | null; fromCache: boolean }> {
  try {
    // Check localStorage cache
    const cachedWidgetData = getCachedWidgetData(widgetId, maxCacheAge);
    const validator = getStructureValidator(apiUrl);

    if (cachedWidgetData && (!validator || validator(cachedWidgetData.data))) {
      return { valid: true, data: cachedWidgetData.data, fromCache: true };
    }

    const result = await isValid(apiUrl);

    if (result.valid && result.data) {
      // Normalize the data mean, use the gemini to bring the result
      const normalized = await tryNormalizeData(result.data);
      const payload = normalized || result.data;

      // Cache to localStorage
      setCachedWidgetData(widgetId, payload, apiUrl);

      return { valid: true, data: payload, fromCache: false };
    }

    return { ...result, fromCache: false };
  } catch (error) {
    console.error(`[WIDGET ERROR] Failed to refresh widget ${widgetId}:`, error);

    const cachedWidgetData = getCachedWidgetData(widgetId, maxCacheAge);
    if (cachedWidgetData) {

      return { valid: true, data: cachedWidgetData.data, fromCache: true };
    }

    return { valid: false, data: null, fromCache: false };
  }
}
