interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class MemoryStore {
  private store = new Map<string, CacheItem<any>>();

  set<T>(key: string, value: T, ttl: number = 0): void {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;

    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.store.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
} 