import { createTsupConfig } from '../../../scripts/tsup.base';

export default createTsupConfig({
  external: ['@ureq/core']
}); 