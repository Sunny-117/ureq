# 拦截器示例

实际使用拦截器的示例。

## 认证 Token

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
}));

// 添加 Token
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

// 使用
const users = await request.get('/users');
```

## 自动刷新 Token

```typescript
let isRefreshing = false;
let failedQueue: any[] = [];

request.interceptors.addResponseInterceptor({
  onResponseError: async (error) => {
    const originalRequest = error.config;
    
    if (error.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const { token } = await refreshToken();
        localStorage.setItem('token', token);
        
        failedQueue.forEach(({ resolve }) => resolve(token));
        failedQueue = [];
        
        return request.request(
          originalRequest.method,
          originalRequest.url,
          originalRequest.data,
          originalRequest
        );
      } catch (err) {
        failedQueue.forEach(({ reject }) => reject(err));
        failedQueue = [];
        window.location.href = '/login';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    
    throw error;
  }
});
```

## 请求日志

```typescript
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log(`[${new Date().toISOString()}] ${config.method} ${config.url}`);
    config._startTime = Date.now();
    return config;
  }
});

request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    const duration = Date.now() - response.config._startTime;
    console.log(`[${new Date().toISOString()}] Response ${response.status} (${duration}ms)`);
    return response;
  }
});
```

## 加载状态

```typescript
let loadingCount = 0;

request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    loadingCount++;
    if (loadingCount === 1) {
      showLoading();
    }
    return config;
  }
});

request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    loadingCount--;
    if (loadingCount === 0) {
      hideLoading();
    }
    return response;
  },
  onResponseError: (error) => {
    loadingCount--;
    if (loadingCount === 0) {
      hideLoading();
    }
    throw error;
  }
});
```

## 统一错误处理

```typescript
request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    const message = {
      400: '请求参数错误',
      401: '未授权，请登录',
      403: '无权限访问',
      404: '资源不存在',
      500: '服务器错误'
    }[error.status] || '请求失败';
    
    showNotification({ type: 'error', message });
    
    if (error.status === 401) {
      window.location.href = '/login';
    }
    
    throw error;
  }
});
```

## 相关

- [拦截器指南](/guide/advanced/interceptors)
- [错误处理](/guide/advanced/error-handling)
- [基本用法](/examples/basic)
