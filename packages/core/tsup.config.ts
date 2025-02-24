import { createTsupConfig } from '../../scripts/tsup.base';

export default createTsupConfig({
  external: ['@ureq/lib-cache-store', '@ureq/lib-hash']
}); 