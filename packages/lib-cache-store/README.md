# @ureq/lib-cache-store

缓存存储实现，提供内存缓存和 Storage 缓存。

## 安装

```bash
npm install @ureq/lib-cache-store
# 或
pnpm add @ureq/lib-cache-store
```

## 使用

### MemoryStore

内存缓存实现，适用于浏览器和 Node.js。

```typescript
import { MemoryStore } from '@ureq/lib-cache-store';

const cache = new MemoryStore();

// 存储数据（TTL 单位：毫秒）
cache.set('key', { data: 'value' }, 60000);

// 获取数据
const data = cache.get('key');

// 检查是否存在
const exists = cache.has('key');

// 删除数据
cache.delete('key');

// 清空缓存
cache.clear();
```

### StorageStore

基于 Web Storage API 的缓存实现（localStorage/sessionStorage）。

```typescript
import { StorageStore } from '@ureq/lib-cache-store';

// 使用 localStorage
const localCache = new StorageStore(localStorage);

// 使用 sessionStorage
const sessionCache = new StorageStore(sessionStorage);

// 使用方式与 MemoryStore 相同
localCache.set('user', { id: 1, name: 'John' }, 3600000);
const user = localCache.get('user');
```

## API

### MemoryStore

```typescript
class MemoryStore {
  set<T>(key: string, value: T, ttl?: number): void;
  get<T>(key: string): T | undefined;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

### StorageStore

```typescript
class StorageStore {
  constructor(storage?: Storage);
  
  set<T>(key: string, value: T, ttl?: number): void;
  get<T>(key: string): T | undefined;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}
```

## 特性

### MemoryStore

- ✅ 快速访问
- ✅ 支持浏览器和 Node.js
- ✅ 自动过期清理
- ✅ 同步 API
- ⚠️ 数据不持久化

### StorageStore

- ✅ 数据持久化
- ✅ 跨页面共享（localStorage）
- ✅ 自动过期清理
- ✅ 同步 API
- ⚠️ 仅支持浏览器
- ⚠️ 存储空间有限（通常 5-10MB）

## 示例

### 基础用法

```typescript
import { MemoryStore } from '@ureq/lib-cache-store';

const cache = new MemoryStore();

// 存储数据（TTL: 60 秒）
cache.set('key', { data: 'value' }, 60000);

// 获取数据
const data = cache.get('key');

// 检查是否存在
if (cache.has('key')) {
  console.log('Key exists');
}

// 删除数据
cache.delete('key');

// 清空缓存
cache.clear();
```

### 持久化缓存

```typescript
import { StorageStore } from '@ureq/lib-cache-store';

const cache = new StorageStore(localStorage);

// 数据会保存到 localStorage
cache.set('user', { id: 1, name: 'John' }, 3600000);

// 刷新页面后仍然可以获取
const user = cache.get('user');
```

### 与 @ureq/core 集成

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';
import { LibCacheStore } from '@ureq/business';
import { MemoryStore } from '@ureq/lib-cache-store';

const memoryStore = new MemoryStore();
const cacheStore = new LibCacheStore(memoryStore);

const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      store: cacheStore,
      ttl: 60000
    }
  }
);
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
