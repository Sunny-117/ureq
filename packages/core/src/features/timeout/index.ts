import { Requestor, RequestOptions, Response, RequestError } from '../../interfaces/request';

export interface TimeoutOptions {
  timeout?: number;
  timeoutErrorMessage?: string;
}

const defaultOptions: Required<TimeoutOptions> = {
  timeout: 30000,
  timeoutErrorMessage: 'Request timeout',
};

export function createTimeoutRequestor(
  requestor: Requestor,
  options?: TimeoutOptions
): Requestor {
  const finalOptions = { ...defaultOptions, ...options };

  async function withTimeout<T>(
    request: () => Promise<Response<T>>,
    timeout: number = finalOptions.timeout
  ): Promise<Response<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await request();
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new Error(finalOptions.timeoutErrorMessage) as RequestError;
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      throw error;
    }
  }

  return {
    get: <T>(url: string, options?: RequestOptions) => {
      const signal = options?.signal;
      const mergedOptions = {
        ...options,
        signal: signal || new AbortController().signal,
      };
      return withTimeout(() => requestor.get<T>(url, mergedOptions));
    },

    post: <T>(url: string, data?: any, options?: RequestOptions) => {
      const signal = options?.signal;
      const mergedOptions = {
        ...options,
        signal: signal || new AbortController().signal,
      };
      return withTimeout(() => requestor.post<T>(url, data, mergedOptions));
    },

    put: <T>(url: string, data?: any, options?: RequestOptions) => {
      const signal = options?.signal;
      const mergedOptions = {
        ...options,
        signal: signal || new AbortController().signal,
      };
      return withTimeout(() => requestor.put<T>(url, data, mergedOptions));
    },

    delete: <T>(url: string, options?: RequestOptions) => {
      const signal = options?.signal;
      const mergedOptions = {
        ...options,
        signal: signal || new AbortController().signal,
      };
      return withTimeout(() => requestor.delete<T>(url, mergedOptions));
    },

    patch: <T>(url: string, data?: any, options?: RequestOptions) => {
      const signal = options?.signal;
      const mergedOptions = {
        ...options,
        signal: signal || new AbortController().signal,
      };
      return withTimeout(() => requestor.patch<T>(url, data, mergedOptions));
    },
  };
} 