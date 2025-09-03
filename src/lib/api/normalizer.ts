// normalizer.ts
export async function tryNormalizeData(sample: any): Promise<any | null> {
    try {
      const res = await fetch('/api/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fail silently and return null
    }
    return null;
  }
  