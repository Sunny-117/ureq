import { MemoryStore } from '@ureq/lib-cache-store';
import { CacheStore } from '../interfaces/cache.js';

/**
 * Cache store implementation using @ureq/lib-cache-store
 */
export class LibCacheStore implements CacheStore {
  private store: MemoryStore;

  constructor(store?: MemoryStore) {
    this.store = store || new MemoryStore();
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.store.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    return this.store.delete(key);
  }

  async clear(): Promise<void> {
    return this.store.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}
