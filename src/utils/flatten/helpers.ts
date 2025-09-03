// Short, logical key naming (keeps code compact and labels readable)
export function toShort(key: string): string {
  const raw = key.split(/[._-]/).pop() || key
  const map: Record<string, string> = {
    ticker_id: 'ticker',
    company_name: 'name',
    percent_change: 'chg%',
    per_change: 'chg%',
    net_change: 'chg',
    last_traded_price: 'ltp',
    last_traded_quantity: 'ltq',
    last_traded_time: 'ltt',
    average_traded_price: 'avg',
    total_quantity_traded: 'qty',
    open_interest: 'oi',
    open_interest_change: 'oiΔ',
    open_interest_per_change: 'oi%'
  }
  const short = map[raw as keyof typeof map] || raw
  return short.replace(/([A-Z]+)/g, ' $1').trim().toLowerCase()
}

export default function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function findFirstArrayOfObjects(obj: any, currentPath: string = 'data'): { path: string; array: any[] } | null {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && !Array.isArray(obj[0])) {
      return { path: currentPath, array: obj };
    }
    return null;
  }
  for (const [key, value] of Object.entries(obj)) {
    const nextPath = `${currentPath}.${key}`;
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0])) {
        return { path: nextPath, array: value as any[] };
      }
    }
    if (value && typeof value === 'object') {
      const found = findFirstArrayOfObjects(value, nextPath);
      if (found) return found;
    }
  }
  return null;
}

export function findCommonFields(objects: any[]): string[] {
  if (objects.length === 0) return [];
  const firstObjectFields = Object.keys(objects[0]);
  return firstObjectFields.filter(field => objects.every(obj => Object.prototype.hasOwnProperty.call(obj, field)));
}


