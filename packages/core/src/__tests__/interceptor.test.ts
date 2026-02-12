import { describe, it, expect, vi } from 'vitest';
import { InterceptorManager } from '../interceptor';

describe('InterceptorManager', () => {
  describe('Request Interceptors', () => {
    it('should add and run request interceptors', async () => {
      const manager = new InterceptorManager();
      const interceptor = {
        onRequest: vi.fn((config) => ({ ...config, headers: { 'X-Test': 'true' } })),
      };

      manager.addRequestInterceptor(interceptor);
      const result = await manager.runRequestInterceptors({ url: '/test' });

      expect(interceptor.onRequest).toHaveBeenCalledWith({ url: '/test' });
      expect(result.headers).toEqual({ 'X-Test': 'true' });
    });

    it('should run multiple request interceptors in order', async () => {
      const manager = new InterceptorManager();
      const order: number[] = [];

      manager.addRequestInterceptor({
        onRequest: (config) => {
          order.push(1);
          return { ...config, step1: true };
        },
      });

      manager.addRequestInterceptor({
        onRequest: (config) => {
          order.push(2);
          return { ...config, step2: true };
        },
      });

      const result = await manager.runRequestInterceptors({ url: '/test' });

      expect(order).toEqual([1, 2]);
      expect(result.step1).toBe(true);
      expect(result.step2).toBe(true);
    });

    it('should remove request interceptor when calling the returned function', async () => {
      const manager = new InterceptorManager();
      const interceptor = {
        onRequest: vi.fn((config) => config),
      };

      const remove = manager.addRequestInterceptor(interceptor);
      remove();

      await manager.runRequestInterceptors({ url: '/test' });
      expect(interceptor.onRequest).not.toHaveBeenCalled();
    });
  });

  describe('Response Interceptors', () => {
    it('should add and run response interceptors', async () => {
      const manager = new InterceptorManager();
      const interceptor = {
        onResponse: vi.fn((response) => ({ ...response, modified: true })),
      };

      manager.addResponseInterceptor(interceptor);
      const result = await manager.runResponseInterceptors({
        data: { test: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      expect(interceptor.onResponse).toHaveBeenCalled();
      expect(result.modified).toBe(true);
    });

    it('should run multiple response interceptors in order', async () => {
      const manager = new InterceptorManager();
      const order: number[] = [];

      manager.addResponseInterceptor({
        onResponse: (response) => {
          order.push(1);
          return { ...response, step1: true };
        },
      });

      manager.addResponseInterceptor({
        onResponse: (response) => {
          order.push(2);
          return { ...response, step2: true };
        },
      });

      const result = await manager.runResponseInterceptors({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      expect(order).toEqual([1, 2]);
      expect(result.step1).toBe(true);
      expect(result.step2).toBe(true);
    });

    it('should remove response interceptor when calling the returned function', async () => {
      const manager = new InterceptorManager();
      const interceptor = {
        onResponse: vi.fn((response) => response),
      };

      const remove = manager.addResponseInterceptor(interceptor);
      remove();

      await manager.runResponseInterceptors({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });
      expect(interceptor.onResponse).not.toHaveBeenCalled();
    });
  });
});
