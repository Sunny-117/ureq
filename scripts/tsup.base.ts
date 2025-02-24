import { defineConfig } from 'tsup';
import type { Options } from 'tsup';

export function createTsupConfig(options: Options = {}) {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
      entry: './src/index.ts',
      compilerOptions: {
        composite: false,
        declaration: true,
        declarationMap: false
      }
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
    ...options
  });
} 