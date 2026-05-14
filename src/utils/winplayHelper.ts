
export function jsonToConf(data: any[]): string {
  if (!Array.isArray(data)) {
    throw new Error('[jsonToConf] input must be array');
  }

  return data
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`[jsonToConf] invalid item at index ${index}`);
      }

      const { device, name, ...rest } = item;

      // ❌ name 必须存在
      if (!name || typeof name !== 'string') {
        throw new Error(`[jsonToConf] missing or invalid name at index ${index}`);
      }

      const entries = Object.entries(rest).filter(
        ([k, v]) => v !== undefined && v !== null
      );

      // ❌ 没有配置项也允许，但要明确输出
      if (entries.length === 0) {
        return `${name}:`;
      }

      const parts: string[] = [];

      entries.forEach(([key, value], i) => {
        // ❌ key 校验
        if (!key || typeof key !== 'string') {
          throw new Error(
            `[jsonToConf] invalid key at index ${index}: ${String(key)}`
          );
        }

        // ❌ value 校验
        if (value === undefined || value === null) {
          throw new Error(
            `[jsonToConf] invalid value for key "${key}" at index ${index}`
          );
        }

        // ❌ 禁止对象 / array（防 JSON 污染）
        if (typeof value === 'object') {
          throw new Error(
            `[jsonToConf] value must be primitive string/number at key "${key}" (index ${index})`
          );
        }

        parts.push(`${key}=${String(value)}`);
      });

      // ✔ 只用 @ 拼接（关键修正点）
      return `${name}:${parts.join('@')}`;
    })
    .join('\n');
}


export function confToJson(conf: string): any[] {
  if (typeof conf !== 'string') {
    throw new Error('[confToJson] input must be string');
  }

  const lines = conf
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const result: any[] = [];

  lines.forEach((line, lineIndex) => {
    const colonIndex = line.indexOf(':');

    // ❌ 必须包含 name
    if (colonIndex === -1) {
      throw new Error(
        `[confToJson] syntax error at line ${lineIndex + 1}: missing ":" -> ${line}`
      );
    }

    const name = line.slice(0, colonIndex).trim();
    const body = line.slice(colonIndex + 1).trim();

    // ❌ name 不能为空
    if (!name) {
      throw new Error(
        `[confToJson] syntax error at line ${lineIndex + 1}: empty name`
      );
    }

    const obj: any = { name };

    // 1. 按 @ 分隔配置项
    const items = body.split('@');

    items.forEach((item, itemIndex) => {
      if (!item) return;

      const eqIndex = item.indexOf('=');

      // ❌ 必须有 =
      if (eqIndex === -1) {
        throw new Error(
          `[confToJson] syntax error at line ${lineIndex + 1}, item ${itemIndex + 1}: missing "=" -> ${item}`
        );
      }

      const key = item.slice(0, eqIndex).trim();
      const value = item.slice(eqIndex + 1);

      // ❌ key 不能为空
      if (!key) {
        throw new Error(
          `[confToJson] syntax error at line ${lineIndex + 1}, item ${itemIndex + 1}: empty key -> ${item}`
        );
      }

      // ❌ duplicate key 检查
      if (obj[key] !== undefined) {
        throw new Error(
          `[confToJson] duplicate key "${key}" at line ${lineIndex + 1}`
        );
      }

      obj[key] = value;
    });

    result.push(obj);
  });

  return result;
}