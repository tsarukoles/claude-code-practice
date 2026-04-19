import { cleanTestDb, disconnectTestPrisma } from './utils/db';

export default async function globalTeardown() {
  await cleanTestDb();
  await disconnectTestPrisma();
}
