import { Requestor, RequestOptions } from './interfaces/request';
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

export class Request {
  private requestor: Requestor;
  public interceptors: InterceptorManager;

  constructor(baseRequestor: Requestor, config?: RequestConfig) {
    this.interceptors = new InterceptorManager();
    
    // 组合各种功能
    let requestor = baseRequestor;
    
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
      requestor = createIdempotentRequestor(requestor, config.idempotent);
    }
    
    this.requestor = requestor;
  }

  async request<T>(method: string, url: string, data?: any, options?: RequestOptions): Promise<T> {
    const config = await this.interceptors.runRequestInterceptors({
      ...options,
      method,
      url,
      data,
    });

    try {
      const methodLower = method.toLowerCase();
      let response;

      // GET 和 DELETE 方法不需要 data 参数
      if (methodLower === 'get' || methodLower === 'delete') {
        response = await (this.requestor as any)[methodLower](url, config);
      } else {
        response = await (this.requestor as any)[methodLower](url, data, config);
      }

      return (await this.interceptors.runResponseInterceptors(response)).data as T;
    } catch (error) {
      throw error;
    }
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