import { generateHash, generateRequestHash } from '@ureq/lib-hash';
import { HashService } from '../interfaces/hash.js';

/**
 * Hash service implementation using @ureq/lib-hash
 */
export class LibHashService implements HashService {
  generateHash(input: string): string {
    return generateHash(input);
  }

  generateRequestHash(
    method: string,
    url: string,
    data?: any,
    options?: Record<string, any>
  ): string {
    return generateRequestHash(method, url, data, options);
  }
}
