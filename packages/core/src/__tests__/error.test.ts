import { describe, it, expect } from 'vitest';
import {
  UreqError,
  NetworkError,
  TimeoutError,
  AbortError,
  HttpError,
} from '../interfaces/request';
import { createRequestError } from '../utils/error';

describe('Error Classes', () => {
  describe('UreqError', () => {
    it('should create error with message', () => {
      const error = new UreqError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('UreqError');
      expect(error.timestamp).toBeDefined();
    });

    it('should create error with options', () => {
      const error = new UreqError('Test error', {
        status: 500,
        code: 'ERR_TEST',
        url: '/test',
        method: 'GET',
      });

      expect(error.status).toBe(500);
      expect(error.code).toBe('ERR_TEST');
      expect(error.url).toBe('/test');
      expect(error.method).toBe('GET');
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Network failed');
      expect(error.name).toBe('NetworkError');
      expect(error.isNetworkError).toBe(true);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Request timeout');
      expect(error.name).toBe('TimeoutError');
      expect(error.isTimeout).toBe(true);
    });
  });

  describe('AbortError', () => {
    it('should create abort error', () => {
      const error = new AbortError('Request aborted');
      expect(error.name).toBe('AbortError');
      expect(error.isAborted).toBe(true);
    });
  });

  describe('HttpError', () => {
    it('should create HTTP error with status', () => {
      const error = new HttpError('Not Found', 404);
      expect(error.name).toBe('HttpError');
      expect(error.status).toBe(404);
    });
  });

  describe('createRequestError', () => {
    it('should create error from Error object', () => {
      const originalError = new Error('Original error');
      const error = createRequestError(originalError, { method: 'GET', url: '/test' });

      expect(error).toBeInstanceOf(UreqError);
      expect(error.message).toBe('Original error');
      expect(error.method).toBe('GET');
      expect(error.url).toBe('/test');
    });

    it('should create error from string', () => {
      const error = createRequestError('String error', { method: 'POST' });

      expect(error).toBeInstanceOf(UreqError);
      // createRequestError 会使用 error.message，字符串没有 message 属性
      expect(error.message).toBe('Unknown error occurred');
    });

    it('should create error from unknown type', () => {
      const error = createRequestError({ unknown: true }, {});

      expect(error).toBeInstanceOf(UreqError);
      expect(error.message).toBe('Unknown error occurred');
    });
  });
});
