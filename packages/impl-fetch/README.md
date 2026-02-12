# @ureq/impl-fetch

基于 Fetch API 的请求器实现。

## 安装

```bash
npm install @ureq/core @ureq/impl-fetch
# 或
pnpm add @ureq/core @ureq/impl-fetch
```

## 使用

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
}));

// 发起请求
const users = await request.get('/users');
```

## 配置选项

```typescript
interface FetchRequestorOptions {
  baseURL?: string;                      // API 基础 URL
  defaultHeaders?: Record<string, string>;  // 默认请求头
}
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

## 示例

### 基础用法

```typescript
const requestor = new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
});

const request = new Request(requestor);
const data = await request.get('/users');
```

### 带认证

```typescript
const requestor = new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  defaultHeaders: {
    'Authorization': 'Bearer your-token'
  }
});
```

### 使用拦截器添加超时

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    timeout: {
      timeout: 10000  // 10 秒超时
    }
  }
);
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
