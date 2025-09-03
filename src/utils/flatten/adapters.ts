import { toShort, findFirstArrayOfObjects, findCommonFields } from './helpers'
import getValueByPath from './helpers'

export function adaptNormalizedToFields(obj: any) {
  const first = obj.items?.[0] || {}
  return obj.fields.map((f: string) => ({
    key: f,
    type: typeof first[f],
    sample: first[f],
    displayName: toShort(f),
  }))
}

export function extractCommonFieldsFromStocks(trendingStocks: any, parentKey: string) {
  const all: any[] = []
  if (Array.isArray(trendingStocks.top_gainers)) all.push(...trendingStocks.top_gainers)
  if (Array.isArray(trendingStocks.top_losers)) all.push(...trendingStocks.top_losers)
  if (all.length === 0) return []
  const common = findCommonFields(all)
  return common.map(field => ({
    key: `${parentKey}.trending_stocks.${field}`,
    type: typeof all[0][field],
    sample: all[0][field],
    displayName: toShort(field),
  }))
}

export function extractCommonFieldsFromArray(objects: any[], parentKey: string, parentDisplayName: string) {
  if (objects.length === 0) return []
  const common = findCommonFields(objects)
  return common.map(field => ({
    key: `${parentKey}.${field}`,
    type: typeof objects[0][field],
    sample: objects[0][field],
    displayName: `${parentDisplayName} → ${toShort(field)}`,
  }))
}

export function transformFromNormalized(data: any, selected: string[], type: 'card' | 'table' | 'chart') {
  const items = data.items as any[]
  switch (type) {
    case 'card':
      return items.map((it, idx) => ({
        companyName: it.name || it.ticker || it.product || it.id || `Item ${idx + 1}`,
        data: selected.reduce((acc: any, f: string) => { acc[toShort(f)] = it[f]; return acc }, {})
      }))
    case 'table':
      return { headers: selected.map(f => toShort(f)), rows: items.map(it => selected.map(f => it[f])) }
    case 'chart': {
      const numeric = selected.filter(f => typeof items?.[0]?.[f] === 'number')
      if (numeric.length === 0) return { labels: items.map((_, i) => `#${i+1}`), datasets: [] }
      return {
        labels: items.map(it => it.name || it.ticker || it.product || it.id || ''),
        datasets: numeric.map(f => ({ label: toShort(f), data: items.map(it => (typeof it[f] === 'number' ? it[f] : 0)), backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }))
      }
    }
  }
}

export { toShort, getValueByPath, findFirstArrayOfObjects }


