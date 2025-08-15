// utils/fetchWithCache.ts
import { useCacheStore } from '@/stores/cache';

interface CacheOptions {
  expire?: number;       // ms 有效期
  persistent?: boolean;  // true = 持久缓存, false = 临时缓存
}

/**
 * setCache
 * 直接存值
 * 自动处理 string / number / boolean / object
 */
export function setCache<T extends string | number | boolean | object>(
  key: string,
  value: T,
  options?: CacheOptions
): T {
  const cacheStore = useCacheStore();
  cacheStore.setCache(key, value, options);
  return value;
}

/**
 * getCache
 * 自动反序列化 string / number / boolean / object
 */
export function getCache<T extends string | number | boolean | object>(
  key: string
): T | null {
  const cacheStore = useCacheStore();
  const stored = cacheStore.getCache<string | number | boolean | object>(key);
  if (stored === null) return null;

  // 处理布尔值
  if (stored === 'true') return true as T;
  if (stored === 'false') return false as T;

  // 自动解析 JSON 或 number
  if (typeof stored === 'string') {
    try {
      return JSON.parse(stored) as T;
    } catch {
      const num = Number(stored);
      if (!isNaN(num)) return num as T;
      return stored as T;
    }
  }

  return stored as T;
}
