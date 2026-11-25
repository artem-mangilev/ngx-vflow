import { defineAngularTestConfig } from '../test-setup/vitest.shared.mts';

// The adapters live in subpath packages (`dagre`, `elk`, ...), each with its own `src` and specs next to its source.
export default defineAngularTestConfig(import.meta.dirname, ['src/**/*.spec.ts', '*/src/**/*.spec.ts']);
