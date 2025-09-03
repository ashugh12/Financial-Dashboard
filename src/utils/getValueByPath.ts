export default function getValueByPath(obj: any, path: string): any {
    const traver = obj['data'];

    for (let i = 0; i<traver?.length; i++) {
        const element = traver[i];
        if (element['key'] === path) {
            return element['sample'];
        }
    }

    return null;
  }
  