import { createTsupConfig } from '../../scripts/tsup.base';

export default createTsupConfig({
  entry: ['src/index.ts'],
  external: ['@ureq/core', '@ureq/impl-fetch', '@ureq/impl-axios'],
  noExternal: [],
  clean: true,
  outDir: 'dist'
});
