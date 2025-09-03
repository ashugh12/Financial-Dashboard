// utils/flattenTrending.ts
import { 
  toShort, 
  findFirstArrayOfObjects 
} from './flatten/helpers'

import getValueByPath from './flatten/helpers'
import { 
  adaptNormalizedToFields, 
  extractCommonFieldsFromStocks, 
  extractCommonFieldsFromArray, 
  transformFromNormalized 
} from './flatten/adapters'

import transformForCard from './transformers/transformForCard'
import transformForTable from './transformers/transformForTable'
import transformForChart from './transformers/transformForChart'

export function flattenTrending(obj: any, parentKey = "data") {
  let fields: { key: string; type: string; sample?: any; displayName?: string }[] = []
  if (!obj || typeof obj !== "object") return fields

  if (Array.isArray(obj.fields) && Array.isArray(obj.items)) {
    return adaptNormalizedToFields(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      return extractCommonFieldsFromArray(obj, parentKey, 'Items')
    }
    return [{ key: parentKey, type: 'array', sample: `[${obj.length} items]`, displayName: 'Items' }]
  }

  if (obj.trending_stocks) {
    return extractCommonFieldsFromStocks(obj.trending_stocks, parentKey)
  }

  for (const [k, v] of Object.entries(obj)) {
    const newKey = `${parentKey}.${k}`;
    const displayName = toShort(k)

    if (Array.isArray(v)) {
      if (v.length > 0 && typeof v[0] === "object") {
        fields = fields.concat(extractCommonFieldsFromArray(v, newKey, displayName));
      } else {
        fields.push({
          key: newKey,
          type: "array",
          sample: `[${(v as any[]).length} items]`,
          displayName: `${displayName} (${(v as any[]).length} items)`
        })
      }
    } else if (typeof v === "object" && v !== null) {
      fields = fields.concat(flattenTrending(v, newKey))
    } else {
      fields.push({ key: newKey, type: typeof v, sample: v, displayName })
    }
  }

  return fields
}

export function transformDataForWidget(
  data: any,
  selectedFields: string[],
  widgetType: 'card' | 'table' | 'chart'
) {
  if (!data || !selectedFields.length) return null;

  if (Array.isArray(data.fields) && Array.isArray(data.items)) {
    return transformFromNormalized(data, selectedFields, widgetType)
  }

  switch (widgetType) {
    case 'card':
      return transformForCard(data, selectedFields)
    case 'table':
      return transformForTable(data, selectedFields)
    case 'chart':
      return transformForChart(data, selectedFields)
    default:
      return transformForCard(data, selectedFields)
  }
}
