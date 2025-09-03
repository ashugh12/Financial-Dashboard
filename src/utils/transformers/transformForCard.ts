// utils/transformers/transformForCard.ts
import { toShort, findFirstArrayOfObjects } from '../flatten/helpers'
import getValueByPath from '../flatten/helpers'

export default function transformForCard(data: any, selectedFields: string[]) {
  if (data.trending_stocks) {
    const allCompanies = [
      ...(data.trending_stocks.top_gainers || []),
      ...(data.trending_stocks.top_losers || [])
    ];

    if (allCompanies.length > 0) {
      return allCompanies.map(company => {
        const companyCard: any = {
          companyName: company.company_name || company.ticker_id || 'Unknown Company',
          data: {}
        }

        selectedFields.forEach(field => {
          const fieldName = field.split('.').pop() || field;
          const displayName = toShort(fieldName);
          companyCard.data[displayName] = company[fieldName] ?? 'N/A';
        });

        return companyCard;
      });
    }
  }

  const arrayInfo = findFirstArrayOfObjects(data);
  if (arrayInfo) {
    const { path: basePath, array } = arrayInfo;

    return array.map((item: any, index: number) => {
      const card: any = {
        companyName: item.company_name || item.name || item.symbol || `Item ${index + 1}`,
        data: {}
      }

      selectedFields.forEach(field => {
        const relativeKey = field.startsWith(basePath + '.') ? field.slice(basePath.length + 1) : field;
        const valueFromItem = getValueByPath(item, relativeKey);
        const value = valueFromItem !== null && valueFromItem !== undefined
          ? valueFromItem
          : getValueByPath(data, field);

        const displayName = toShort(relativeKey.split('.').pop() || field);
        card.data[displayName] = value;
      });

      return card;
    });
  }

  // Fallback
  const result: any = {
    companyName: 'Data',
    data: {}
  }

  selectedFields.forEach(field => {
    const value = getValueByPath(data, field);
    const displayName = toShort(field.split('.').pop() || field);
    result.data[displayName] = value;
  });

  return [result];
}
