/**
 * Cache store interface for storing and retrieving cached data
 */
export interface CacheStore {
  /**
   * Get a value from the cache
   */
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  
  /**
   * Set a value in the cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void> | void;
  
  /**
   * Delete a value from the cache
   */
  delete(key: string): Promise<void> | void;
  
  /**
   * Clear all values from the cache
   */
  clear(): Promise<void> | void;
  
  /**
   * Check if a key exists in the cache
   */
  has(key: string): Promise<boolean> | boolean;
}

/**
 * Simple in-memory cache store implementation
 */
export class MemoryCacheStore implements CacheStore {
  private cache = new Map<string, { value: any; expires?: number }>();

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl : undefined;
    this.cache.set(key, { value, expires });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}
