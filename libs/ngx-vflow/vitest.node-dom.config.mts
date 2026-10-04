import { defineAngularNodeDomTestConfig } from '../../vitest.shared.mts';

export default defineAngularNodeDomTestConfig(import.meta.dirname, ['node-dom/**/*.spec.ts']);
