export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  responseType?: 'arraybuffer' | 'json' | 'text' | 'blob';
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