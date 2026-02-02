import { Requestor, RequestOptions, Response } from '../../interfaces/request';

export interface ParallelOptions {
  maxConcurrent?: number;
  timeout?: number;
}

const defaultParallelOptions: Required<ParallelOptions> = {
  maxConcurrent: 5,
  timeout: 30000,
};

class RequestQueue {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(private maxConcurrent: number) {}

  async add<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

export function createParallelRequestor(
  requestor: Requestor,
  options?: ParallelOptions
): Requestor {
  const finalOptions = { ...defaultParallelOptions, ...options };
  const queue = new RequestQueue(finalOptions.maxConcurrent);

  return {
    async get<T>(url: string, options?: RequestOptions) {
      return queue.add(() => requestor.get<T>(url, options));
    },

    async post<T>(url: string, data?: any, options?: RequestOptions) {
      return queue.add(() => requestor.post<T>(url, data, options));
    },

    async put<T>(url: string, data?: any, options?: RequestOptions) {
      return queue.add(() => requestor.put<T>(url, data, options));
    },

    async delete<T>(url: string, options?: RequestOptions) {
      return queue.add(() => requestor.delete<T>(url, options));
    },

    async patch<T>(url: string, data?: any, options?: RequestOptions) {
      return queue.add(() => requestor.patch<T>(url, data, options));
    },
  };
} 