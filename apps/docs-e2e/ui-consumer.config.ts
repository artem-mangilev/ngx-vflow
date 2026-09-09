import { defineConfig, devices } from '@playwright/test';
const mode = process.env['UI_CSS_MODE'] ?? 'compiled';
export default defineConfig({
  testDir: '.',
  testMatch: 'ui-consumer.check.ts',
  workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4201' },
  webServer: {
    command: `npx nx serve ui-consumer --configuration ${mode}`,
    cwd: '../..',
    url: 'http://localhost:4201',
    timeout: 180000,
    reuseExistingServer: false,
  },
});
