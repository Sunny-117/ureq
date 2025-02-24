import { createTsupConfig } from '../../../scripts/tsup.base';

export default createTsupConfig({
  external: ['@request/core']
}); 