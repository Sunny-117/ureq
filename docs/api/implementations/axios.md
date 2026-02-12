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

## 响应类型

支持多种响应类型，通过 `responseType` 选项指定：

```typescript
// JSON（默认）
const jsonRes = await request.get<User>('/api/user/1');

// 文本
const textRes = await request.get<string>('/robots.txt', {
  responseType: 'text',
});

// Blob
const blobRes = await request.get<Blob>('/api/image.png', {
  responseType: 'blob',
});

// ArrayBuffer
const bufferRes = await request.get<ArrayBuffer>('/api/file', {
  responseType: 'arraybuffer',
});
```

## 自定义响应转换

使用 `responseTransformer` 自定义响应解析：

```typescript
const res = await request.get<User>('/api/user/1', {
  responseTransformer: async (axiosResponse) => {
    // axiosResponse 包含 data, status, headers 等
    return axiosResponse.data.user;
  },
});
```

::: tip
注意：AxiosRequestor 的 `responseTransformer` 接收的是 axios 响应对象，而不是原始 Response。
:::

详细用法请参考 [响应类型与转换](/guide/features/response-type)。

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
- ✅ 多种响应类型支持
- ✅ 自定义响应转换器

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
- [响应类型与转换](/guide/features/response-type)
- [快速开始](/guide/getting-started)
