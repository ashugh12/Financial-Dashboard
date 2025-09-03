export function getStructureValidator(apiUrl: string): ((data: any) => boolean) | undefined {
    if (apiUrl.includes('/trending')) {
      return (data: any) => Array.isArray(data?.trending_stocks);
    }
    if (apiUrl.includes('/commodities')) {
      return (data: any) => Array.isArray(data?.commodities);
    }
    if (apiUrl.includes('/stocks')) {
      return (data: any) => typeof data?.lastPrice === 'number';
    }
    return undefined;
  }
  