# AxiosRequestor

基于 Axios 的请求器实现。

## 安装

```bash
npm install @ureq/core @ureq/impl-axios axios
```

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { AxiosRequestor } from '@ureq/impl-axios';

const request = new Request(new AxiosRequestor());
```

## 配置选项

### AxiosRequestorConfig

```typescript
interface AxiosRequestorConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  // 其他 Axios 配置...
}
```

### baseURL

API 基础 URL。

```typescript
const requestor = new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
});
```

### headers

默认请求头。

```typescript
const requestor = new AxiosRequestor({
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
});
```

### timeout

请求超时时间（毫秒）。

```typescript
const requestor = new AxiosRequestor({
  timeout: 5000  // 5 秒超时
});
```

## 完整示例

```typescript
import { Request } from '@ureq/core';
import { AxiosRequestor } from '@ureq/impl-axios';

const request = new Request(
  new AxiosRequestor({
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

- ✅ 功能丰富
- ✅ 广泛的浏览器支持
- ✅ 自动转换 JSON 数据
- ✅ 请求和响应拦截器
- ✅ 取消请求支持
- ✅ 进度监控

## 浏览器兼容性

- Chrome
- Firefox
- Safari
- Edge
- IE 11+
- Node.js

## 何时使用

选择 AxiosRequestor 当你需要：

- 支持旧版本浏览器（IE 11+）
- 更多的配置选项
- 上传/下载进度监控
- 请求取消功能

## 相关

- [FetchRequestor](/api/implementations/fetch)
- [Requestor API](/api/core/requestor)
- [快速开始](/guide/getting-started)
