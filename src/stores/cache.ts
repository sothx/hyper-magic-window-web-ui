import { defineStore } from 'pinia';

type CacheValue = { value: string; time: number; expire?: number };

export const useCacheStore = defineStore('cache', {
  state: () => ({
    tempCache: {} as Record<string, CacheValue>,
    persistentCache: {} as Record<string, CacheValue>
  }),

  actions: {
    /**
     * 存缓存，自动序列化 value
     */
    setCache(
      key: string,
      value: string | number | boolean | object,
      options?: { expire?: number; persistent?: boolean }
    ) {
      // 保证 key 唯一
      delete this.tempCache[key];
      delete this.persistentCache[key];

      let storeValue: string;
      if (typeof value === 'string') {
        storeValue = value;
      } else if (typeof value === 'boolean') {
        storeValue = value ? 'true' : 'false';
      } else {
        storeValue = JSON.stringify(value);
      }

      const entry: CacheValue = {
        value: storeValue,
        time: Date.now(),
        expire: options?.expire
      };

      if (options?.persistent) {
        this.persistentCache[key] = entry;
      } else {
        this.tempCache[key] = entry;
      }
    },

    /**
     * 取缓存，自动反序列化成原始类型，包括布尔值
     */
    getCache<T extends string | number | boolean | object>(key: string): T | null {
      const entry = this.tempCache[key] ?? this.persistentCache[key];
      if (!entry) return null;

      if (entry.expire && Date.now() - entry.time >= entry.expire) {
        delete this.tempCache[key];
        delete this.persistentCache[key];
        return null;
      }

      const stored = entry.value;

      // 先处理布尔值
      if (stored === 'true') return true as T;
      if (stored === 'false') return false as T;

      // 自动解析 JSON 或 number
      try {
        return JSON.parse(stored) as T;
      } catch {
        const num = Number(stored);
        if (!isNaN(num)) return num as T;
        return stored as T;
      }
    },

    clearCache(key?: string) {
      if (key) {
        delete this.tempCache[key];
        delete this.persistentCache[key];
      } else {
        this.tempCache = {};
        this.persistentCache = {};
      }
    }
  },

  persist: {
    key: 'cache',          // localStorage key
    storage: localStorage,
    pick: ['persistentCache'] // 只持久化 persistentCache
  }
});
