import { createTsupConfig } from '../../scripts/tsup.base';

export default createTsupConfig({
  entry: ['src/index.ts'],
  external: ['@ureq/lib-cache-store', '@ureq/lib-hash'],
  noExternal: [],
  clean: true,
  outDir: 'dist'
}); 