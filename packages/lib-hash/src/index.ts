export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

export function generateRequestHash(
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
  return generateHash(parts.join('|'));
} 