# 快速开始

本指南将帮助你快速上手 @ureq。

## 安装

### 选择实现方式

@ureq 需要一个 HTTP 实现来工作。你可以选择：

::: code-group

```bash [Fetch (推荐)]
# 使用 npm
npm install @ureq/core @ureq/impl-fetch

# 使用 pnpm
pnpm add @ureq/core @ureq/impl-fetch

# 使用 yarn
yarn add @ureq/core @ureq/impl-fetch
```

```bash [Axios]
# 使用 npm
npm install @ureq/core @ureq/impl-axios

# 使用 pnpm
pnpm add @ureq/core @ureq/impl-axios

# 使用 yarn
yarn add @ureq/core @ureq/impl-axios
```

:::

::: tip 选择建议
- **Fetch** - 推荐用于现代浏览器和 Node.js 18+，包体积更小
- **Axios** - 如果需要更多功能或需要支持旧版本浏览器
:::

## 基础使用

### 创建请求实例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建一个基础的请求实例
const request = new Request(new FetchRequestor());
```

### 发起请求

```typescript
// GET 请求
const user = await request.get('https://jsonplaceholder.typicode.com/todos/1/users/1');

// POST 请求
const newUser = await request.post('https://jsonplaceholder.typicode.com/todos/1/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT 请求
const updatedUser = await request.put('https://jsonplaceholder.typicode.com/todos/1/users/1', {
  name: 'Jane Doe'
});

// DELETE 请求
await request.delete('https://jsonplaceholder.typicode.com/todos/1/users/1');

// PATCH 请求
const patchedUser = await request.patch('https://jsonplaceholder.typicode.com/todos/1/users/1', {
  email: 'newemail@example.com'
});
```

## 配置选项

### 基础配置

```typescript
import { FetchRequestor } from '@ureq/impl-fetch';

const requestor = new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  timeout: 5000
});

const request = new Request(requestor);
```

### 添加功能

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    // 重试配置
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    },
    // 缓存配置
    cache: {
      ttl: 60000 // 60 秒
    },
    // 超时配置
    timeout: {
      timeout: 5000 // 5 秒
    },
    // 并发控制
    parallel: {
      maxConcurrent: 5
    },
    // 幂等性保证
    idempotent: {
      dedupeTime: 1000
    }
  }
);
```

## 使用拦截器

拦截器允许你在请求发送前或响应返回后执行自定义逻辑。

### 请求拦截器

```typescript
// 添加认证 token
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

// 添加请求日志
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Request:', config.method, config.url);
    return config;
  }
});
```

### 响应拦截器

```typescript
// 处理响应数据
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  onResponseError: (error) => {
    console.error('Error:', error.message);
    throw error;
  }
});

// 自动刷新 token
request.interceptors.addResponseInterceptor({
  onResponseError: async (error) => {
    if (error.status === 401) {
      // 刷新 token 逻辑
      const newToken = await refreshToken();
      localStorage.setItem('token', newToken);
      
      // 重试原请求
      return request.request(
        error.config.method,
        error.config.url,
        error.config.data,
        error.config
      );
    }
    throw error;
  }
});
```

## 错误处理

```typescript
import { RequestError } from '@ureq/core';

try {
  const data = await request.get('/api/users');
} catch (error) {
  if (error instanceof RequestError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
    console.error('Retry count:', error.retryCount);
  }
}
```

## TypeScript 支持

@ureq 提供完整的 TypeScript 类型支持：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// 类型安全的请求
const user = await request.get<User>('/users/1');
console.log(user.name); // TypeScript 知道 user 的类型

const users = await request.get<User[]>('/users');
users.forEach(u => console.log(u.email)); // 完整的类型提示
```

## 完整示例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建配置好的请求实例
const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  {
    retry: { maxRetries: 3 },
    cache: { ttl: 60000 },
    timeout: { timeout: 5000 }
  }
);

// 添加认证拦截器
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

// 添加错误处理拦截器
request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    if (error.status === 401) {
      // 跳转到登录页
      window.location.href = '/login';
    }
    throw error;
  }
});

// 使用
async function fetchUsers() {
  try {
    const users = await request.get<User[]>('/users');
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}
```

## 下一步

- [重试功能](/guide/features/retry) - 了解如何配置智能重试
- [缓存功能](/guide/features/cache) - 学习如何使用请求缓存
- [拦截器](/guide/advanced/interceptors) - 深入了解拦截器的使用
- [查看示例](/examples/basic) - 查看更多实际使用示例
 