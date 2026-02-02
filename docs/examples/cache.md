# 缓存示例

## 基础缓存

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      ttl: 60000  // 缓存 60 秒
    }
  }
);

// 第一次请求会发送网络请求
const data1 = await request.get('/api/users');

// 60 秒内的相同请求会从缓存返回
const data2 = await request.get('/api/users');
```

## 自定义缓存键

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      ttl: 60000,
      getCacheKey: (url, options) => {
        const params = new URLSearchParams(options?.params).toString();
        return `${url}?${params}`;
      }
    }
  }
);
```

## LocalStorage 缓存

```typescript
import { CacheStore } from '@ureq/core';

class LocalStorageCacheStore implements CacheStore {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      store: new LocalStorageCacheStore(),
      ttl: 3600000  // 1 小时
    }
  }
);
```

## 相关

- [缓存功能](/guide/features/cache)
- [幂等性保证](/guide/features/idempotent)
