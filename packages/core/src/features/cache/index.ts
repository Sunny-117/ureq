import { Requestor, RequestOptions, Response } from '../../interfaces/request';
import { CacheStore, MemoryCacheStore } from '@ureq/business';

export interface CacheOptions {
  ttl?: number;
  store?: CacheStore;
  getCacheKey?: (url: string, options?: RequestOptions) => string;
}

const defaultCacheOptions: Required<CacheOptions> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  store: new MemoryCacheStore(),
  getCacheKey: (url: string, options?: RequestOptions) => {
    return `${url}${options ? JSON.stringify(options) : ''}`;
  },
};

export function createCacheRequestor(
  requestor: Requestor,
  options?: CacheOptions
): Requestor {
  const finalOptions = { ...defaultCacheOptions, ...options };

  async function cacheRequest<T>(
    key: string,
    request: () => Promise<Response<T>>
  ): Promise<Response<T>> {
    const cached = await finalOptions.store.get<Response<T>>(key);
    if (cached) {
      return cached;
    }

    const response = await request();
    await finalOptions.store.set(key, response, finalOptions.ttl);
    return response;
  }

  return {
    async get<T>(url: string, options?: RequestOptions) {
      const key = finalOptions.getCacheKey(url, options);
      return cacheRequest(key, () => requestor.get<T>(url, options));
    },

    // POST, PUT, DELETE, PATCH methods don't use cache
    post: requestor.post.bind(requestor),
    put: requestor.put.bind(requestor),
    delete: requestor.delete.bind(requestor),
    patch: requestor.patch.bind(requestor),
  };
} 