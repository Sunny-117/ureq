import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosRequestor } from '../index';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    })),
  },
}));

describe('AxiosRequestor', () => {
  let requestor: AxiosRequestor;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({
        data: { test: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      }),
      post: vi.fn().mockResolvedValue({
        data: { created: true },
        status: 201,
        statusText: 'Created',
        headers: {},
      }),
      put: vi.fn().mockResolvedValue({
        data: { updated: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      }),
      delete: vi.fn().mockResolvedValue({
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
      }),
      patch: vi.fn().mockResolvedValue({
        data: { patched: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      }),
    };
    (axios.create as any).mockReturnValue(mockAxiosInstance);
    requestor = new AxiosRequestor();
  });

  describe('constructor', () => {
    it('should create axios instance with options', () => {
      new AxiosRequestor({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: { 'X-Custom': 'value' },
      });

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: { 'X-Custom': 'value' },
      });
    });
  });

  describe('GET request', () => {
    it('should make GET request', async () => {
      const response = await requestor.get('/users');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', expect.any(Object));
      expect(response.data).toEqual({ test: true });
      expect(response.status).toBe(200);
    });

    it('should pass responseType option', async () => {
      await requestor.get('/data', { responseType: 'blob' });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/data',
        expect.objectContaining({ responseType: 'blob' })
      );
    });
  });

  describe('POST request', () => {
    it('should make POST request with data', async () => {
      const data = { name: 'test' };
      const response = await requestor.post('/users', data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', data, expect.any(Object));
      expect(response.data).toEqual({ created: true });
      expect(response.status).toBe(201);
    });
  });

  describe('PUT request', () => {
    it('should make PUT request with data', async () => {
      const data = { name: 'updated' };
      const response = await requestor.put('/users/1', data);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', data, expect.any(Object));
      expect(response.data).toEqual({ updated: true });
    });
  });

  describe('DELETE request', () => {
    it('should make DELETE request', async () => {
      const response = await requestor.delete('/users/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', expect.any(Object));
      expect(response.status).toBe(204);
    });
  });

  describe('PATCH request', () => {
    it('should make PATCH request with data', async () => {
      const data = { name: 'patched' };
      const response = await requestor.patch('/users/1', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1', data, expect.any(Object));
      expect(response.data).toEqual({ patched: true });
    });
  });

  describe('responseTransformer', () => {
    it('should use custom responseTransformer', async () => {
      const response = await requestor.get('/data', {
        responseTransformer: async (res) => {
          return { transformed: true, original: res.data };
        },
      });

      expect(response.data).toEqual({ transformed: true, original: { test: true } });
    });
  });

  describe('Error handling', () => {
    it('should throw error on request failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(requestor.get('/fail')).rejects.toThrow();
    });
  });
});
