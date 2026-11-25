import { defineAngularServerTestConfig } from '../test-setup/vitest.shared.mts';

export default defineAngularServerTestConfig(import.meta.dirname, ['server/**/*.spec.ts']);
