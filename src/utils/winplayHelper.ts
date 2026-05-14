
export function jsonToConf(data: any[]): string {
  if (!Array.isArray(data)) {
    throw new Error('[jsonToConf] 输入必须是数组');
  }

  return data
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`[jsonToConf] 第 ${index + 1} 项不是有效对象`);
      }

      const { device, name, ...rest } = item;

      // ❌ name 必须存在
      if (!name || typeof name !== 'string') {
        throw new Error(`[jsonToConf] 第 ${index + 1} 项缺少 name 或 name 不是字符串`);
      }

      const entries = Object.entries(rest).filter(
        ([, v]) => v !== undefined && v !== null
      );

      // ✔ 没有配置项也允许输出空结构
      if (entries.length === 0) {
        return `${name}:`;
      }

      const parts: string[] = [];

      entries.forEach(([key, value]) => {
        // ❌ key 校验
        if (!key || typeof key !== 'string') {
          throw new Error(
            `[jsonToConf] 第 ${index + 1} 项存在非法字段名 key：${String(key)}`
          );
        }

        // ❌ value 不能为空
        if (value === undefined || value === null) {
          throw new Error(
            `[jsonToConf] 第 ${index + 1} 项字段 "${key}" 的值不能为空`
          );
        }

        // ❌ 禁止对象 / 数组
        if (typeof value === 'object') {
          throw new Error(
            `[jsonToConf] 第 ${index + 1} 项字段 "${key}" 的值不能是对象或数组`
          );
        }

        parts.push(`${key}=${String(value)}`);
      });

      // ✔ 用 @ 分隔配置项
      return `${name}:${parts.join('@')}`;
    })
    .join('\n');
}


export function confToJson(conf: string): any[] {
  if (typeof conf !== 'string') {
    throw new Error('[confToJson] 输入必须是字符串');
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
        `[confToJson] 第 ${lineIndex + 1} 行语法错误：缺少 ":" -> ${line}`
      );
    }

    const name = line.slice(0, colonIndex).trim();
    const body = line.slice(colonIndex + 1).trim();

    // ❌ name 不能为空
    if (!name) {
      throw new Error(
        `[confToJson] 第 ${lineIndex + 1} 行语法错误：name 不能为空`
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
          `[confToJson] 第 ${lineIndex + 1} 行，第 ${itemIndex + 1} 项语法错误：缺少 "=" -> ${item}`
        );
      }

      const key = item.slice(0, eqIndex).trim();
      const value = item.slice(eqIndex + 1);

      // ❌ key 不能为空
      if (!key) {
        throw new Error(
          `[confToJson] 第 ${lineIndex + 1} 行，第 ${itemIndex + 1} 项语法错误：key 不能为空 -> ${item}`
        );
      }

      // ❌ 重复 key
      if (obj[key] !== undefined) {
        throw new Error(
          `[confToJson] 第 ${lineIndex + 1} 行：重复的配置项 "${key}"`
        );
      }

      obj[key] = value;
    });

    result.push(obj);
  });

  return result;
}