import { Requestor, RequestOptions, Response, RequestError } from '../../interfaces/request';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: RequestError) => boolean | Promise<boolean>;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: RequestError) => error.status ? error.status >= 500 : true,
};

export function createRetryRequestor(
  requestor: Requestor,
  options?: RetryOptions
): Requestor {
  const finalOptions = { ...defaultRetryOptions, ...options };

  async function retryRequest<T>(
    request: () => Promise<Response<T>>,
    retries = 0
  ): Promise<Response<T>> {
    try {
      return await request();
    } catch (error) {
      const shouldRetry = await finalOptions.shouldRetry(error as RequestError);
      
      if (!shouldRetry || retries >= finalOptions.maxRetries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, finalOptions.retryDelay));
      return retryRequest(request, retries + 1);
    }
  }

  return {
    async get<T>(url: string, options?: RequestOptions) {
      return retryRequest(() => requestor.get<T>(url, options));
    },

    async post<T>(url: string, data?: any, options?: RequestOptions) {
      return retryRequest(() => requestor.post<T>(url, data, options));
    },

    async put<T>(url: string, data?: any, options?: RequestOptions) {
      return retryRequest(() => requestor.put<T>(url, data, options));
    },

    async delete<T>(url: string, options?: RequestOptions) {
      return retryRequest(() => requestor.delete<T>(url, options));
    },

    async patch<T>(url: string, data?: any, options?: RequestOptions) {
      return retryRequest(() => requestor.patch<T>(url, data, options));
    },
  };
} 