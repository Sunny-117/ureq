# 自定义请求器

实现自己的 HTTP 客户端适配器。

## Requestor 接口

所有请求器都需要实现 `Requestor` 接口：

```typescript
interface Requestor {
  get<T>(url: string, options?: RequestOptions): Promise<Response<T>>;
  post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  delete<T>(url: string, options?: RequestOptions): Promise<Response<T>>;
  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
}
```

## 基础实现

### 简单的 Fetch 请求器

```typescript
import { Requestor, RequestOptions, Response } from '@ureq/core';

class SimpleFetchRequestor implements Requestor {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    const fullURL = this.baseURL + url;
    
    const response = await fetch(fullURL, {
      method,
      headers: options?.headers,
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.json();

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config: { method, url, data, ...options }
    };
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PATCH', url, data, options);
  }
}

// 使用
const request = new Request(new SimpleFetchRequestor('https://api.example.com'));
```

## 高级实现

### 带配置的请求器

```typescript
interface RequestorConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
}

class CustomRequestor implements Requestor {
  private config: RequestorConfig;

  constructor(config: RequestorConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    };
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    const fullURL = this.config.baseURL + url;
    
    // 转换请求数据
    const transformedData = this.config.transformRequest
      ? this.config.transformRequest(data)
      : data;

    // 合并 headers
    const headers = {
      ...this.config.headers,
      ...options?.headers
    };

    // 创建 AbortController 用于超时
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(fullURL, {
        method,
        headers,
        body: transformedData ? JSON.stringify(transformedData) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let responseData = await response.json();

      // 转换响应数据
      if (this.config.transformResponse) {
        responseData = this.config.transformResponse(responseData);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: { method, url, data, ...options }
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PATCH', url, data, options);
  }
}
```

## 实际示例

### XMLHttpRequest 请求器

```typescript
class XHRRequestor implements Requestor {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullURL = this.baseURL + url;

      xhr.open(method, fullURL);

      // 设置 headers
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.onload = () => {
        const response: Response<T> = {
          data: JSON.parse(xhr.responseText),
          status: xhr.status,
          statusText: xhr.statusText,
          headers: {},
          config: { method, url, data, ...options }
        };

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.send(data ? JSON.stringify(data) : undefined);
    });
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PATCH', url, data, options);
  }
}
```

### Node.js HTTP 请求器

```typescript
import http from 'http';
import https from 'https';
import { URL } from 'url';

class NodeRequestor implements Requestor {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      const fullURL = new URL(this.baseURL + url);
      const client = fullURL.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: fullURL.hostname,
        port: fullURL.port,
        path: fullURL.pathname + fullURL.search,
        method,
        headers: options?.headers || {}
      };

      const req = client.request(requestOptions, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          const response: Response<T> = {
            data: JSON.parse(body),
            status: res.statusCode || 0,
            statusText: res.statusMessage || '',
            headers: res.headers as Record<string, string>,
            config: { method, url, data, ...options }
          };

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    return this.request<T>('PATCH', url, data, options);
  }
}
```

## 使用自定义请求器

```typescript
import { Request } from '@ureq/core';

// 使用自定义请求器
const request = new Request(
  new CustomRequestor({
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: {
      'X-Custom-Header': 'value'
    },
    transformResponse: (data) => {
      // 统一处理响应数据
      return data.result;
    }
  }),
  {
    retry: { maxRetries: 3 },
    cache: { ttl: 60000 }
  }
);

// 正常使用
const data = await request.get('/users');
```

## 注意事项

1. **接口实现** - 必须实现所有 Requestor 接口方法
2. **错误处理** - 要正确处理网络错误和 HTTP 错误
3. **类型安全** - 使用 TypeScript 泛型保证类型安全
4. **响应格式** - 返回的 Response 对象要符合接口定义

## 相关

- [Requestor API](/api/core/requestor)
- [FetchRequestor](/api/implementations/fetch)
- [AxiosRequestor](/api/implementations/axios)
