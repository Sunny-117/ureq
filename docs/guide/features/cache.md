# 请求缓存

通过缓存减少不必要的网络请求，提升应用性能。

## 基础用法

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
const data2 = await request.get('/api/users');  // 从缓存获取
```

## 配置选项

### ttl

缓存过期时间（毫秒）。

```typescript
{
  cache: {
    ttl: 60000  // 默认值：5 分钟 (300000ms)
  }
}
```

### store

自定义缓存存储。

```typescript
import { MemoryCacheStore } from '@ureq/lib-cache-store';

{
  cache: {
    store: new MemoryCacheStore()  // 默认使用内存存储
  }
}
```

### getCacheKey

自定义缓存键生成函数。

```typescript
{
  cache: {
    getCacheKey: (url, options) => {
      // 只根据 URL 生成缓存键，忽略其他参数
      return url;
    }
  }
}
```

## 缓存策略

### 只缓存 GET 请求

默认情况下，只有 GET 请求会被缓存：

```typescript
// 会被缓存
await request.get('/api/users');

// 不会被缓存
await request.post('/api/users', { name: 'John' });
await request.put('/api/users/1', { name: 'Jane' });
await request.delete('/api/users/1');
```

### 自定义缓存键

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      ttl: 60000,
      getCacheKey: (url, options) => {
        // 包含查询参数的缓存键
        const params = new URLSearchParams(options?.params).toString();
        return `${url}?${params}`;
      }
    }
  }
);
```

## 自定义存储

### 使用 LocalStorage

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

## 实际示例

### 示例 1：用户数据缓存

```typescript
const userRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    cache: {
      ttl: 300000,  // 5 分钟
      getCacheKey: (url, options) => {
        return `user:${url}`;
      }
    }
  }
);

// 获取用户信息（会缓存）
const user = await userRequest.get('/users/123');

// 5 分钟内再次获取，从缓存返回
const cachedUser = await userRequest.get('/users/123');
```

### 示例 2：分页数据缓存

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      ttl: 60000,
      getCacheKey: (url, options) => {
        const page = options?.params?.page || 1;
        const pageSize = options?.params?.pageSize || 10;
        return `${url}:page=${page}:size=${pageSize}`;
      }
    }
  }
);

// 不同页码会有不同的缓存
const page1 = await request.get('/api/posts', { params: { page: 1 } });
const page2 = await request.get('/api/posts', { params: { page: 2 } });
```

## 注意事项

1. **缓存大小** - 注意内存缓存的大小，避免内存溢出
2. **缓存失效** - 合理设置 TTL，确保数据的时效性
3. **缓存键** - 确保缓存键的唯一性，避免冲突
4. **敏感数据** - 不要缓存敏感数据（如密码、token）

## 相关功能

- [幂等性保证](/guide/features/idempotent) - 避免重复请求
- [并发控制](/guide/features/parallel) - 控制并发数量
