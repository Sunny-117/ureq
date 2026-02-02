# @ureq/business

业务抽象层，提供 Hash 和 Cache 服务的接口定义和默认实现。

## 安装

```bash
npm install @ureq/business
# 或
pnpm add @ureq/business
```

> 注意：通常作为 `@ureq/core` 的依赖自动安装，无需单独安装

## 功能

### LibHashService

提供请求哈希生成功能，基于 `@ureq/lib-hash`。

```typescript
import { LibHashService } from '@ureq/business';

const hashService = new LibHashService();

// 生成字符串哈希
const hash = hashService.generateHash('some-string');

// 生成请求哈希
const requestHash = hashService.generateRequestHash(
  'GET',
  '/api/users',
  null,
  { params: { page: 1 } }
);
```

### LibCacheStore

提供缓存存储功能，基于 `@ureq/lib-cache-store`。

```typescript
import { LibCacheStore } from '@ureq/business';
import { MemoryStore } from '@ureq/lib-cache-store';

const memoryStore = new MemoryStore();
const cacheStore = new LibCacheStore(memoryStore);

// 存储数据
await cacheStore.set('key', { data: 'value' }, 60000);

// 获取数据
const data = await cacheStore.get('key');

// 检查是否存在
const exists = await cacheStore.has('key');

// 删除数据
await cacheStore.delete('key');

// 清空缓存
await cacheStore.clear();
```

## 接口

### HashService

```typescript
interface HashService {
  generateHash(input: string): string;
  generateRequestHash(
    method: string,
    url: string,
    data?: any,
    options?: Record<string, any>
  ): string;
}
```

### CacheStore

```typescript
interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
```

## 自定义实现

### 自定义 HashService

```typescript
import { HashService } from '@ureq/business';

class MyHashService implements HashService {
  generateRequestHash(method: string, url: string, data?: any, options?: any): string {
    // 自定义哈希生成逻辑
    return `${method}:${url}`;
  }
  
  hashString(str: string): string {
    // 自定义字符串哈希
    return btoa(str);
  }
}
```

### 自定义 CacheStore

```typescript
import { CacheStore } from '@ureq/business';

class MyCache implements CacheStore {
  async get<T>(key: string): Promise<T | null> {
    // 实现获取逻辑
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // 实现存储逻辑
  }
  
  async delete(key: string): Promise<void> {
    // 实现删除逻辑
  }
  
  async clear(): Promise<void> {
    // 实现清空逻辑
  }
}
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
