# 配置选项

了解 @ureq 的各种配置选项。

## 请求器配置

### FetchRequestor 配置

```typescript
import { FetchRequestor } from '@ureq/impl-fetch';

const requestor = new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  timeout: 10000
});
```

### AxiosRequestor 配置

```typescript
import { AxiosRequestor } from '@ureq/impl-axios';

const requestor = new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});
```

## 功能配置

### 重试配置

```typescript
const request = new Request(requestor, {
  retry: {
    maxRetries: 3,        // 最多重试 3 次
    retryDelay: 1000,     // 每次重试间隔 1 秒
    shouldRetry: (error) => {
      // 自定义重试条件
      return error.status >= 500;
    }
  }
});
```

### 缓存配置

```typescript
import { MemoryCacheStore } from '@ureq/lib-cache-store';

const request = new Request(requestor, {
  cache: {
    ttl: 60000,  // 缓存 60 秒
    store: new MemoryCacheStore(),
    getCacheKey: (url, options) => {
      // 自定义缓存键
      return `${url}:${JSON.stringify(options?.params)}`;
    }
  }
});
```

### 并发控制配置

```typescript
const request = new Request(requestor, {
  parallel: {
    maxConcurrent: 5,  // 最多 5 个并发请求
    timeout: 30000     // 总超时 30 秒
  }
});
```

### 幂等性配置

```typescript
const request = new Request(requestor, {
  idempotent: {
    dedupeTime: 1000,  // 1 秒内去重
    getRequestId: (method, url, data, options) => {
      // 自定义请求 ID
      return `${method}:${url}`;
    }
  }
});
```

### 超时配置

```typescript
const request = new Request(requestor, {
  timeout: {
    timeout: 5000  // 5 秒超时
  }
});
```

## 组合配置

### 完整配置示例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';
import { MemoryCacheStore } from '@ureq/lib-cache-store';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0'
    },
    timeout: 10000
  }),
  {
    // 重试配置
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      shouldRetry: (error) => {
        return error.status >= 500 || !error.status;
      }
    },
    
    // 缓存配置
    cache: {
      ttl: 300000,  // 5 分钟
      store: new MemoryCacheStore(),
      getCacheKey: (url, options) => {
        const params = new URLSearchParams(options?.params).toString();
        return `${url}${params ? '?' + params : ''}`;
      }
    },
    
    // 并发控制
    parallel: {
      maxConcurrent: 10,
      timeout: 60000
    },
    
    // 幂等性保证
    idempotent: {
      dedupeTime: 2000
    },
    
    // 超时控制
    timeout: {
      timeout: 5000
    }
  }
);

// 添加拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }
});

request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    console.log('Response:', response.status);
    return response;
  },
  onResponseError: (error) => {
    if (error.status === 401) {
      window.location.href = '/login';
    }
    throw error;
  }
});
```

## 环境特定配置

### 开发环境

```typescript
const isDev = process.env.NODE_ENV === 'development';

const request = new Request(
  new FetchRequestor({
    baseURL: isDev 
      ? 'http://localhost:3000/api'
      : 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    retry: {
      maxRetries: isDev ? 1 : 3  // 开发环境少重试
    },
    cache: {
      ttl: isDev ? 0 : 60000  // 开发环境不缓存
    }
  }
);
```

### 生产环境

```typescript
const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
    timeout: 10000
  }),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    },
    cache: {
      ttl: 300000  // 5 分钟缓存
    },
    parallel: {
      maxConcurrent: 10
    }
  }
);
```

## 相关

- [快速开始](/guide/getting-started)
- [核心功能](/guide/features/retry)
- [拦截器](/guide/advanced/interceptors)
