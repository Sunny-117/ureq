import { createTsupConfig } from '../../scripts/tsup.base';

export default createTsupConfig({
  external: ['@request/lib-cache-store', '@request/lib-hash']
}); 