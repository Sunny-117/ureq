# Cache API

缓存功能的 API 参考。

## CacheOptions

```typescript
interface CacheOptions {
  ttl?: number;
  store?: CacheStore;
  getCacheKey?: (url: string, options?: RequestOptions) => string;
}
```

### ttl

缓存过期时间（毫秒）。

- **类型**: `number`
- **默认值**: `300000` (5 分钟)

### store

缓存存储实现。

- **类型**: `CacheStore`
- **默认值**: `MemoryCacheStore`

### getCacheKey

自定义缓存键生成函数。

- **类型**: `(url: string, options?: RequestOptions) => string`

## CacheStore 接口

```typescript
interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## 使用示例

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      ttl: 60000,
      getCacheKey: (url, options) => {
        return `${url}:${JSON.stringify(options?.params)}`;
      }
    }
  }
);
```

## 相关

- [缓存功能指南](/guide/features/cache)
- [缓存示例](/examples/cache)
