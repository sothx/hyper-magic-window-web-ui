export type DxvkMiConfigJson = Record<string, Record<string, string>>;

export function jsonToConf(data: any[]): string {
  return data
    .map(item => {
      const { device, name, ...rest } = item;

      const entries = Object.entries(rest).filter(
        ([_, v]) => v !== undefined && v !== null
      );

      if (entries.length === 0) return `${name}:`;

      const parts = entries.map(([k, v], i) => {
        return `${i === 0 ? '' : '@'}${k}=${String(v)}`;
      });

      return `${name}:${parts.join(';')}`;
    })
    .join('\n');
}


export function confToJson(conf: string): any[] {
  return conf
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return null;

      const name = line.slice(0, colonIndex);
      const body = line.slice(colonIndex + 1);

      const obj: any = { name };

      // 1. 只按 @ 分隔配置项
      const items = body.split('@');

      for (const item of items) {
        if (!item) continue;

        const eqIndex = item.indexOf('=');
        if (eqIndex === -1) continue;

        const key = item.slice(0, eqIndex).trim();
        const value = item.slice(eqIndex + 1); // ❗原样保留 ; 不处理

        obj[key] = value;
      }

      return obj;
    })
    .filter(Boolean);
}