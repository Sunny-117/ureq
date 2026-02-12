# @ureq/core

核心请求库，提供统一的请求接口和功能组合。

## 安装

```bash
npm install @ureq/core @ureq/impl-fetch
# 或
pnpm add @ureq/core @ureq/impl-fetch
```

## 快速开始

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建请求实例
const request = new Request(new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
}));

// 发起请求
const data = await request.get('/users');
```

## 功能特性

- 🎯 **多种实现支持** - 支持 Fetch 和 Axios
- 🔄 **智能重试** - 自动重试失败的请求
- 💾 **请求缓存** - 内置缓存机制
- 🚦 **拦截器** - 请求和响应拦截
- ⚡ **并发控制** - 限制并发请求数量
- 🔒 **幂等性保证** - 自动去重相同请求
- ⏱️ **超时控制** - 灵活的超时配置

## 配置选项

```typescript
const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    },
    cache: {
      ttl: 60000
    },
    timeout: {
      timeout: 5000
    },
    parallel: {
      maxConcurrent: 5
    },
    idempotent: {
      dedupeTime: 1000
    }
  }
);
```

## 拦截器

```typescript
// 请求拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    return config;
  }
});

// 响应拦截器
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    console.log('Response:', response.status);
    return response;
  },
  onResponseError: (error) => {
    console.error('Error:', error);
    throw error;
  }
});
```

## API

### Request 类

- `get<T>(url, options?)` - GET 请求
- `post<T>(url, data?, options?)` - POST 请求
- `put<T>(url, data?, options?)` - PUT 请求
- `delete<T>(url, options?)` - DELETE 请求
- `patch<T>(url, data?, options?)` - PATCH 请求

### 拦截器

- `interceptors.addRequestInterceptor(interceptor)` - 添加请求拦截器
- `interceptors.addResponseInterceptor(interceptor)` - 添加响应拦截器

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
