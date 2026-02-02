# @ureq/lib-hash

哈希工具库，提供请求哈希和字符串哈希功能。

## 安装

```bash
npm install @ureq/lib-hash
# 或
pnpm add @ureq/lib-hash
```

> 注意：通常作为 `@ureq/business` 的依赖自动安装，无需单独安装

## 使用

```typescript
import { generateHash, generateRequestHash } from '@ureq/lib-hash';

// 生成字符串哈希
const hash = generateHash('some-string');

// 生成请求哈希
const requestHash = generateRequestHash(
  'GET',
  '/api/users',
  null,
  { params: { page: 1 } }
);
```

## API

### generateHash

生成字符串的哈希值。

```typescript
function generateHash(input: string): string
```

### generateRequestHash

生成请求的唯一哈希值。

```typescript
function generateRequestHash(
  method: string,
  url: string,
  data?: any,
  options?: Record<string, any>
): string
```

## 功能

### generateRequestHash

生成请求的唯一哈希值，用于：

- 请求去重（幂等性保证）
- 缓存键生成
- 请求标识

```typescript
import { generateRequestHash } from '@ureq/lib-hash';

const hash1 = generateRequestHash('GET', '/users', null, { params: { page: 1 } });
const hash2 = generateRequestHash('GET', '/users', null, { params: { page: 1 } });

console.log(hash1 === hash2);  // true - 相同的请求生成相同的哈希
```

### generateHash

生成字符串的哈希值。

```typescript
import { generateHash } from '@ureq/lib-hash';

const hash = generateHash('hello world');
console.log(hash);  // 生成的哈希值
```

## 哈希算法

使用简单高效的字符串哈希算法，将输入转换为 32 位整数，然后转换为 36 进制字符串。适用于大多数场景。

## 使用场景

### 请求去重

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';
import { generateRequestHash } from '@ureq/lib-hash';

const request = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      getRequestId: (method, url, data, options) => {
        return generateRequestHash(method, url, data, options);
      },
      dedupeTime: 1000
    }
  }
);
```

### 缓存键生成

```typescript
import { generateRequestHash } from '@ureq/lib-hash';

const request = new Request(
  new FetchRequestor(),
  {
    cache: {
      getCacheKey: (url, options) => {
        return generateRequestHash('GET', url, null, options);
      }
    }
  }
);
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
