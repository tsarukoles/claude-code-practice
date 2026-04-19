import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { SEED_USER } from './utils/test-data';
import { cleanTestDb, disconnectTestPrisma } from './utils/db';

const STORAGE_STATE_PATH = path.join(__dirname, 'fixtures/.auth/user.json');

const BASE_URL = 'http://localhost:3000';

export default async function globalSetup(_config: FullConfig) {
  // Ensure .auth directory exists
  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });

  // Run migrations against test DB
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' },
    stdio: 'pipe',
  });

  // Wipe any leftover data from a previous run
  await cleanTestDb();
  await disconnectTestPrisma();

  // Sign up the seed user via the UI to capture the auth cookie
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);

  // Open Sign Up dialog
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.waitForSelector('[role="dialog"]');

  // Fill form
  await page.getByLabel('Email').fill(SEED_USER.email);
  await page.getByLabel('Password').nth(0).fill(SEED_USER.password);
  await page.getByLabel('Confirm Password').fill(SEED_USER.password);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Wait for dialog to close (auth succeeded)
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));

  // Save auth cookie
  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
}
