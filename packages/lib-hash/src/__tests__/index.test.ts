import { describe, it, expect } from 'vitest';
import { generateHash, generateRequestHash } from '../index';

describe('generateHash', () => {
  it('should generate consistent hash for same input', () => {
    const hash1 = generateHash('test');
    const hash2 = generateHash('test');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different inputs', () => {
    const hash1 = generateHash('test1');
    const hash2 = generateHash('test2');
    expect(hash1).not.toBe(hash2);
  });

  it('should return a string', () => {
    const hash = generateHash('test');
    expect(typeof hash).toBe('string');
  });
});

describe('generateRequestHash', () => {
  it('should generate hash from method and url', () => {
    const hash = generateRequestHash('GET', '/users');
    expect(typeof hash).toBe('string');
  });

  it('should generate same hash for same request', () => {
    const hash1 = generateRequestHash('GET', '/users');
    const hash2 = generateRequestHash('GET', '/users');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different methods', () => {
    const hash1 = generateRequestHash('GET', '/users');
    const hash2 = generateRequestHash('POST', '/users');
    expect(hash1).not.toBe(hash2);
  });

  it('should include data in hash', () => {
    const hash1 = generateRequestHash('POST', '/users', { name: 'test' });
    const hash2 = generateRequestHash('POST', '/users', { name: 'different' });
    expect(hash1).not.toBe(hash2);
  });

  it('should normalize method to uppercase', () => {
    const hash1 = generateRequestHash('get', '/users');
    const hash2 = generateRequestHash('GET', '/users');
    expect(hash1).toBe(hash2);
  });
});
