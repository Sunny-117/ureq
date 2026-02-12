import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryStore } from '../memory';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      store.set('key', 'value');
      expect(store.get('key')).toBe('value');
    });

    it('should store objects', () => {
      const obj = { name: 'test', count: 1 };
      store.set('obj', obj);
      expect(store.get('obj')).toEqual(obj);
    });

    it('should return undefined for non-existent keys', () => {
      expect(store.get('nonexistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      store.set('key', 'value');
      expect(store.has('key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(store.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove items', () => {
      store.set('key', 'value');
      store.delete('key');
      expect(store.get('key')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      store.set('key1', 'value1');
      store.set('key2', 'value2');
      store.clear();
      expect(store.get('key1')).toBeUndefined();
      expect(store.get('key2')).toBeUndefined();
    });
  });

  describe('TTL', () => {
    it('should return value before TTL expires', () => {
      store.set('key', 'value', 1000);
      expect(store.get('key')).toBe('value');
    });

    it('should return undefined after TTL expires', async () => {
      vi.useFakeTimers();
      store.set('key', 'value', 100);

      // Advance time past TTL
      vi.advanceTimersByTime(150);

      expect(store.get('key')).toBeUndefined();
      vi.useRealTimers();
    });
  });
});
