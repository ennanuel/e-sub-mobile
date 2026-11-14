import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a production build on the mock API (no backend needed).
 *   npx playwright install chromium   (once)
 *   npm run test:e2e
 * CHROMIUM_PATH can point at an existing Chromium instead of the downloaded one.
 */
const PORT = 3200;
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions,
  },
  projects: [
    { name: 'iphone-13', use: { ...devices['iPhone 13'], browserName: 'chromium', launchOptions } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'], launchOptions } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/developments/cityview`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_PUBLIC_API_MODE: 'mock', NEXT_PUBLIC_MOCK_DELAY_MS: '0', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
