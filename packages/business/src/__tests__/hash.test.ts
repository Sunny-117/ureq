import { describe, it, expect } from 'vitest';
import { LibHashService } from '../services/hash';

describe('LibHashService', () => {
  const service = new LibHashService();

  describe('generateHash', () => {
    it('should generate consistent hash', () => {
      const hash1 = service.generateHash('test');
      const hash2 = service.generateHash('test');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different input', () => {
      const hash1 = service.generateHash('test1');
      const hash2 = service.generateHash('test2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateRequestHash', () => {
    it('should generate request hash', () => {
      const hash = service.generateRequestHash('GET', '/users');
      expect(typeof hash).toBe('string');
    });

    it('should generate same hash for same request', () => {
      const hash1 = service.generateRequestHash('GET', '/users', { id: 1 });
      const hash2 = service.generateRequestHash('GET', '/users', { id: 1 });
      expect(hash1).toBe(hash2);
    });
  });
});
