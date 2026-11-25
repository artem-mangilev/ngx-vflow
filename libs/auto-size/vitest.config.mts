import { defineAngularTestConfig } from '../test-setup/vitest.shared.mts';

export default defineAngularTestConfig(import.meta.dirname, ['src/**/*.spec.ts']);
