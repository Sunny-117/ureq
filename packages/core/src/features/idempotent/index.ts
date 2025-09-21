import { Requestor, RequestOptions, Response } from '../../interfaces/request';
import { HashService, DefaultHashService } from '@ureq/business';

interface PendingRequest<T> {
  promise: Promise<Response<T>>;
  timestamp: number;
}

export interface IdempotentOptions {
  // 请求合并的时间窗口，单位毫秒
  dedupeTime?: number;
  // 自定义请求标识生成函数
  getRequestId?: (method: string, url: string, data?: any, options?: RequestOptions) => string;
  // Hash service for generating request IDs
  hashService?: HashService;
}

const defaultHashService = new DefaultHashService();

const defaultOptions: Required<IdempotentOptions> = {
  dedupeTime: 1000,
  getRequestId: (method: string, url: string, data?: any, options?: RequestOptions) => {
    return defaultHashService.generateRequestHash(method, url, data, options);
  },
  hashService: defaultHashService,
};

export function createIdempotentRequestor(
  requestor: Requestor,
  options?: IdempotentOptions
): Requestor {
  const finalOptions = { ...defaultOptions, ...options };
  const pendingRequests = new Map<string, PendingRequest<any>>();

  function cleanupOldRequests() {
    const now = Date.now();
    for (const [key, request] of pendingRequests.entries()) {
      if (now - request.timestamp > finalOptions.dedupeTime) {
        pendingRequests.delete(key);
      }
    }
  }

  async function dedupeRequest<T>(
    method: string,
    url: string,
    requestFn: () => Promise<Response<T>>,
    data?: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    const requestId = finalOptions.getRequestId(method, url, data, options);
    
    cleanupOldRequests();

    const existing = pendingRequests.get(requestId);
    if (existing) {
      return existing.promise;
    }

    const promise = requestFn();
    pendingRequests.set(requestId, {
      promise,
      timestamp: Date.now(),
    });

    try {
      return await promise;
    } finally {
      pendingRequests.delete(requestId);
    }
  }

  return {
    get: <T>(url: string, options?: RequestOptions) => {
      return dedupeRequest('GET', url, () => requestor.get<T>(url, options), null, options);
    },

    post: <T>(url: string, data?: any, options?: RequestOptions) => {
      return dedupeRequest('POST', url, () => requestor.post<T>(url, data, options), data, options);
    },

    put: <T>(url: string, data?: any, options?: RequestOptions) => {
      return dedupeRequest('PUT', url, () => requestor.put<T>(url, data, options), data, options);
    },

    delete: <T>(url: string, options?: RequestOptions) => {
      return dedupeRequest('DELETE', url, () => requestor.delete<T>(url, options), null, options);
    },

    patch: <T>(url: string, data?: any, options?: RequestOptions) => {
      return dedupeRequest('PATCH', url, () => requestor.patch<T>(url, data, options), data, options);
    },
  };
} 