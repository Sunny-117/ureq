/**
 * Hash service interface for generating request identifiers
 */
export interface HashService {
  /**
   * Generate a hash from a string input
   */
  generateHash(input: string): string;
  
  /**
   * Generate a hash for a request based on method, URL, data, and options
   */
  generateRequestHash(
    method: string,
    url: string,
    data?: any,
    options?: Record<string, any>
  ): string;
}

/**
 * Default hash service implementation using simple hash algorithm
 */
export class DefaultHashService implements HashService {
  generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  generateRequestHash(
    method: string,
    url: string,
    data?: any,
    options?: Record<string, any>
  ): string {
    const parts = [
      method.toUpperCase(),
      url,
      data ? JSON.stringify(data) : '',
      options ? JSON.stringify(options) : ''
    ];
    return this.generateHash(parts.join('|'));
  }
}
