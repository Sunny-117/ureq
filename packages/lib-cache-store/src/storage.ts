export class StorageStore {
  constructor(private storage: Storage = localStorage) {}

  private getKey(key: string): string {
    return `cache:${key}`;
  }

  set<T>(key: string, value: T, ttl: number = 0): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    this.storage.setItem(this.getKey(key), JSON.stringify(item));
  }

  get<T>(key: string): T | undefined {
    const data = this.storage.getItem(this.getKey(key));
    if (!data) return undefined;

    const item = JSON.parse(data);
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    return this.storage.getItem(this.getKey(key)) !== null;
  }

  delete(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  clear(): void {
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith('cache:')) {
        this.storage.removeItem(key);
      }
    });
  }
} 