import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request } from '../request';
import { Requestor, Response, RequestOptions } from '../interfaces/request';

// Mock Requestor
const createMockRequestor = (): Requestor => ({
  get: vi.fn().mockResolvedValue({ data: { get: true }, status: 200, statusText: 'OK', headers: {} }),
  post: vi.fn().mockResolvedValue({ data: { post: true }, status: 201, statusText: 'Created', headers: {} }),
  put: vi.fn().mockResolvedValue({ data: { put: true }, status: 200, statusText: 'OK', headers: {} }),
  delete: vi.fn().mockResolvedValue({ data: { delete: true }, status: 204, statusText: 'No Content', headers: {} }),
  patch: vi.fn().mockResolvedValue({ data: { patch: true }, status: 200, statusText: 'OK', headers: {} }),
});

describe('Request', () => {
  let mockRequestor: Requestor;
  let request: Request;

  beforeEach(() => {
    mockRequestor = createMockRequestor();
    request = new Request(mockRequestor);
  });

  describe('HTTP Methods', () => {
    it('should make GET request', async () => {
      const result = await request.get('/users');

      expect(mockRequestor.get).toHaveBeenCalledWith('/users', expect.any(Object));
      expect(result).toEqual({ get: true });
    });

    it('should make POST request with data', async () => {
      const data = { name: 'test' };
      const result = await request.post('/users', data);

      expect(mockRequestor.post).toHaveBeenCalledWith('/users', data, expect.any(Object));
      expect(result).toEqual({ post: true });
    });

    it('should make PUT request with data', async () => {
      const data = { name: 'updated' };
      const result = await request.put('/users/1', data);

      expect(mockRequestor.put).toHaveBeenCalledWith('/users/1', data, expect.any(Object));
      expect(result).toEqual({ put: true });
    });

    it('should make DELETE request', async () => {
      const result = await request.delete('/users/1');

      expect(mockRequestor.delete).toHaveBeenCalledWith('/users/1', expect.any(Object));
      expect(result).toEqual({ delete: true });
    });

    it('should make PATCH request with data', async () => {
      const data = { name: 'patched' };
      const result = await request.patch('/users/1', data);

      expect(mockRequestor.patch).toHaveBeenCalledWith('/users/1', data, expect.any(Object));
      expect(result).toEqual({ patch: true });
    });
  });

  describe('Options passing', () => {
    it('should pass options to GET request', async () => {
      const options: RequestOptions = { headers: { 'X-Test': 'true' } };
      await request.get('/users', options);

      expect(mockRequestor.get).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({ headers: { 'X-Test': 'true' } })
      );
    });

    it('should pass responseType option', async () => {
      const options: RequestOptions = { responseType: 'text' };
      await request.get('/data', options);

      expect(mockRequestor.get).toHaveBeenCalledWith(
        '/data',
        expect.objectContaining({ responseType: 'text' })
      );
    });

    it('should pass responseTransformer option', async () => {
      const transformer = vi.fn();
      const options: RequestOptions = { responseTransformer: transformer };
      await request.get('/data', options);

      expect(mockRequestor.get).toHaveBeenCalledWith(
        '/data',
        expect.objectContaining({ responseTransformer: transformer })
      );
    });
  });

  describe('Interceptors', () => {
    it('should run request interceptors', async () => {
      const interceptor = {
        onRequest: vi.fn((config) => ({ ...config, headers: { 'X-Auth': 'token' } })),
      };
      request.interceptors.addRequestInterceptor(interceptor);

      await request.get('/users');

      expect(interceptor.onRequest).toHaveBeenCalled();
      expect(mockRequestor.get).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({ headers: { 'X-Auth': 'token' } })
      );
    });

    it('should run response interceptors', async () => {
      const interceptor = {
        onResponse: vi.fn((response) => ({ ...response, data: { ...response.data, intercepted: true } })),
      };
      request.interceptors.addResponseInterceptor(interceptor);

      const result = await request.get('/users');

      expect(interceptor.onResponse).toHaveBeenCalled();
      expect(result).toEqual({ get: true, intercepted: true });
    });
  });
});
