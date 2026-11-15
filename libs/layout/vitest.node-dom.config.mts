import { defineAngularNodeDomTestConfig } from '../test-setup/vitest.shared.mts';

export default defineAngularNodeDomTestConfig(import.meta.dirname, ['node-dom/**/*.spec.ts']);
