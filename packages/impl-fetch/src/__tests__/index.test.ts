import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchRequestor } from '../index';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FetchRequestor', () => {
  let requestor: FetchRequestor;

  beforeEach(() => {
    vi.clearAllMocks();
    requestor = new FetchRequestor();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const instance = new FetchRequestor();
      expect(instance).toBeInstanceOf(FetchRequestor);
    });

    it('should create instance with baseURL', () => {
      const instance = new FetchRequestor({ baseURL: 'https://api.example.com' });
      expect(instance).toBeInstanceOf(FetchRequestor);
    });
  });

  describe('GET request', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const response = await requestor.get('/users');

      expect(mockFetch).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'GET' }));
      expect(response.data).toEqual({ data: 'test' });
      expect(response.status).toBe(200);
    });

    it('should handle text responseType', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('plain text response'),
        headers: new Headers(),
      });

      const response = await requestor.get('/text', { responseType: 'text' });

      expect(response.data).toBe('plain text response');
    });

    it('should handle blob responseType', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers(),
      });

      const response = await requestor.get('/image', { responseType: 'blob' });

      expect(response.data).toBe(mockBlob);
    });

    it('should handle arraybuffer responseType', async () => {
      const mockBuffer = new ArrayBuffer(16);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: () => Promise.resolve(mockBuffer),
        headers: new Headers(),
      });

      const response = await requestor.get('/binary', { responseType: 'arraybuffer' });

      expect(response.data).toBe(mockBuffer);
    });

    it('should use custom responseTransformer', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ nested: { value: 'extracted' } }),
        headers: new Headers(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await requestor.get('/data', {
        responseTransformer: async (res) => {
          const json = await res.json();
          return json.nested.value;
        },
      });

      expect(response.data).toBe('extracted');
    });
  });

  describe('POST request', () => {
    it('should make POST request with data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
        headers: new Headers(),
      });

      const response = await requestor.post('/users', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
      expect(response.status).toBe(201);
    });
  });

  describe('Error handling', () => {
    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(requestor.get('/not-found')).rejects.toThrow();
    });

    it('should throw error for network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(requestor.get('/fail')).rejects.toThrow();
    });
  });

  describe('baseURL', () => {
    it('should prepend baseURL to requests', async () => {
      const instance = new FetchRequestor({ baseURL: 'https://api.example.com' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Headers(),
      });

      await instance.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      );
    });
  });

  describe('Headers', () => {
    it('should include default headers', async () => {
      const instance = new FetchRequestor({
        defaultHeaders: { 'X-Custom': 'value' },
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Headers(),
      });

      await instance.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' }),
        })
      );
    });

    it('should merge request headers with default headers', async () => {
      const instance = new FetchRequestor({
        defaultHeaders: { 'X-Default': 'default' },
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Headers(),
      });

      await instance.get('/users', { headers: { 'X-Request': 'request' } });

      expect(mockFetch).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Default': 'default',
            'X-Request': 'request',
          }),
        })
      );
    });
  });
});
