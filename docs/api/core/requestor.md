# Requestor API

Requestor 是 HTTP 请求器的接口定义，所有请求实现都需要实现此接口。

## 接口定义

```typescript
interface Requestor {
  get<T>(url: string, options?: RequestOptions): Promise<Response<T>>;
  post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  delete<T>(url: string, options?: RequestOptions): Promise<Response<T>>;
  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
}
```

## 方法说明

### get()

发起 GET 请求。

```typescript
get<T>(url: string, options?: RequestOptions): Promise<Response<T>>
```

### post()

发起 POST 请求。

```typescript
post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>
```

### put()

发起 PUT 请求。

```typescript
put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>
```

### delete()

发起 DELETE 请求。

```typescript
delete<T>(url: string, options?: RequestOptions): Promise<Response<T>>
```

### patch()

发起 PATCH 请求。

```typescript
patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>
```

## 类型定义

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

## 内置实现

@ureq 提供了两种内置实现：

- [FetchRequestor](/api/implementations/fetch) - 基于 Fetch API
- [AxiosRequestor](/api/implementations/axios) - 基于 Axios

## 自定义实现

你可以实现自己的 Requestor：

```typescript
import { Requestor, RequestOptions, Response } from '@ureq/core';

class MyRequestor implements Requestor {
  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    // 实现 GET 请求
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    // 实现 POST 请求
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    // 实现 PUT 请求
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    // 实现 DELETE 请求
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    // 实现 PATCH 请求
  }
}
```

## 相关

- [自定义请求器](/guide/advanced/custom-requestor)
- [FetchRequestor](/api/implementations/fetch)
- [AxiosRequestor](/api/implementations/axios)
