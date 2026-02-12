# FetchRequestor

基于 Fetch API 的请求器实现。

## 安装

```bash
npm install @ureq/core @ureq/impl-fetch
```

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());
```

## 配置选项

### FetchRequestorConfig

```typescript
interface FetchRequestorConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}
```

### baseURL

API 基础 URL。

```typescript
const requestor = new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
});
```

### headers

默认请求头。

```typescript
const requestor = new FetchRequestor({
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
});
```

### timeout

请求超时时间（毫秒）。

```typescript
const requestor = new FetchRequestor({
  timeout: 5000  // 5 秒超时
});
```

## 完整示例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  }),
  {
    retry: { maxRetries: 3 },
    cache: { ttl: 60000 }
  }
);

// 使用
const users = await request.get('/users');
```

## 特性

- ✅ 轻量级，无额外依赖
- ✅ 支持现代浏览器和 Node.js 18+
- ✅ 原生 Promise 支持
- ✅ 支持 AbortController
- ✅ 完整的 TypeScript 类型

## 浏览器兼容性

- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+
- Node.js 18+

## 相关

- [AxiosRequestor](/api/implementations/axios)
- [Requestor API](/api/core/requestor)
- [快速开始](/guide/getting-started)
