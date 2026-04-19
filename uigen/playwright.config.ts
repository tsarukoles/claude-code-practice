import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const TEST_DB_URL = 'file:./prisma/test.db';
const BASE_URL = 'http://localhost:3000';

export const STORAGE_STATE = path.join(__dirname, 'tests/fixtures/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  projects: [
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      testMatch: [
        '**/e2e/chat/authenticated-chat.spec.ts',
        '**/e2e/projects/**',
        '**/e2e/code-view/**',
      ],
    },
    {
      name: 'unauthenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: [
        '**/e2e/auth/**',
        '**/e2e/chat/anonymous-chat.spec.ts',
        '**/e2e/preview/**',
      ],
    },
    {
      name: 'api',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/api/**'],
    },
    {
      name: 'visual',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: ['**/visual/**'],
    },
    {
      name: 'performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/performance/**'],
    },
  ],

  webServer: {
    // CI uses `next start` (pre-built); local dev reuses the running dev server
    command: process.env.CI
      ? `node_modules/.bin/next start`
      : `node_modules/.bin/next dev --turbopack`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: TEST_DB_URL,
      NODE_OPTIONS: '--require ./node-compat.cjs',
    },
  },
});
