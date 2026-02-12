import { Requestor, RequestOptions, Response } from './interfaces/request';
import { InterceptorManager } from './interceptor';
import { createRetryRequestor, RetryOptions } from './features/retry';
import { CacheOptions, createCacheRequestor } from './features/cache';
import { createParallelRequestor, ParallelOptions } from './features/parallel';
import { createIdempotentRequestor, IdempotentOptions } from './features/idempotent';
import { createTimeoutRequestor, TimeoutOptions } from './features/timeout';

export interface RequestConfig {
  retry?: RetryOptions;
  cache?: CacheOptions;
  parallel?: ParallelOptions;
  idempotent?: IdempotentOptions;
  timeout?: TimeoutOptions;
}

/**
 * 创建拦截器包装的 Requestor
 * 这样每次实际发起请求时都会经过拦截器
 */
function createInterceptorRequestor(
  requestor: Requestor,
  interceptors: InterceptorManager
): Requestor {
  const wrapRequest = async <T>(
    method: string,
    url: string,
    data: any,
    options?: RequestOptions
  ): Promise<Response<T>> => {
    // 运行请求拦截器
    const config = await interceptors.runRequestInterceptors({
      ...options,
      method,
      url,
      data,
    });

    // 发起实际请求
    const methodLower = method.toLowerCase();
    let response: Response<T>;

    if (methodLower === 'get' || methodLower === 'delete') {
      response = await (requestor as any)[methodLower](config.url, config);
    } else {
      response = await (requestor as any)[methodLower](config.url, config.data, config);
    }

    // 运行响应拦截器
    return interceptors.runResponseInterceptors(response);
  };

  return {
    async get<T>(url: string, options?: RequestOptions) {
      return wrapRequest<T>('GET', url, undefined, options);
    },
    async post<T>(url: string, data?: any, options?: RequestOptions) {
      return wrapRequest<T>('POST', url, data, options);
    },
    async put<T>(url: string, data?: any, options?: RequestOptions) {
      return wrapRequest<T>('PUT', url, data, options);
    },
    async delete<T>(url: string, options?: RequestOptions) {
      return wrapRequest<T>('DELETE', url, undefined, options);
    },
    async patch<T>(url: string, data?: any, options?: RequestOptions) {
      return wrapRequest<T>('PATCH', url, data, options);
    },
  };
}

export class Request {
  private requestor: Requestor;
  public interceptors: InterceptorManager;

  constructor(baseRequestor: Requestor, config?: RequestConfig) {
    this.interceptors = new InterceptorManager();

    // 组合各种功能
    // 拦截器放在最内层，这样每次请求（包括重试）都会触发拦截器
    let requestor: Requestor = createInterceptorRequestor(baseRequestor, this.interceptors);

    if (config?.timeout) {
      requestor = createTimeoutRequestor(requestor, config.timeout);
    }

    if (config?.retry) {
      requestor = createRetryRequestor(requestor, config.retry);
    }

    if (config?.cache) {
      requestor = createCacheRequestor(requestor, config.cache);
    }

    if (config?.parallel) {
      requestor = createParallelRequestor(requestor, config.parallel);
    }

    if (config?.idempotent) {
      // 幂等
      requestor = createIdempotentRequestor(requestor, config.idempotent);
    }

    this.requestor = requestor;
  }

  async request<T>(method: string, url: string, data?: any, options?: RequestOptions): Promise<T> {
    // 拦截器已经在 createInterceptorRequestor 中处理
    // 直接调用 requestor，拦截器会在每次请求（包括重试）时自动触发
    const methodLower = method.toLowerCase();
    let response;

    if (methodLower === 'get' || methodLower === 'delete') {
      response = await (this.requestor as any)[methodLower](url, options);
    } else {
      response = await (this.requestor as any)[methodLower](url, data, options);
    }

    return response.data as T;
  }

  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request('GET', url, undefined, options);
  }

  post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request('POST', url, data, options);
  }

  put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request('PUT', url, data, options);
  }

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request('DELETE', url, undefined, options);
  }

  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request('PATCH', url, data, options);
  }

  // 实现其他方法...
} 