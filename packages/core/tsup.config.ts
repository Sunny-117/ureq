import { defineConfig } from 'tsup';

export default defineConfig({
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
  external: [],
  noExternal: [],
  outDir: 'dist'
});