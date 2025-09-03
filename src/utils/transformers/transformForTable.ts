// utils/transformers/transformForTable.ts
import { toShort, findFirstArrayOfObjects } from '../flatten/helpers'
import getValueByPath from '../flatten/helpers'


export default function transformForTable(data: any, selectedFields: string[]) {
  if (data.trending_stocks) {
    const { top_gainers, top_losers } = data.trending_stocks;
    const allStocks = [...(top_gainers || []), ...(top_losers || [])];

    if (allStocks.length > 0) {
      const headers = selectedFields.map(field => toShort(field.split('.').pop() || field));
      const rows = allStocks.map(stock =>
        selectedFields.map(field => {
          const key = field.split('.').pop() || field;
          return stock[key] ?? 'N/A';
        })
      );

      return { headers, rows };
    }
  }

  const arrayInfo = findFirstArrayOfObjects(data);
  if (arrayInfo) {
    const { path: basePath, array } = arrayInfo;
    const headers = selectedFields.map(field => toShort(field.split('.').pop() || field));
    const rows = array.map((item: any) =>
      selectedFields.map(field => {
        const relativeKey = field.startsWith(basePath + '.') ? field.slice(basePath.length + 1) : field;
        const valueFromItem = getValueByPath(item, relativeKey);
        return valueFromItem !== null && valueFromItem !== undefined
          ? valueFromItem
          : getValueByPath(data, field);
      })
    );

    return { headers, rows };
  }

  const headers = selectedFields.map(field => toShort(field.split('.').pop() || field));
  const rows = [selectedFields.map(field => getValueByPath(data, field))];

  return { headers, rows };
}
