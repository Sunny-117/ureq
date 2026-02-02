# 拦截器

拦截器允许你在请求发送前或响应返回后执行自定义逻辑。

## 请求拦截器

### 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

// 添加请求拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Request:', config.method, config.url);
    return config;
  }
});
```

### 添加认证 Token

```typescript
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
```

### 添加公共参数

```typescript
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    config.params = {
      ...config.params,
      timestamp: Date.now(),
      version: '1.0.0'
    };
    return config;
  }
});
```

### 请求日志

```typescript
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log(`[${new Date().toISOString()}] ${config.method} ${config.url}`);
    if (config.data) {
      console.log('Request Data:', config.data);
    }
    return config;
  }
});
```

## 响应拦截器

### 基础用法

```typescript
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  }
});
```

### 统一处理响应数据

```typescript
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    // 假设 API 返回格式为 { code, data, message }
    if (response.data.code === 0) {
      // 成功：直接返回数据部分
      return {
        ...response,
        data: response.data.data
      };
    } else {
      // 失败：抛出错误
      throw new Error(response.data.message);
    }
  }
});
```

### 错误处理

```typescript
request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    console.error('Request failed:', error.message);
    
    // 根据状态码处理
    if (error.status === 401) {
      // 未授权：跳转到登录页
      window.location.href = '/login';
    } else if (error.status === 403) {
      // 无权限
      alert('您没有权限访问此资源');
    } else if (error.status >= 500) {
      // 服务器错误
      alert('服务器错误，请稍后重试');
    }
    
    throw error;
  }
});
```

### 自动刷新 Token

```typescript
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

request.interceptors.addResponseInterceptor({
  onResponseError: async (error) => {
    const originalRequest = error.config;
    
    if (error.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return request.request(
            originalRequest.method,
            originalRequest.url,
            originalRequest.data,
            originalRequest
          );
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // 刷新 token
        const { token } = await refreshToken();
        localStorage.setItem('token', token);
        
        // 处理队列中的请求
        failedQueue.forEach(({ resolve }) => resolve(token));
        failedQueue = [];
        
        // 重试原请求
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return request.request(
          originalRequest.method,
          originalRequest.url,
          originalRequest.data,
          originalRequest
        );
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];
        window.location.href = '/login';
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    
    throw error;
  }
});
```

## 移除拦截器

```typescript
// 添加拦截器时会返回一个移除函数
const removeInterceptor = request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Request:', config.url);
    return config;
  }
});

// 移除拦截器
removeInterceptor();
```

## 多个拦截器

拦截器按添加顺序执行：

```typescript
// 第一个拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Interceptor 1');
    return config;
  }
});

// 第二个拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Interceptor 2');
    return config;
  }
});

// 执行顺序：Interceptor 1 -> Interceptor 2
```

## 实际示例

### 完整的认证流程

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  })
);

// 请求拦截器：添加 token
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

// 响应拦截器：处理 token 过期
request.interceptors.addResponseInterceptor({
  onResponseError: async (error) => {
    if (error.status === 401) {
      try {
        // 尝试刷新 token
        const { token } = await request.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken')
        });
        
        localStorage.setItem('token', token);
        
        // 重试原请求
        return request.request(
          error.config.method,
          error.config.url,
          error.config.data,
          error.config
        );
      } catch (refreshError) {
        // 刷新失败，清除 token 并跳转登录
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw refreshError;
      }
    }
    throw error;
  }
});
```

### 请求/响应日志

```typescript
// 请求日志
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    const timestamp = new Date().toISOString();
    console.group(`[${timestamp}] Request`);
    console.log('Method:', config.method);
    console.log('URL:', config.url);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();
    
    // 保存请求开始时间
    config._startTime = Date.now();
    return config;
  }
});

// 响应日志
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    const duration = Date.now() - response.config._startTime;
    const timestamp = new Date().toISOString();
    
    console.group(`[${timestamp}] Response (${duration}ms)`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
    
    return response;
  },
  onResponseError: (error) => {
    const duration = Date.now() - error.config._startTime;
    const timestamp = new Date().toISOString();
    
    console.group(`[${timestamp}] Error (${duration}ms)`);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.groupEnd();
    
    throw error;
  }
});
```

### 加载状态管理

```typescript
let loadingCount = 0;

// 请求开始：显示加载
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    loadingCount++;
    if (loadingCount === 1) {
      showLoading();
    }
    return config;
  }
});

// 响应结束：隐藏加载
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

## 注意事项

1. **执行顺序** - 拦截器按添加顺序执行
2. **返回值** - 请求拦截器必须返回 config，响应拦截器必须返回 response
3. **错误处理** - 错误拦截器中要 throw error，否则会被当作成功处理
4. **异步操作** - 拦截器支持异步操作（async/await）
5. **避免循环** - 在拦截器中发起请求要小心避免无限循环

## 相关

- [Request API](/api/core/request)
- [Interceptor API](/api/core/interceptor)
- [错误处理](/guide/advanced/error-handling)
