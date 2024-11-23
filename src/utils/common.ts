export const findBase64InString = (input: string): string | null => {
    const base64Pattern = /([A-Za-z0-9+/=]{16,})/g; // 至少16个字符的Base64
    const match = input.match(base64Pattern);

    return match && match.length > 0 ? match[0] : null; // 返回第一个匹配的Base64字符串，若无则返回null
}

export const renderApplicationName = (name:string,packageName?:string) => {
    return packageName ? `${packageName}(${name})` : name;
}

export const parsePropContent = (content: string): { [key: string]: string } => {
    const result: { [key: string]: string } = {};
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=') as [string, string];
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
    });
    return result;
  };