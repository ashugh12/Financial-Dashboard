// utils/transformers/transformForChart.ts
import { toShort } from '../flatten/helpers'
import getValueByPath from '../flatten/helpers'

export default function transformForChart(data: any, selectedFields: string[]) {
  if (data.trending_stocks) {
    const { top_gainers, top_losers } = data.trending_stocks;
    const allStocks = [...(top_gainers || []), ...(top_losers || [])];

    if (allStocks.length > 0) {
      const numericFields = selectedFields.filter(field => {
        const key = field.split('.').pop() || field;
        const sampleValue = allStocks[0]?.[key];
        return typeof sampleValue === 'number';
      });

      if (numericFields.length > 0) {
        const datasets = numericFields.map(field => {
          const key = field.split('.').pop() || field;
          const label = toShort(key);
          const values = allStocks.map(stock => stock[key] ?? 0);

          return {
            label,
            data: values,
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
            borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
            borderWidth: 1
          };
        });

        const labels = allStocks.map(stock => stock.ticker_id || stock.company_name || 'Unknown');

        return {
          labels,
          datasets
        };
      }
    }
  }

  // Fallback
  return {
    labels: ['Data'],
    datasets: [{
      label: 'Value',
      data: selectedFields.map(field => {
        const value = getValueByPath(data, field);
        return typeof value === 'number' ? value : 0;
      }),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
}
