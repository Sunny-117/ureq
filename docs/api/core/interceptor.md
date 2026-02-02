# Interceptor API

拦截器管理器，用于添加和管理请求/响应拦截器。

## InterceptorManager

### addRequestInterceptor()

添加请求拦截器。

```typescript
addRequestInterceptor(interceptor: RequestInterceptor): () => void
```

**参数：**

```typescript
interface RequestInterceptor {
  onRequest?(config: RequestOptions): Promise<RequestOptions> | RequestOptions;
  onRequestError?(error: any): Promise<any>;
}
```

**返回值：** 返回一个函数，调用该函数可以移除此拦截器。

**示例：**

```typescript
const removeInterceptor = request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    return config;
  },
  onRequestError: (error) => {
    console.error('Request error:', error);
    throw error;
  }
});

// 移除拦截器
removeInterceptor();
```

### addResponseInterceptor()

添加响应拦截器。

```typescript
addResponseInterceptor(interceptor: ResponseInterceptor): () => void
```

**参数：**

```typescript
interface ResponseInterceptor {
  onResponse?<T>(response: Response<T>): Promise<Response<T>> | Response<T>;
  onResponseError?(error: RequestError): Promise<any>;
}
```

**返回值：** 返回一个函数，调用该函数可以移除此拦截器。

**示例：**

```typescript
const removeInterceptor = request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    console.log('Response:', response.status);
    return response;
  },
  onResponseError: (error) => {
    console.error('Response error:', error);
    throw error;
  }
});

// 移除拦截器
removeInterceptor();
```

## 类型定义

### RequestInterceptor

```typescript
interface RequestInterceptor {
  onRequest?(config: RequestOptions): Promise<RequestOptions> | RequestOptions;
  onRequestError?(error: any): Promise<any>;
}
```

### ResponseInterceptor

```typescript
interface ResponseInterceptor {
  onResponse?<T>(response: Response<T>): Promise<Response<T>> | Response<T>;
  onResponseError?(error: RequestError): Promise<any>;
}
```

### RequestOptions

```typescript
interface RequestOptions {
  method?: string;
  url?: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  [key: string]: any;
}
```

### Response

```typescript
interface Response<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestOptions;
}
```

## 完整示例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

// 添加请求拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    // 添加时间戳
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    return config;
  }
});

// 添加响应拦截器
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    // 统一处理响应数据
    if (response.data.code === 0) {
      return {
        ...response,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message);
    }
  },
  onResponseError: (error) => {
    // 统一错误处理
    if (error.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
});
```

## 相关

- [拦截器指南](/guide/advanced/interceptors)
- [Request API](/api/core/request)
- [错误处理](/guide/advanced/error-handling)
