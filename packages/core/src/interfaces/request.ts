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
}

export interface Requestor {
  get<T = any>(url: string, options?: RequestOptions): Promise<Response<T>>;
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  delete<T = any>(url: string, options?: RequestOptions): Promise<Response<T>>;
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
} 