import { mergeTests } from '@playwright/test';
import { test as dbTest } from './db.fixture';
import { test as authTest } from './auth.fixture';

export const test = mergeTests(dbTest, authTest);
export { expect } from '@playwright/test';
