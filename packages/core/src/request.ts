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
      // 使用类型断言和映射类型来解决索引签名问题
      type RequestMethod = keyof Requestor;
      const requestMethod = method.toLowerCase() as RequestMethod;
      const response = await this.requestor[requestMethod](url, data, config);
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

  // 实现其他方法...
} 