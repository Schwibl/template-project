import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL lets CI point the same specs at a preview deploy.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // No local server when testing a remote preview.
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run build && npm run preview',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
