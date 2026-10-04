import { defineAngularTestConfig } from '../../vitest.shared.mts';

export default defineAngularTestConfig(import.meta.dirname, ['src/**/*.spec.ts']);
