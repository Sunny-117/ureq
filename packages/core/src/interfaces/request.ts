/**
 * 响应类型
 */
export type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'formData';

/**
 * 响应转换器函数类型
 * @param response 原始响应对象（Fetch Response 或其他）
 * @returns 转换后的数据
 */
export type ResponseTransformer<T = any> = (response: any) => Promise<T>;

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  /**
   * 响应类型，用于指定如何解析响应体
   * @default 'json'
   */
  responseType?: ResponseType;
  /**
   * 自定义响应转换器，优先级高于 responseType
   * 当需要自定义响应解析逻辑时使用
   */
  responseTransformer?: ResponseTransformer;
  [key: string]: any;
}

export interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface RequestError extends Error {
  status?: number;
  code?: string;
  data?: any;
  url?: string;
  method?: string;
  timestamp?: number;
  retryCount?: number;
  isTimeout?: boolean;
  isNetworkError?: boolean;
  isAborted?: boolean;
}

export class UreqError extends Error implements RequestError {
  status?: number;
  code?: string;
  data?: any;
  url?: string;
  method?: string;
  timestamp: number;
  retryCount?: number;
  isTimeout?: boolean;
  isNetworkError?: boolean;
  isAborted?: boolean;

  constructor(message: string, options: Partial<RequestError> = {}) {
    super(message);
    this.name = 'UreqError';
    this.timestamp = Date.now();
    Object.assign(this, options);
  }
}

export class NetworkError extends UreqError {
  constructor(message: string, options: Partial<RequestError> = {}) {
    super(message, { ...options, isNetworkError: true });
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends UreqError {
  constructor(message: string, options: Partial<RequestError> = {}) {
    super(message, { ...options, isTimeout: true });
    this.name = 'TimeoutError';
  }
}

export class AbortError extends UreqError {
  constructor(message: string, options: Partial<RequestError> = {}) {
    super(message, { ...options, isAborted: true });
    this.name = 'AbortError';
  }
}

export class HttpError extends UreqError {
  constructor(message: string, status: number, options: Partial<RequestError> = {}) {
    super(message, { ...options, status });
    this.name = 'HttpError';
  }
}

export interface Requestor {
  get<T = any>(url: string, options?: RequestOptions): Promise<Response<T>>;
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  delete<T = any>(url: string, options?: RequestOptions): Promise<Response<T>>;
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
} 